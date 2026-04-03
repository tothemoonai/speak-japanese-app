package com.speakjapanese.app.localasr

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch
import org.apache.commons.compress.compressors.bzip2.BZip2CompressorInputStream
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import java.io.BufferedInputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicLong

/**
 * Manages ASR model files: download, status checking, deletion.
 *
 * Downloads a tar.bz2 archive from GitHub Releases containing SenseVoice models,
 * extracts specific model files (int8 and/or fp32), and manages the models directory.
 *
 * Supports:
 * - Multi-threaded download (splits file into chunks, downloads in parallel)
 * - Resumable download (continues from where it left off if interrupted)
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
        private const val PROGRESS_DOWNLOAD_END = 69
        private const val PROGRESS_DOWNLOAD_DONE = 70
        private const val PROGRESS_EXTRACT_START = 71
        private const val PROGRESS_EXTRACT_END = 99

        // Multi-threaded download settings
        private const val THREAD_COUNT = 4
        private const val BUFFER_SIZE = 8192
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
     * Uses multi-threaded download with resume support for the tar.bz2 archive,
     * then extracts only the requested model type plus tokens.txt.
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
                    downloadArchiveMultiThread(tempArchive, callback)

                    currentCoroutineContext().ensureActive()

                    // Signal download complete, about to extract
                    callback.onProgress(PROGRESS_DOWNLOAD_DONE)

                    // Extract the requested model
                    extractModel(tempArchive, type, modelsDir, callback)

                    currentCoroutineContext().ensureActive()

                    // Clean up archive
                    cleanupTempFile(tempArchive)

                    callback.onProgress(100)
                    callback.onComplete()
                    Log.d(TAG, "Model $type download and extraction complete")

                } catch (e: Exception) {
                    // Keep complete archive for re-extraction on retry
                    // Only delete if archive is incomplete (download failed)
                    if (tempArchive.exists() && tempArchive.length() > 0) {
                        // Query expected size to check if archive is complete
                        try {
                            val fileInfo = queryFileInfo()
                            if (tempArchive.length() != fileInfo.contentLength) {
                                // Incomplete archive, delete it
                                cleanupTempFile(tempArchive)
                            } else {
                                Log.d(TAG, "Keeping complete archive for retry: ${tempArchive.length()} bytes")
                            }
                        } catch (ignored: Exception) {
                            // Can't verify, keep the file optimistically
                            Log.d(TAG, "Keeping archive (can't verify size): ${tempArchive.length()} bytes")
                        }
                    }
                    // Delete partially extracted model file
                    if (targetFile.exists()) {
                        targetFile.delete()
                    }
                    throw e
                }

            } catch (e: kotlinx.coroutines.CancellationException) {
                Log.d(TAG, "Model download cancelled for type: $type")
                // Keep partial chunks for resume
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Model download failed for type $type: ${e.message}", e)
                callback.onError("Download failed: ${e.message}")
            }
        }
    }

    /**
     * Query the server for file info (size, range support) via HEAD request.
     */
    private data class FileInfo(
        val contentLength: Long,
        val acceptRanges: Boolean
    )

    private fun queryFileInfo(): FileInfo {
        val url = URL(DOWNLOAD_URL)
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "HEAD"
        connection.connectTimeout = 15_000
        connection.readTimeout = 15_000

        try {
            connection.responseCode
            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                throw Exception("HEAD request failed: HTTP ${connection.responseCode}")
            }

            val contentLength = connection.contentLengthLong
            val acceptRanges = connection.getHeaderField("Accept-Ranges")?.equals("bytes", ignoreCase = true) == true

            Log.d(TAG, "Server info: contentLength=${contentLength}, acceptRanges=$acceptRanges")
            return FileInfo(contentLength, acceptRanges)
        } finally {
            connection.disconnect()
        }
    }

    /**
     * Multi-threaded download with resume support.
     *
     * Splits the file into [THREAD_COUNT] chunks and downloads them in parallel.
     * Each chunk can resume from where it left off if a partial file exists.
     * Falls back to single-threaded resume if server doesn't support Range.
     */
    private suspend fun downloadArchiveMultiThread(
        tempArchive: File,
        callback: DownloadCallback
    ) {
        callback.onProgress(0)
        Log.d(TAG, "Starting multi-threaded download from $DOWNLOAD_URL")

        val fileInfo = queryFileInfo()
        val totalSize = fileInfo.contentLength

        if (totalSize <= 0) {
            throw Exception("Invalid content length: $totalSize")
        }

        Log.d(TAG, "Archive size: ${"%.1f".format(totalSize / (1024.0 * 1024.0))}MB")

        // If server doesn't support Range, fall back to single-threaded resume
        if (!fileInfo.acceptRanges) {
            Log.d(TAG, "Server does not support Range, falling back to single-threaded download")
            downloadSingleThreadResume(tempArchive, totalSize, callback)
            return
        }

        // If a complete archive already exists (from previous attempt), skip download
        if (tempArchive.exists() && tempArchive.length() == totalSize) {
            Log.d(TAG, "Complete archive already exists, skipping download")
            callback.onProgress(PROGRESS_DOWNLOAD_END)
            return
        }

        // If a partial merged file exists from a failed merge attempt, delete it
        if (tempArchive.exists()) {
            tempArchive.delete()
        }

        val modelsDir = tempArchive.parentFile!!
        val totalDownloaded = AtomicLong(0)
        var lastProgress = 0

        // Calculate chunk ranges
        val chunkSize = totalSize / THREAD_COUNT
        val chunks = (0 until THREAD_COUNT).map { i ->
            val start = i * chunkSize
            val end = if (i == THREAD_COUNT - 1) totalSize - 1 else (i + 1) * chunkSize - 1
            val chunkFile = File(modelsDir, "$ARCHIVE_NAME.part$i")
            ChunkInfo(i, start, end, chunkFile)
        }

        // Count already downloaded bytes for progress
        var alreadyDone = 0L
        for (chunk in chunks) {
            if (chunk.file.exists()) {
                val existingSize = chunk.file.length()
                if (existingSize > 0 && existingSize <= (chunk.end - chunk.start + 1)) {
                    alreadyDone += existingSize
                }
            }
        }
        totalDownloaded.set(alreadyDone)
        if (alreadyDone > 0) {
            Log.d(TAG, "Resuming from ${"%.1f".format(alreadyDone / (1024.0 * 1024.0))}MB already downloaded")
        }

        // Report initial progress from resumed state
        if (alreadyDone > 0 && totalSize > 0) {
            val initialProgress = ((alreadyDone.toFloat() / totalSize) * PROGRESS_DOWNLOAD_END).toInt()
            if (initialProgress > lastProgress) {
                lastProgress = initialProgress
                callback.onProgress(initialProgress)
            }
        }

        // Download all chunks in parallel
        try {
            coroutineScope {
                chunks.map { chunk ->
                    async(Dispatchers.IO) {
                        downloadChunk(chunk, totalSize, totalDownloaded) { progress ->
                            // Throttled progress reporting
                            if (progress > lastProgress) {
                                lastProgress = progress
                                callback.onProgress(progress)
                            }
                        }
                    }
                }.awaitAll()
            }

            currentCoroutineContext().ensureActive()

            // Merge chunks into final archive
            Log.d(TAG, "Merging ${chunks.size} chunks...")
            mergeChunks(chunks, tempArchive, totalSize)

            // Clean up chunk files after successful merge
            for (chunk in chunks) {
                chunk.file.delete()
            }

            Log.d(TAG, "Download complete: ${"%.1f".format(totalSize / (1024.0 * 1024.0))}MB")

        } catch (e: Exception) {
            Log.e(TAG, "Multi-threaded download failed: ${e.message}")
            // Keep chunk files for resume, only clean up on merge failure
            throw e
        }
    }

    private data class ChunkInfo(
        val index: Int,
        val start: Long,
        val end: Long,
        val file: File
    )

    /**
     * Download a single chunk with resume support.
     * If the partial file exists and is smaller than the chunk, resumes from where it left off.
     */
    private suspend fun downloadChunk(
        chunk: ChunkInfo,
        totalSize: Long,
        totalDownloaded: AtomicLong,
        onProgressUpdate: (Int) -> Unit
    ) {
        val chunkSize = chunk.end - chunk.start + 1
        var existingSize = 0L

        // Check for existing partial chunk
        if (chunk.file.exists()) {
            existingSize = chunk.file.length()
            if (existingSize >= chunkSize) {
                // Chunk already complete
                Log.d(TAG, "Chunk ${chunk.index} already complete")
                return
            }
            if (existingSize > 0) {
                Log.d(TAG, "Chunk ${chunk.index}: resuming from ${existingSize} bytes")
            }
        }

        val url = URL(DOWNLOAD_URL)
        val connection = url.openConnection() as HttpURLConnection
        connection.connectTimeout = 30_000
        connection.readTimeout = 60_000
        connection.setRequestProperty("Accept", "application/octet-stream")

        // Set Range header: resume from existing position
        val resumeFrom = chunk.start + existingSize
        connection.setRequestProperty("Range", "bytes=$resumeFrom-${chunk.end}")

        try {
            connection.responseCode
            val expectedResponse = if (existingSize > 0) HttpURLConnection.HTTP_PARTIAL else HttpURLConnection.HTTP_OK

            if (connection.responseCode != expectedResponse &&
                !(connection.responseCode == HttpURLConnection.HTTP_PARTIAL && existingSize == 0L) &&
                !(connection.responseCode == HttpURLConnection.HTTP_OK && existingSize > 0L)
            ) {
                // If server returns 200 instead of 206, it might not support the range we asked for
                // Try restarting this chunk from the beginning
                if (connection.responseCode == HttpURLConnection.HTTP_OK && existingSize > 0L) {
                    Log.w(TAG, "Chunk ${chunk.index}: server returned 200 instead of 206, restarting chunk")
                    existingSize = 0L
                    chunk.file.delete()
                } else {
                    throw Exception("Chunk ${chunk.index}: HTTP ${connection.responseCode}")
                }
            }

            val responseRange = connection.getHeaderField("Content-Range")
            Log.d(TAG, "Chunk ${chunk.index}: Range=$resumeFrom-${chunk.end}, response=${connection.responseCode}, contentRange=$responseRange")

            connection.inputStream.buffered().use { input ->
                FileOutputStream(chunk.file, existingSize > 0).use { output ->
                    val buffer = ByteArray(BUFFER_SIZE)
                    var bytesRead: Int

                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        currentCoroutineContext().ensureActive()

                        output.write(buffer, 0, bytesRead)
                        val newTotal = totalDownloaded.addAndGet(bytesRead.toLong())

                        // Calculate progress (0-70%)
                        if (totalSize > 0) {
                            val progress = ((newTotal.toFloat() / totalSize) * PROGRESS_DOWNLOAD_END).toInt()
                            onProgressUpdate(progress)
                        }
                    }
                }
            }

            Log.d(TAG, "Chunk ${chunk.index} complete: ${chunk.file.length()} bytes")

        } finally {
            connection.disconnect()
        }
    }

    /**
     * Merge downloaded chunks into a single archive file.
     */
    private fun mergeChunks(chunks: List<ChunkInfo>, outputFile: File, expectedSize: Long) {
        outputFile.outputStream().buffered().use { output ->
            val buffer = ByteArray(BUFFER_SIZE)
            for (chunk in chunks) {
                if (!chunk.file.exists()) {
                    throw Exception("Chunk file ${chunk.index} is missing")
                }
                chunk.file.inputStream().buffered().use { input ->
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                    }
                }
            }
        }

        // Verify merged file size
        val mergedSize = outputFile.length()
        if (mergedSize != expectedSize) {
            outputFile.delete()
            // Also delete chunks since they may be corrupted
            chunks.forEach { it.file.delete() }
            throw Exception("Merged file size mismatch: expected $expectedSize, got $mergedSize")
        }

        Log.d(TAG, "Chunks merged successfully: ${"%.1f".format(mergedSize / (1024.0 * 1024.0))}MB")
    }

    /**
     * Single-threaded download with resume support.
     * Used as fallback when server doesn't support multi-range downloads.
     */
    private suspend fun downloadSingleThreadResume(
        tempArchive: File,
        totalSize: Long,
        callback: DownloadCallback
    ) {
        Log.d(TAG, "Starting single-threaded resumable download")
        var existingSize = 0L

        if (tempArchive.exists()) {
            existingSize = tempArchive.length()
            if (existingSize >= totalSize) {
                Log.d(TAG, "File already fully downloaded")
                callback.onProgress(PROGRESS_DOWNLOAD_END)
                return
            }
            if (existingSize > 0) {
                Log.d(TAG, "Resuming from ${"%.1f".format(existingSize / (1024.0 * 1024.0))}MB")
            }
        }

        // Report initial progress
        if (existingSize > 0) {
            val initialProgress = ((existingSize.toFloat() / totalSize) * PROGRESS_DOWNLOAD_END).toInt()
            callback.onProgress(initialProgress)
        }

        val url = URL(DOWNLOAD_URL)
        val connection = url.openConnection() as HttpURLConnection
        connection.connectTimeout = 30_000
        connection.readTimeout = 60_000
        connection.setRequestProperty("Accept", "application/octet-stream")

        if (existingSize > 0) {
            connection.setRequestProperty("Range", "bytes=$existingSize-")
        }

        try {
            connection.responseCode
            val acceptableCodes = if (existingSize > 0)
                listOf(HttpURLConnection.HTTP_PARTIAL, HttpURLConnection.HTTP_OK)
            else
                listOf(HttpURLConnection.HTTP_OK)

            if (connection.responseCode !in acceptableCodes) {
                throw Exception("HTTP ${connection.responseCode}: ${connection.responseMessage}")
            }

            // If server returned 200 instead of 206, restart from beginning
            val isResuming = connection.responseCode == HttpURLConnection.HTTP_PARTIAL
            var totalRead = if (isResuming) existingSize else 0L

            if (!isResuming && existingSize > 0) {
                Log.w(TAG, "Server doesn't support resume, restarting from beginning")
                tempArchive.delete()
                totalRead = 0L
            }

            var lastProgress = if (totalRead > 0)
                ((totalRead.toFloat() / totalSize) * PROGRESS_DOWNLOAD_END).toInt() else 0

            connection.inputStream.buffered().use { input ->
                FileOutputStream(tempArchive, isResuming).use { output ->
                    val buffer = ByteArray(BUFFER_SIZE)
                    var bytesRead: Int

                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        currentCoroutineContext().ensureActive()

                        output.write(buffer, 0, bytesRead)
                        totalRead += bytesRead

                        // Report download progress (0-70%)
                        val progress = ((totalRead.toFloat() / totalSize) * PROGRESS_DOWNLOAD_END).toInt()
                        if (progress > lastProgress) {
                            lastProgress = progress
                            callback.onProgress(progress)
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
                                    extractEntryWithProgress(tarInput, targetFile, entry.realSize, callback)
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
     * Extract a single tar entry to a file (no progress reporting).
     * Used for small files like tokens.txt.
     */
    private fun extractEntry(tarInput: TarArchiveInputStream, outputFile: File) {
        outputFile.parentFile?.mkdirs()
        FileOutputStream(outputFile).use { output ->
            val buffer = ByteArray(BUFFER_SIZE)
            var bytesRead: Int
            while (tarInput.read(buffer).also { bytesRead = it } != -1) {
                output.write(buffer, 0, bytesRead)
            }
        }
    }

    /**
     * Extract a tar entry with progress reporting (72-95%).
     * Uses the entry's realSize to calculate extraction progress.
     */
    private fun extractEntryWithProgress(
        tarInput: TarArchiveInputStream,
        outputFile: File,
        entrySize: Long,
        callback: DownloadCallback
    ) {
        outputFile.parentFile?.mkdirs()
        var lastProgress = PROGRESS_EXTRACT_START
        var totalExtracted = 0L

        FileOutputStream(outputFile).use { output ->
            val buffer = ByteArray(BUFFER_SIZE)
            var bytesRead: Int
            while (tarInput.read(buffer).also { bytesRead = it } != -1) {
                output.write(buffer, 0, bytesRead)
                totalExtracted += bytesRead

                // Report extraction progress (72-95%) based on extracted bytes
                if (entrySize > 0) {
                    val progress = (PROGRESS_EXTRACT_START +
                            ((totalExtracted.toFloat() / entrySize) * (PROGRESS_EXTRACT_END - PROGRESS_EXTRACT_START)).toInt())
                            .coerceIn(PROGRESS_EXTRACT_START, PROGRESS_EXTRACT_END)
                    if (progress > lastProgress) {
                        lastProgress = progress
                        callback.onProgress(progress)
                    }
                }
            }
        }

        Log.d(TAG, "Extraction progress done: ${totalExtracted}/${entrySize} bytes, lastProgress=$lastProgress")
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
