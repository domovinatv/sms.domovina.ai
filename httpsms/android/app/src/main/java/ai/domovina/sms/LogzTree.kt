package ai.domovina.sms

import android.content.Context
import timber.log.Timber
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.ConcurrentLinkedDeque

object InMemoryLog {
    private const val MAX_ENTRIES = 2000
    private val buffer = ConcurrentLinkedDeque<String>()
    private val df = SimpleDateFormat("HH:mm:ss.SSS", Locale.US)

    fun append(level: String, tag: String?, message: String, t: Throwable? = null) {
        val ts = df.format(Date())
        val trace = t?.let {
            "\n  ${it.javaClass.simpleName}: ${it.message}\n  " +
                it.stackTraceToString().lines().take(8).joinToString("\n  ")
        } ?: ""
        buffer.addLast("$ts $level ${tag ?: "?"}: $message$trace")
        while (buffer.size > MAX_ENTRIES) buffer.pollFirst()
    }

    fun snapshot(): List<String> = buffer.toList()

    fun clear() {
        buffer.clear()
    }
}

class LogzTree(val context: Context) : Timber.DebugTree() {
    override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
        super.log(priority, tag, message, t)
        val level = when (priority) {
            2 -> "V"
            3 -> "D"
            4 -> "I"
            5 -> "W"
            6 -> "E"
            7 -> "A"
            else -> "?"
        }
        InMemoryLog.append(level, tag, message, t)
    }
}
