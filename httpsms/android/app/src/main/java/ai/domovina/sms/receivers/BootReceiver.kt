package ai.domovina.sms.receivers

import android.app.ForegroundServiceStartNotAllowedException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.UserManager
import ai.domovina.sms.Constants
import ai.domovina.sms.Settings
import ai.domovina.sms.services.StickyNotificationService
import timber.log.Timber

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        Timber.i("BootReceiver fired with action [$action]")

        when (action) {
            // Direct-Boot phase: user has not unlocked yet, SharedPreferences is
            // sealed. UserUnlockedReceiver will pick it up once unlock happens.
            Intent.ACTION_LOCKED_BOOT_COMPLETED -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    val um = context.getSystemService(UserManager::class.java)
                    if (um != null && !um.isUserUnlocked) {
                        Timber.d("LOCKED_BOOT_COMPLETED before unlock — waiting for USER_UNLOCKED")
                        return
                    }
                }
                startStickyNotification(context)
            }
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON" -> {
                startStickyNotification(context)
            }
            else -> Timber.w("unhandled intent [$action]")
        }
    }

    companion object {
        fun startStickyNotification(context: Context) {
            if (!Settings.getActiveStatus(context, Constants.SIM1) &&
                !Settings.getActiveStatus(context, Constants.SIM2)
            ) {
                Timber.d("active status is false, not starting foreground service")
                return
            }

            Timber.d("starting foreground service")
            val notificationIntent = Intent(context, StickyNotificationService::class.java)
            try {
                val service = context.startForegroundService(notificationIntent)
                Timber.i("foreground service started [${service?.className}]")
            } catch (e: Exception) {
                // Android 12+ can throw ForegroundServiceStartNotAllowedException if the
                // OS decides the launch is not allowed (rare from BOOT_COMPLETED, but
                // possible from other contexts). FCM push will eventually re-wake the app.
                Timber.e(e, "failed to start foreground service from BootReceiver")
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
                    e is ForegroundServiceStartNotAllowedException
                ) {
                    Timber.w("FGS launch denied by OS — relying on FCM/WorkManager wake-up")
                }
            }
        }
    }
}
