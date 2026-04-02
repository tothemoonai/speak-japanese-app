package com.speakjapanese.app.localasr

import android.content.Context
import android.util.Log
import com.k2fsa.sherpa.onnx.*
import java.io.File
import java.io.FileOutputStream

/**
 * SenseVoice ASR wrapper using sherpa-onnx native library.
 *
 * Loads models from the filesystem (downloaded on demand) rather than APK assets,
 * because the model files are too large to bundle (228MB-894MB).
 *
 * Tokens.txt is copied from APK assets to the filesystem models directory on first init.
 */
class SenseVoiceASR(private val context: Context, private val modelsDir: String) {
    companion object {
        private const val TAG = "SenseVoiceASR"
        const val SAMPLE_RATE = 16000

        const val MODEL_INT8 = "int8"
        const val MODEL_FP32 = "fp32"
    }

    private var recognizer: OfflineRecognizer? = null
    private var currentModelType: String = MODEL_INT8
    private var currentLanguage: String = ""

    /**
     * Copy tokens.txt from APK assets to the filesystem models directory.
     * Called automatically during initialize() if the file doesn't exist yet.
     */
    private fun ensureTokensFile(): File {
        val tokensFile = File(modelsDir, "tokens.txt")
        if (!tokensFile.exists()) {
            Log.d(TAG, "Copying tokens.txt from assets to ${tokensFile.absolutePath}")
            tokensFile.parentFile?.mkdirs()
            context.assets.open("tokens.txt").use { input ->
                FileOutputStream(tokensFile).use { output ->
                    input.copyTo(output)
                }
            }
        }
        return tokensFile
    }

    /**
     * Initialize the ASR recognizer with the specified model type and language.
     *
     * @param modelType MODEL_INT8 or MODEL_FP32
     * @param language Language code (e.g., "ja", "zh", "en", or "" for auto-detect)
     * @return true if initialization succeeded
     */
    fun initialize(modelType: String = MODEL_INT8, language: String = ""): Boolean {
        return try {
            // Release existing recognizer if switching models
            recognizer?.release()
            recognizer = null

            currentModelType = modelType
            currentLanguage = language

            val modelFileName = when (modelType) {
                MODEL_FP32 -> "sense_voice_fp32.onnx"
                else -> "sense_voice_int8.onnx"
            }
            val modelFile = File(modelsDir, modelFileName)

            if (!modelFile.exists()) {
                Log.e(TAG, "Model file not found: ${modelFile.absolutePath}")
                return false
            }

            val tokensFile = ensureTokensFile()
            val tokensPath = tokensFile.absolutePath

            Log.d(TAG, "Initializing SenseVoice with ${modelFile.absolutePath}, language: $language")

            val config = OfflineRecognizerConfig(
                featConfig = FeatureConfig(
                    sampleRate = 16000,
                    featureDim = 80
                ),
                modelConfig = OfflineModelConfig(
                    senseVoice = OfflineSenseVoiceModelConfig(
                        model = modelFile.absolutePath,
                        language = language,
                        useInverseTextNormalization = true
                    ),
                    tokens = tokensPath,
                    numThreads = 2,
                    debug = false,
                    provider = "cpu"
                ),
                decodingMethod = "greedy_search"
            )

            // Use filesystem mode (assetManager = null) since models are on disk, not in assets
            recognizer = OfflineRecognizer(
                assetManager = null,
                config = config
            )

            Log.d(TAG, "SenseVoice initialized with ${getModelName()}, language: $language")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize SenseVoice: ${e.message}", e)
            false
        }
    }

    fun getModelType(): String = currentModelType

    fun getModelName(): String = when (currentModelType) {
        MODEL_FP32 -> "FP32 (894MB)"
        else -> "INT8 (228MB)"
    }

    fun isInitialized(): Boolean = recognizer != null

    /**
     * Transcribe audio samples to text.
     *
     * @param audioSamples Float array of PCM audio samples at 16kHz
     * @return TranscribeResult with recognized text and inference time
     */
    fun transcribe(audioSamples: FloatArray): TranscribeResult {
        val rec = recognizer ?: return TranscribeResult("", 0L)

        val startTime = System.currentTimeMillis()
        Log.d(TAG, ">>> Transcribe [${getModelName()}], samples: ${audioSamples.size}")

        try {
            val stream = rec.createStream()
            stream.acceptWaveform(audioSamples, sampleRate = 16000)
            rec.decode(stream)

            val result = rec.getResult(stream)
            stream.release()

            val elapsed = System.currentTimeMillis() - startTime
            Log.d(TAG, ">>> Done in ${elapsed}ms: ${result.text}")

            return TranscribeResult(result.text, elapsed)
        } catch (e: Exception) {
            Log.e(TAG, "Transcribe error: ${e.message}", e)
            return TranscribeResult("", 0L)
        }
    }

    fun close() {
        recognizer?.release()
        recognizer = null
        Log.d(TAG, "SenseVoice released")
    }

    data class TranscribeResult(
        val text: String,
        val inferenceTimeMs: Long
    )
}
