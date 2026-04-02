package com.speakjapanese.app.localasr

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorInputStream
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import java.io.BufferedInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * Manages ASR model files: download, status checking, deletion.
 *
 * Downloads a tar.bz2 archive from GitHub Releases containing SenseVoice models,
 * extracts specific model files (int8 and/or fp32), and manages the models directory.
 *
 * Models directory: context.filesDir/models/
 * Model files: sense_voice_int8.onnx (228MB), sense_voice_fp32.onnx (894MB)
 */
class ModelManager(private val context: Context) {

    companion object {
        private const val TAG = "ModelManager"

        const val MODEL_INT8 = "int8"
        const val MODEL_FP32 = "fp32"

        const val FILE_INT8 = "sense_voice_int8.onnx"
        const val FILE_FP32 = "sense_voice_fp32.onnx"
        const val FILE_TOKENS = "tokens.txt"

        private const val DOWNLOAD_URL =
            "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17.tar.bz2"
        private const val ARCHIVE_NAME = "sherpa-onnx-sense-voice.tar.bz2"

        // Archive entry names to look for
        private const val ARCHIVE_INT8_ENTRY = "model.int8.onnx"
        private const val ARCHIVE_FP32_ENTRY = "model.onnx"
        private const val ARCHIVE_TOKENS_ENTRY = "tokens.txt"

        // Required storage buffer (archive is ~1.1GB, extracted models up to ~1.1GB)
        private const val REQUIRED_STORAGE_BYTES = 1_200_000_000L

        // Progress allocation
        private const val PROGRESS_DOWNLOAD_END = 70
        private const val PROGRESS_EXTRACT_START = 72
        private const val PROGRESS_EXTRACT_END = 95
    }

    private val coroutineScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    interface DownloadCallback {
        fun onProgress(progress: Int) // 0-100
        fun onComplete()
        fun onError(message: String)
    }

    /**
     * Returns the models directory, creating it if necessary.
     */
    fun getModelsDir(): File {
        val dir = File(context.filesDir, "models")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        return dir
    }

    /**
     * Check which models are currently downloaded.
     *
     * @return Map with keys "int8" and "fp32" indicating whether each model exists.
     */
    fun checkModelStatus(): Map<String, Boolean> {
        val modelsDir = getModelsDir()
        val int8Exists = File(modelsDir, FILE_INT8).exists() && File(modelsDir, FILE_INT8).length() > 0
        val fp32Exists = File(modelsDir, FILE_FP32).exists() && File(modelsDir, FILE_FP32).length() > 0
        return mapOf(
            MODEL_INT8 to int8Exists,
            MODEL_FP32 to fp32Exists
        )
    }

    /**
     * Get the file size of a model in bytes.
     *
     * @param type MODEL_INT8 or MODEL_FP32
     * @return File size in bytes, or 0 if the file does not exist.
     */
    fun getModelFileSize(type: String): Long {
        val fileName = when (type) {
            MODEL_FP32 -> FILE_FP32
            else -> FILE_INT8
        }
        val file = File(getModelsDir(), fileName)
        return if (file.exists()) file.length() else 0L
    }

    /**
     * Get available storage space in bytes on the device.
     */
    fun getAvailableStorage(): Long {
        return context.filesDir.usableSpace
    }

    /**
     * Delete a model file.
     *
     * @param type MODEL_INT8 or MODEL_FP32
     * @return true if deletion succeeded or file did not exist.
     */
    fun deleteModel(type: String): Boolean {
        val fileName = when (type) {
            MODEL_FP32 -> FILE_FP32
            else -> FILE_INT8
        }
        val file = File(getModelsDir(), fileName)
        return if (file.exists()) {
            val deleted = file.delete()
            if (deleted) {
                Log.d(TAG, "Deleted model: $fileName")
            } else {
                Log.e(TAG, "Failed to delete model: $fileName")
            }
            deleted
        } else {
            true
        }
    }

