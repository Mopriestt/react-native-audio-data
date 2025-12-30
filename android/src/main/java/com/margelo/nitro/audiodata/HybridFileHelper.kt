package com.margelo.nitro.audiodata

import android.app.Application
import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.webkit.MimeTypeMap
import com.margelo.nitro.core.Promise
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

// 👇 引入协程相关库
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class HybridFileHelper : HybridFileHelperSpec() {

    // 👇 定义一个协程作用域，指定使用 IO 调度器 (专门用于文件读写)
    private val scope = CoroutineScope(Dispatchers.IO)

    // Context 获取逻辑保持不变
    private val context: Context
        get() {
            return try {
                val activityThread = Class.forName("android.app.ActivityThread")
                val method = activityThread.getMethod("currentApplication")
                method.invoke(null) as Application
            } catch (e: Exception) {
                throw RuntimeException("HybridFileHelper: Failed to retrieve Application Context.", e)
            }
        }

    override fun resolveFilePath(rawPath: String): Promise<String> {
        // 创建 Nitro 的 Promise 对象
        val promise = Promise<String>()

        // 👇 使用协程启动任务
        // launch 会立即返回 Job，不会阻塞当前线程
        // 代码块内的逻辑会被调度到 IO 线程池中执行
        scope.launch {
            try {
                // 执行耗时操作
                val resultPath = resolveFilePathInternal(rawPath)
                // 成功
                promise.resolve(resultPath)
            } catch (e: Throwable) {
                // 失败
                promise.reject(e)
            }
        }

        return promise
    }

    // --- 下面的逻辑完全不用变 ---
    
    private fun resolveFilePathInternal(rawPath: String): String {
        val uri = Uri.parse(rawPath)

        if (rawPath.startsWith("content://")) {
            return copyContentUriToCache(uri)
        }
        if (rawPath.startsWith("file://")) {
            return uri.path ?: rawPath
        }
        return rawPath
    }

    private fun copyContentUriToCache(uri: Uri): String {
        val contentResolver = context.contentResolver
        
        var fileName = "temp_audio_${UUID.randomUUID()}"
        var extension = ""
        
        try {
            contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                if (cursor.moveToFirst()) {
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (nameIndex != -1) {
                        val originalName = cursor.getString(nameIndex)
                        if (!originalName.isNullOrEmpty()) {
                            if (originalName.contains(".")) {
                                val split = originalName.lastIndexOf(".")
                                fileName = originalName.substring(0, split)
                                extension = originalName.substring(split)
                            } else {
                                fileName = originalName
                            }
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // ignore
        }

        if (extension.isEmpty()) {
            val mimeType = contentResolver.getType(uri)
            if (mimeType != null) {
                val typeExtension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType)
                if (typeExtension != null) extension = ".$typeExtension"
            }
        }

        val finalFileName = "$fileName$extension"
        val cacheDir = context.cacheDir
        val outputFile = File(cacheDir, finalFileName)

        contentResolver.openInputStream(uri)?.use { inputStream ->
            FileOutputStream(outputFile).use { outputStream ->
                inputStream.copyTo(outputStream)
            }
        } ?: throw Exception("Cannot open input stream for URI: $uri")

        return outputFile.absolutePath
    }
}