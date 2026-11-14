package app.marketmitra.android

import android.Manifest
import android.app.Activity
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.media.MediaPlayer
import android.os.Bundle
import android.os.Environment
import android.provider.Settings
import android.view.View
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessaging
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class LauncherActivity : Activity() {
    companion object {
        private const val HOME_URL = "https://www.marketmitra.app/home"
        private const val REQUEST_PERMISSIONS = 1001
        private const val REQUEST_FILE_PICKER = 1002
        private const val REQUEST_CAMERA = 1003
        private const val REQUEST_NOTIFICATION_PERMISSION = 1004
    }

    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null
    private var pendingPermissionRequest: PermissionRequest? = null
    private var pendingGeolocationOrigin: String? = null
    private var pendingGeolocationCallback: GeolocationPermissions.Callback? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_launcher)

        window.statusBarColor = ContextCompat.getColor(this, R.color.market_mitra_status)
        window.navigationBarColor = ContextCompat.getColor(this, R.color.market_mitra_navigation)

        webView = findViewById(R.id.webview)
        configureWebView()

        val launchedUrl = intent?.data?.toString()
        val initialUrl = if (isMarketMitraUrl(launchedUrl)) launchedUrl!! else HOME_URL
        webView.addJavascriptInterface(NativeNotificationBridge(), "MarketMitraAndroidNotifications")
        webView.loadUrl(initialUrl)
        FirebaseMessaging.getInstance().token.addOnSuccessListener { token ->
            publishFcmToken(token)
            getSharedPreferences("market_mitra_native", Context.MODE_PRIVATE).edit().putString("fcm_token", token).apply()
        }
            .addOnFailureListener {
                webView.postDelayed({ refreshFcmToken() }, 3000)
            }
        MarketMitraMessagingService.tokenListener = { token ->
            publishFcmToken(token)
            getSharedPreferences("market_mitra_native", Context.MODE_PRIVATE).edit().putString("fcm_token", token).apply()
        }
    }

    private fun configureWebView() {
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = false
        }
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        webView.isVerticalScrollBarEnabled = true
        webView.isHorizontalScrollBarEnabled = false
        webView.setOnLongClickListener { true }
        webView.setOnCreateContextMenuListener { _, _, _ -> }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                return handleUrl(url)
            }

            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean = handleUrl(url)

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                getSharedPreferences("market_mitra_native", Context.MODE_PRIVATE).getString("fcm_token", "")?.let { token ->
                    if (token.isNotBlank()) publishFcmToken(token)
                }
                refreshFcmToken()
                publishPermissionState()
                view.evaluateJavascript(
                    """
                    (function () {
                      var style = document.createElement('style');
                      style.textContent = 'img, picture, svg { -webkit-user-drag: none; } button, a, [role="button"], nav { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }';
                      document.head.appendChild(style);
                      document.addEventListener('contextmenu', function(e) {
                        var tag = e.target && e.target.tagName;
                        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target.closest('[data-selectable="true"]')) e.preventDefault();
                      });
                    })();
                    """.trimIndent(),
                    null
                )
            }
        }

        webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
            val request = DownloadManager.Request(Uri.parse(url))
            request.setMimeType(mimeType)
            request.addRequestHeader("User-Agent", userAgent)
            request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimeType))
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, contentDisposition, mimeType))
            (getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                callback: ValueCallback<Array<Uri>>,
                params: FileChooserParams
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback
                val intents = mutableListOf<Intent>()
                createCameraImageUri()?.let { uri ->
                    cameraImageUri = uri
                    Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE).apply {
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                        putExtra(android.provider.MediaStore.EXTRA_OUTPUT, uri)
                    }.let { intents += it }
                }

                val contentIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = params.acceptTypes.firstOrNull()?.takeIf { it.isNotBlank() } ?: "*/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.mode == FileChooserParams.MODE_OPEN_MULTIPLE)
                }
                val chooser = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentIntent)
                    if (intents.isNotEmpty()) putExtra(Intent.EXTRA_INITIAL_INTENTS, intents.toTypedArray())
                }
                startActivityForResult(chooser, REQUEST_FILE_PICKER)
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                if (request.resources.any { it == PermissionRequest.RESOURCE_VIDEO_CAPTURE || it == PermissionRequest.RESOURCE_AUDIO_CAPTURE }) {
                    pendingPermissionRequest = request
                    requestPermissions(arrayOf(Manifest.permission.CAMERA), REQUEST_PERMISSIONS)
                } else {
                    request.deny()
                }
            }

            override fun onGeolocationPermissionsShowPrompt(origin: String, callback: GeolocationPermissions.Callback) {
                pendingGeolocationOrigin = origin
                pendingGeolocationCallback = callback
                val needsLocation = ContextCompat.checkSelfPermission(this@LauncherActivity, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                if (needsLocation) {
                    ActivityCompat.requestPermissions(this@LauncherActivity, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), REQUEST_PERMISSIONS)
                } else {
                    callback.invoke(origin, true, false)
                }
            }

            override fun onGeolocationPermissionsHidePrompt() {
                pendingGeolocationOrigin = null
                pendingGeolocationCallback = null
            }

            override fun onConsoleMessage(message: android.webkit.ConsoleMessage): Boolean = false
        }
    }

    private fun handleUrl(url: String): Boolean {
        val uri = Uri.parse(url)
        if (isMarketMitraUrl(url)) return false
        if (uri.scheme == "mailto" || uri.scheme == "tel") {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
            return true
        }
        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            true
        } catch (_: ActivityNotFoundException) {
            false
        }
    }

    private fun isMarketMitraUrl(url: String?): Boolean {
        if (url.isNullOrBlank()) return false
        val uri = Uri.parse(url)
        return uri.scheme == "https" && (uri.host == "marketmitra.app" || uri.host?.endsWith(".marketmitra.app") == true)
    }

    private fun createCameraImageUri(): Uri? {
        val directory = File(cacheDir, "camera")
        if (!directory.exists()) directory.mkdirs()
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val file = File(directory, "MarketMitra_${timestamp}.jpg")
        return FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
    }

    private inner class NativeNotificationBridge {
        @JavascriptInterface
        fun requestPermission() {
            runOnUiThread {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU &&
                    ContextCompat.checkSelfPermission(this@LauncherActivity, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this@LauncherActivity, arrayOf(Manifest.permission.POST_NOTIFICATIONS), REQUEST_NOTIFICATION_PERMISSION)
                } else {
                    publishPermissionState()
                    refreshFcmToken()
                }
            }
        }

        @JavascriptInterface
        fun getPermissionStatus(): String = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            if (!NotificationManagerCompat.from(this@LauncherActivity).areNotificationsEnabled()) {
                "global-disabled"
            } else if (ContextCompat.checkSelfPermission(this@LauncherActivity, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                "granted"
            } else {
                "denied"
            }
        } else if (!NotificationManagerCompat.from(this@LauncherActivity).areNotificationsEnabled()) {
            "global-disabled"
        } else {
            "granted"
        }

        @JavascriptInterface
        fun openNotificationSettings() {
            val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
                putExtra(Settings.EXTRA_APP_PACKAGE, packageName)
            }
            runOnUiThread {
                try {
                    startActivity(intent)
                } catch (_: ActivityNotFoundException) {
                    startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
                }
            }
        }

        @JavascriptInterface
        fun getFcmToken(): String = getSharedPreferences("market_mitra_native", Context.MODE_PRIVATE).getString("fcm_token", "") ?: ""

        @JavascriptInterface
        fun setSoundPreference(sound: String) {
            getSharedPreferences("market_mitra_native", Context.MODE_PRIVATE).edit().putString("sound", sound).apply()
            NotificationChannels.createAll(this@LauncherActivity, sound)
        }

        @JavascriptInterface
        fun previewSound(sound: String) {
            val safeSound = if (sound == "soft") "soft" else "signature"
            NotificationChannels.createAll(this@LauncherActivity, safeSound)
            val resourceId = if (safeSound == "soft") R.raw.market_mitra_soft else R.raw.market_mitra_signature
            val player = MediaPlayer.create(this@LauncherActivity, resourceId)
            player?.setOnCompletionListener { it.release() }
            player?.start()
        }
    }

    private fun refreshFcmToken() {
        FirebaseMessaging.getInstance().token.addOnSuccessListener { publishFcmToken(it) }
    }

    private fun publishFcmToken(token: String) {
        val escaped = token.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "")
        runOnUiThread {
            webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('marketmitra:fcm-token',{detail:{token:\"$escaped\"}}));",
                null
            )
        }
    }

    private fun publishPermissionState() {
        val state = getNativePermissionStatus()
        runOnUiThread {
            webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('marketmitra:notification-permission',{detail:{state:\"$state\"}}));", null)
        }
    }

    private fun getNativePermissionState(): String {
        if (!NotificationManagerCompat.from(this).areNotificationsEnabled()) return "global-disabled"
        return if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            "denied"
        } else {
            "granted"
        }
    }

    private fun getNativePermissionStatus(): String = getNativePermissionState()

    override fun onResume() {
        super.onResume()
        publishPermissionState()
        refreshFcmToken()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        intent?.data?.toString()?.takeIf { isMarketMitraUrl(it) }?.let {
            webView.loadUrl(it)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_FILE_PICKER) {
            val results = when {
                resultCode != RESULT_OK -> null
                data?.clipData != null -> Array(data.clipData!!.itemCount) { data.clipData!!.getItemAt(it).uri }
                data?.data != null -> arrayOf(data.data!!)
                resultCode == RESULT_OK && cameraImageUri != null -> arrayOf(cameraImageUri!!)
                else -> null
            }
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
            cameraImageUri = null
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_NOTIFICATION_PERMISSION) {
            publishPermissionState()
            refreshFcmToken()
            return
        }
        if (requestCode != REQUEST_PERMISSIONS) return
        val granted = grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }
        pendingPermissionRequest?.let { if (granted) it.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) else it.deny() }
        pendingPermissionRequest = null
        pendingGeolocationCallback?.let { pendingGeolocationOrigin?.let { origin -> it.invoke(origin, granted, false) } }
        pendingGeolocationOrigin = null
        pendingGeolocationCallback = null
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    override fun onDestroy() {
        MarketMitraMessagingService.tokenListener = null
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }
}
