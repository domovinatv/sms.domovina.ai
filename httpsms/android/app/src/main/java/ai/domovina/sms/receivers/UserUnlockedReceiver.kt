package ai.domovina.sms.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import timber.log.Timber

/**
 * Handoff for Direct Boot: once the user unlocks for the first time after a
 * cold boot, encrypted SharedPreferences becomes available, so we can finally
 * read the SIM activation flags and start the foreground service.
 */
class UserUnlockedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_USER_UNLOCKED) {
            Timber.w("UserUnlockedReceiver got unexpected action [${intent.action}]")
            return
        }
        Timber.i("USER_UNLOCKED — running deferred boot startup")
        BootReceiver.startStickyNotification(context)
    }
}
