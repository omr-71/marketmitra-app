package app.marketmitra.android

import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.util.Locale

class MarketMitraMessagingService : FirebaseMessagingService() {
    companion object {
        var tokenListener: ((String) -> Unit)? = null
    }
    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        val category = data["category"] ?: "general"
        val title = message.notification?.title ?: data["title"] ?: getString(R.string.appName)
        val body = message.notification?.body ?: data["body"] ?: ""
        val target = data["url"] ?: "/notifications"
        val sound = data["sound"] ?: "signature"
        NotificationChannels.createAll(applicationContext, sound)
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.marketmitra.app$target"))
        intent.setPackage(packageName)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        val pending = PendingIntent.getActivity(
            this, target.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val notification = NotificationCompat.Builder(this, NotificationChannels.forCategory(category, sound))
            .setSmallIcon(R.drawable.ic_notification_icon)
            .setLargeIcon(android.graphics.BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher))
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pending)
            .setAutoCancel(true)
            .setGroup("market_mitra_${category.lowercase(Locale.ROOT)}")
            .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
            .build()
        NotificationManagerCompat.from(this).notify((data["notification_id"] ?: target + title).hashCode(), notification)
    }

    override fun onNewToken(token: String) {
        getSharedPreferences("market_mitra_native", MODE_PRIVATE)
            .edit().putString("fcm_token", token).apply()
        tokenListener?.invoke(token)
    }
}