    /**
     * Download and extract a model from the GitHub Releases archive.
     *
     * The tar.bz2 archive contains both int8 and fp32 models. This method downloads
     * the full archive and extracts only the requested model type plus tokens.txt.
     *
     * @param type MODEL_INT8 or MODEL_FP32
     * @param callback Progress and completion callback
     * @return Job that can be cancelled to abort the download
     */
    fun downloadModel(type: String, callback: DownloadCallback): Job {
        return coroutineScope.launch {
            try {
                val modelsDir = getModelsDir()
                val targetFile = when (type) {
                    MODEL_FP32 -> File(modelsDir, FILE_FP32)
                    else -> File(modelsDir, FILE_INT8)
                }

                // Check if model already exists
                if (targetFile.exists() && targetFile.length() > 0) {
                    Log.d(TAG, "Model $type already exists at ${targetFile.absolutePath}")
                    callback.onProgress(100)
                    callback.onComplete()
                    return@launch
                }

                // Check available storage
                val available = getAvailableStorage()
                if (available < REQUIRED_STORAGE_BYTES) {
                    val availableMB = available / (1024.0 * 1024.0)
                    val requiredMB = REQUIRED_STORAGE_BYTES / (1024.0 * 1024.0)
                    callback.onError(
                        "Insufficient storage. Need ${"%.0f".format(requiredMB)}MB, " +
                                "available ${"%.0f".format(availableMB)}MB"
                    )
                    return@launch
                }

                // Download archive to temp file
                val tempArchive = File(modelsDir, ARCHIVE_NAME)
                try {
                    downloadArchive(tempArchive, callback)

                    if (!isActive) {
                        cleanupTempFile(tempArchive)
                        return@launch
                    }

                    // Extract the requested model
                    extractModel(tempArchive, type, modelsDir, callback)

                    if (!isActive) {
                        cleanupTempFile(tempArchive)
                        return@launch
                    }

                    // Clean up archive
                    cleanupTempFile(tempArchive)

                    callback.onProgress(100)
                    callback.onComplete()
                    Log.d(TAG, "Model $type download and extraction complete")

                } catch (e: Exception) {
                    cleanupTempFile(tempArchive)
                    // Delete partially extracted model file
                    if (targetFile.exists()) {
                        targetFile.delete()
                    }
                    throw e
                }

            } catch (e: kotlinx.coroutines.CancellationException) {
                Log.d(TAG, "Model download cancelled for type: $type")
                // Cleanup handled in finally or catch above
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Model download failed for type $type: ${e.message}", e)
                callback.onError("Download failed: ${e.message}")
            }
        }
    }

    /**
     * Download the tar.bz2 archive with progress reporting (0-70%).
     */
    private suspend fun downloadArchive(
        tempArchive: File,
        callback: DownloadCallback
    ) {
        Log.d(TAG, "Starting download from $DOWNLOAD_URL")
        callback.onProgress(0)

        val url = URL(DOWNLOAD_URL)
        val connection = url.openConnection() as HttpURLConnection
        connection.connectTimeout = 30_000
        connection.readTimeout = 60_000
        connection.setRequestProperty("Accept", "application/octet-stream")

        try {
            connection.responseCode // Trigger the connection
            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                throw Exception("HTTP ${connection.responseCode}: ${connection.responseMessage}")
            }

            val contentLength = connection.contentLengthLong
            Log.d(TAG, "Archive size: ${"%.1f".format(contentLength / (1024.0 * 1024.0))}MB")

            var totalRead = 0L
            var lastProgress = 0

            connection.inputStream.buffered().use { input ->
                FileOutputStream(tempArchive).use { output ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int

                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        if (!isActive) return

                        output.write(buffer, 0, bytesRead)
                        totalRead += bytesRead

                        // Report download progress (0-70%)
                        if (contentLength > 0) {
                            val progress = ((totalRead.toFloat() / contentLength) * PROGRESS_DOWNLOAD_END).toInt()
                            if (progress > lastProgress) {
                                lastProgress = progress
                                callback.onProgress(progress)
                            }
                        }
                    }
                }
            }

