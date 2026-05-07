package ai.domovina.sms

import android.content.Context
import timber.log.Timber
import java.util.concurrent.ConcurrentLinkedDeque

enum class GatewayEventKind(val arrow: String) {
    RECEIVED("←"),  // ← inbound SMS arrived on phone, forwarded to server
    SENT("→"),      // → outbound SMS pushed out via SmsManager
    DELIVERED("✓"), // ✓ delivery report from carrier
    FAILED("✗"),    // ✗ send or delivery failure
}

data class GatewayEvent(
    val timestamp: Long,
    val kind: GatewayEventKind,
    val summary: String,    // single-line headline, e.g. "+385... → +385..."
    val detail: String?,    // optional second line, e.g. message body or error reason
)

object InMemoryLog {
    private const val MAX_ENTRIES = 500
    private val buffer = ConcurrentLinkedDeque<GatewayEvent>()

    fun smsReceived(from: String, to: String, content: String) =
        add(GatewayEventKind.RECEIVED, "$from → $to", content)

    fun smsSent(to: String, content: String) =
        add(GatewayEventKind.SENT, to, content)

    fun smsDelivered(messageId: String) =
        add(GatewayEventKind.DELIVERED, "msg ${shortId(messageId)}", null)

    fun smsFailed(messageId: String, reason: String) =
        add(GatewayEventKind.FAILED, "msg ${shortId(messageId)}", reason)

    private fun shortId(id: String): String =
        if (id.length > 8) id.substring(0, 8) else id

    private fun add(kind: GatewayEventKind, summary: String, detail: String?) {
        buffer.addLast(GatewayEvent(System.currentTimeMillis(), kind, summary, detail))
        while (buffer.size > MAX_ENTRIES) buffer.pollFirst()
    }

    fun snapshot(): List<GatewayEvent> = buffer.toList()

    fun clear() {
        buffer.clear()
    }
}

class LogzTree(val context: Context) : Timber.DebugTree() {
    override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
        super.log(priority, tag, message, t)
    }
}
