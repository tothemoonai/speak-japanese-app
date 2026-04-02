package com.speakjapanese.app.localasr

import android.Manifest
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import kotlinx.coroutines.*

@CapacitorPlugin(
    name = "LocalASR",
    permissions = [
        Permission(strings = [Manifest.permission.RECORD_AUDIO], alias = "record_audio")
    ]
)
class LocalASRPlugin : Plugin() {
    companion object {
        private const val TAG = "LocalASRPlugin"
        private const val SAMPLE_RATE = 16000
        private const val WINDOW_SIZE = 512
        private const val MAX_SPEECH_FRAMES = 10 * 1000 / 32 // 10 seconds
    }

    private lateinit var senseVoice: SenseVoiceASR
    private var sileroVAD: SileroVAD? = null
    private lateinit var modelManager: ModelManager
    private val pluginScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private var audioRecord: AudioRecord? = null
    private var recordingJob: Job? = null
    @Volatile private var isRecording = false

    private val audioBuffer = mutableListOf<FloatArray>()
    @Volatile private var isCollectingSpeech = false

    override fun load() {
        val context = context ?: return
        val modelsDir = context.filesDir.absolutePath + "/models"
        modelManager = ModelManager(context)
        senseVoice = SenseVoiceASR(context, modelsDir)
        Log.d(TAG, "Plugin loaded")
    }

    @PluginMethod
    fun checkModelStatus(call: PluginCall) {
        try {
            val status = modelManager.checkModelStatus()
            val result = JSObject()
            result.put("int8", status["int8"])
            result.put("fp32", status["fp32"])
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to check model status: ${e.message}")
        }
    }

    @PluginMethod
    fun downloadModel(call: PluginCall) {
        val type = call.getString("type", "int8")
        if (type != "int8" && type != "fp32") {
            call.reject("Invalid model type: $type")
            return
        }

        modelManager.downloadModel(type, object : ModelManager.DownloadCallback {
            override fun onProgress(progress: Int) {
                val data = JSObject()
                data.put("progress", progress)
                notifyListeners("downloadProgress", data)
            }
            override fun onComplete() {
                call.resolve()
            }
            override fun onError(message: String) {
                call.reject(message)
            }
        })
    }

    @PluginMethod
    fun deleteModel(call: PluginCall) {
        val type = call.getString("type", "int8")
        if (type != "int8" && type != "fp32") {
            call.reject("Invalid model type: $type")
            return
        }
        val success = modelManager.deleteModel(type)
        if (success) {
            call.resolve()
        } else {
            call.reject("Failed to delete model")
        }
    }

    @PluginMethod
    fun initialize(call: PluginCall) {
        val modelType = call.getString("modelType", "int8") ?: "int8"
        val language = call.getString("language", "ja") ?: "ja"

        // Init VAD (lazy, once)
        try {
            if (sileroVAD == null) {
                sileroVAD = SileroVAD(context)
            }
        } catch (e: Exception) {
            Log.e(TAG, "VAD init failed: ${e.message}")
            call.reject("VAD initialization failed: ${e.message}")
            return
        }

        // Init ASR
        val success = senseVoice.initialize(modelType, language)
        if (success) {
            val result = JSObject()
            result.put("success", true)
            call.resolve(result)
        } else {
            call.reject("ASR initialization failed. Model may not be downloaded.")
        }
    }

    @PluginMethod
    fun release(call: PluginCall) {
        senseVoice.close()
        sileroVAD?.close()
        sileroVAD = null
        call.resolve()
    }

    @PluginMethod
    fun startRecording(call: PluginCall) {
        if (isRecording) {
            call.reject("Already recording")
            return
        }
        if (!senseVoice.isInitialized()) {
            call.reject("ASR not initialized. Call initialize() first.")
            return
        }

        // Request RECORD_AUDIO permission if not granted
        if (getPermissionState("record_audio") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("record_audio", call, "permissionCallback")
            return
        }

        doStartRecording(call)
    }

    @com.getcapacitor.annotation.PermissionCallback
    private fun permissionCallback(call: PluginCall) {
        if (getPermissionState("record_audio") == com.getcapacitor.PermissionState.GRANTED) {
            doStartRecording(call)
        } else {
            call.reject("Microphone permission denied")
        }
    }

    private fun doStartRecording(call: PluginCall) {

        val minBufferSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_FLOAT
        )

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_FLOAT,
            maxOf(minBufferSize, WINDOW_SIZE * 4)
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            call.reject("AudioRecord initialization failed")
            return
        }

        sileroVAD?.reset()
        audioBuffer.clear()
        isCollectingSpeech = false
        isRecording = true

        audioRecord?.startRecording()

        recordingJob = pluginScope.launch {
            val buffer = FloatArray(WINDOW_SIZE)
            var speechFrameCount = 0

            try {
                while (isActive && isRecording) {
                    val readCount = audioRecord?.read(buffer, 0, WINDOW_SIZE, AudioRecord.READ_BLOCKING)
                        ?: break

                    if (readCount != WINDOW_SIZE) continue

                    val vadResult = sileroVAD?.processWithState(buffer) ?: continue

                    // Collect audio during speech
                    if (vadResult.isSpeech || isCollectingSpeech) {
                        if (vadResult.speechStart) {
                            audioBuffer.clear()
                            isCollectingSpeech = true
                            speechFrameCount = 0

                            withContext(Dispatchers.Main) {
                                val vadData = JSObject()
                                vadData.put("isSpeech", true)
                                notifyListeners("vadState", vadData)
                            }
                        }

                        if (isCollectingSpeech && audioBuffer.size < MAX_SPEECH_FRAMES) {
                            audioBuffer.add(buffer.copyOf())
                            speechFrameCount++
                        }
                    }

                    // When speech ends, run ASR
                    if (vadResult.speechEnd && audioBuffer.isNotEmpty()) {
                        isCollectingSpeech = false
                        val speechDurationMs = speechFrameCount * 32

                        if (speechDurationMs > 300) {
                            // Flatten buffer to single FloatArray
                            val totalSize = audioBuffer.sumOf { it.size }
                            val audioData = FloatArray(totalSize)
                            var offset = 0
                            for (chunk in audioBuffer) {
                                System.arraycopy(chunk, 0, audioData, offset, chunk.size)
                                offset += chunk.size
                            }

                            // Launch transcription in separate coroutine so recording continues
                            pluginScope.launch(Dispatchers.Default) {
                                val result = senseVoice.transcribe(audioData)
                                if (result.text.isNotEmpty()) {
                                    withContext(Dispatchers.Main) {
                                        val resultData = JSObject()
                                        resultData.put("text", result.text)
                                        notifyListeners("asrResult", resultData)
                                    }
                                }
                            }
                        }

                        audioBuffer.clear()
                        speechFrameCount = 0

                        withContext(Dispatchers.Main) {
                            val vadData = JSObject()
                            vadData.put("isSpeech", false)
                            notifyListeners("vadState", vadData)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Recording loop error: ${e.message}", e)
            } finally {
                cleanupRecording()
            }
        }

        call.resolve()
    }

    @PluginMethod
    fun stopRecording(call: PluginCall) {
        cleanupRecording()
        call.resolve()
    }

    private fun cleanupRecording() {
        isRecording = false
        isCollectingSpeech = false
        recordingJob?.cancel()
        recordingJob = null
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
        audioBuffer.clear()
    }

    override fun handleOnDestroy() {
        cleanupRecording()
        senseVoice.close()
        sileroVAD?.close()
        modelManager.destroy()
        pluginScope.cancel()
        super.handleOnDestroy()
    }
}