            Log.d(TAG, "Download complete: ${"%.1f".format(totalRead / (1024.0 * 1024.0))}MB")

        } finally {
            connection.disconnect()
        }
    }

    /**
     * Extract a specific model file from the tar.bz2 archive with progress reporting (72-95%).
     *
     * Extracts the requested model file and tokens.txt if not already present.
     */
    private fun extractModel(
        tempArchive: File,
        type: String,
        modelsDir: File,
        callback: DownloadCallback
    ) {
        callback.onProgress(PROGRESS_EXTRACT_START)
        Log.d(TAG, "Extracting model type: $type from archive")

        val targetFileName = when (type) {
            MODEL_FP32 -> FILE_FP32
            else -> FILE_INT8
        }
        val targetFile = File(modelsDir, targetFileName)

        // Determine which archive entry to look for
        val desiredEntrySuffix = when (type) {
            MODEL_FP32 -> ARCHIVE_FP32_ENTRY  // "model.onnx" (not containing "int8")
            else -> ARCHIVE_INT8_ENTRY         // "model.int8.onnx"
        }

        var modelExtracted = false
        var tokensExtracted = false
        val tokensFile = File(modelsDir, FILE_TOKENS)
        val needsTokens = !tokensFile.exists()

        FileInputStream(tempArchive).use { fis ->
            BufferedInputStream(fis).use { bis ->
                BZip2CompressorInputStream(bis).use { bzipInput ->
                    TarArchiveInputStream(bzipInput).use { tarInput ->
                        var entry = tarInput.nextTarEntry
                        var entriesProcessed = 0

                        while (entry != null) {
                            if (entry.isDirectory) {
                                entry = tarInput.nextTarEntry
                                continue
                            }

                            val entryName = entry.name
                            Log.d(TAG, "Archive entry: $entryName")

                            // Extract the requested model
                            if (!modelExtracted) {
                                val shouldExtract = if (type == MODEL_FP32) {
                                    // For fp32: match entries ending with "model.onnx" but NOT containing "int8"
                                    entryName.endsWith(ARCHIVE_FP32_ENTRY) &&
                                            !entryName.contains("int8")
                                } else {
                                    // For int8: match entries ending with "model.int8.onnx"
                                    entryName.endsWith(ARCHIVE_INT8_ENTRY)
                                }

                                if (shouldExtract) {
                                    Log.d(TAG, "Extracting $entryName -> ${targetFile.absolutePath}")
                                    extractEntry(tarInput, targetFile)
                                    modelExtracted = true
                                }
                            }

                            // Extract tokens.txt if needed
                            if (!tokensExtracted && needsTokens && entryName.endsWith(ARCHIVE_TOKENS_ENTRY)) {
                                Log.d(TAG, "Extracting $entryName -> ${tokensFile.absolutePath}")
                                extractEntry(tarInput, tokensFile)
                                tokensExtracted = true
                            }

                            // If we got both, we can stop early
                            if (modelExtracted && (tokensExtracted || !needsTokens)) {
                                break
                            }

                            entriesProcessed++
                            // Report extraction progress (72-95%)
                            val progress = (PROGRESS_EXTRACT_START +
                                    ((entriesProcessed.toFloat() / 100) * (PROGRESS_EXTRACT_END - PROGRESS_EXTRACT_START)).toInt())
                                    .coerceAtMost(PROGRESS_EXTRACT_END)
                            callback.onProgress(progress)

                            entry = tarInput.nextTarEntry
                        }
                    }
                }
            }
        }

        if (!modelExtracted) {
            throw Exception("Could not find $desiredEntrySuffix in archive")
        }

        Log.d(TAG, "Model extraction complete: ${targetFile.absolutePath} (${targetFile.length()} bytes)")
        callback.onProgress(PROGRESS_EXTRACT_END)
    }

    /**
     * Extract a single tar entry to a file.
     */
    private fun extractEntry(tarInput: TarArchiveInputStream, outputFile: File) {
        outputFile.parentFile?.mkdirs()
        FileOutputStream(outputFile).use { output ->
            val buffer = ByteArray(8192)
            var bytesRead: Int
            while (tarInput.read(buffer).also { bytesRead = it } != -1) {
                output.write(buffer, 0, bytesRead)
            }
        }
    }

    /**
     * Delete a temp file if it exists.
     */
    private fun cleanupTempFile(file: File) {
        if (file.exists()) {
            val deleted = file.delete()
            if (deleted) {
                Log.d(TAG, "Cleaned up temp file: ${file.name}")
            } else {
                Log.w(TAG, "Failed to clean up temp file: ${file.name}")
            }
        }
    }

    /**
     * Cancel all running coroutines and release resources.
     */
    fun destroy() {
        coroutineScope.coroutineContext[Job]?.cancel()
        Log.d(TAG, "ModelManager destroyed, coroutines cancelled")
    }
}
