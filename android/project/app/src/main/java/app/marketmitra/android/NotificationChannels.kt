package app.marketmitra.android

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.content.ContextCompat

object NotificationChannels {
    const val GENERAL = "market_mitra_general_signature_v3"
    const val MARKET = "market_mitra_market_signature_v3"
    const val WEATHER = "market_mitra_weather_signature_v3"
    const val SCHEMES = "market_mitra_schemes_signature_v3"
    const val UPDATES = "market_mitra_updates_signature_v3"
    const val SILENT = "market_mitra_silent_v3"

    fun createAll(context: Context) = createAll(context, "signature")

    fun createAll(context: Context, sound: String = "signature") {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = ContextCompat.getSystemService(context, NotificationManager::class.java) ?: return
        val soundUri = if (sound == "silent") null else Uri.parse("android.resource://${context.packageName}/raw/${if (sound == "soft") "market_mitra_soft" else "market_mitra_signature"}")
        val ids = channelsForSound(sound)
        ids.forEach { id ->
            val channel = NotificationChannel(id, channelName(context, id), NotificationManager.IMPORTANCE_DEFAULT)
            channel.description = channelDescription(context, id)
            channel.enableLights(true)
            channel.lightColor = 0xFF0B5D3A.toInt()
            channel.enableVibration(id != SILENT)
            if (id == SILENT) channel.setSound(null, null)
            else if (soundUri != null) {
                channel.setSound(soundUri, AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT)
                    .build())
            }
            manager.createNotificationChannel(channel)
        }
    }

    fun forCategory(category: String, sound: String = "signature"): String {
        val base = when (category.lowercase()) {
        "market", "market_updates" -> MARKET
        "weather" -> WEATHER
        "scheme", "schemes", "government" -> SCHEMES
        "updates", "system", "account" -> UPDATES
        else -> GENERAL
        }
        val silent = sound == "silent"
        val soft = sound == "soft"
        return if (silent) SILENT else base.replace("signature", if (soft) "soft" else "signature")
    }

    private fun channelsForSound(sound: String): List<String> {
        if (sound == "silent") return listOf(SILENT)
        val variant = if (sound == "soft") "soft" else "signature"
        return listOf(GENERAL, MARKET, WEATHER, SCHEMES, UPDATES).map { it.replace("signature", variant) }
    }

    private fun channelName(context: Context, id: String) = when (id) {
        MARKET -> "Market updates"
        WEATHER -> "Weather alerts"
        SCHEMES -> "Government schemes"
        UPDATES -> "Market Mitra updates"
        SILENT -> "Silent notifications"
        else -> "General notifications"
    }

    private fun channelDescription(context: Context, id: String) = when (id) {
        MARKET -> "Crop prices and verified market movement"
        WEATHER -> "Relevant weather and severe weather alerts"
        SCHEMES -> "Verified schemes and deadline reminders"
        UPDATES -> "Account security and application announcements"
        SILENT -> "Notifications without sound"
        else -> "Other Market Mitra notifications"
    }
}
