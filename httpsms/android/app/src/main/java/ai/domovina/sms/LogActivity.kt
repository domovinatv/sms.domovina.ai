package ai.domovina.sms

import android.content.ClipData
import android.content.ClipboardManager
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.BaseAdapter
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class LogActivity : AppCompatActivity() {
    private lateinit var listView: ListView
    private lateinit var emptyView: TextView
    private lateinit var adapter: EventsAdapter
    private val handler = Handler(Looper.getMainLooper())
    private var lastSize = -1
    private val refresh = object : Runnable {
        override fun run() {
            render()
            handler.postDelayed(this, 1000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        title = "Gateway events"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(0xFF101418.toInt())
            fitsSystemWindows = true
        }
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(sys.left, sys.top, sys.right, sys.bottom)
            insets
        }

        val toolbar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(16, 8, 16, 8)
        }
        toolbar.addView(Button(this).apply {
            text = "Copy all"
            setOnClickListener {
                val text = InMemoryLog.snapshot().joinToString("\n") { eventToText(it) }
                getSystemService(ClipboardManager::class.java)
                    .setPrimaryClip(ClipData.newPlainText("gateway-events", text))
                Toast.makeText(this@LogActivity, "Copied", Toast.LENGTH_SHORT).show()
            }
            layoutParams = LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f).apply { marginEnd = 8 }
        })
        toolbar.addView(Button(this).apply {
            text = "Clear"
            setOnClickListener {
                InMemoryLog.clear()
                lastSize = -1
                render()
            }
            layoutParams = LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f)
        })

        listView = ListView(this).apply {
            divider = null
            setBackgroundColor(0xFF101418.toInt())
        }
        adapter = EventsAdapter()
        listView.adapter = adapter

        emptyView = TextView(this).apply {
            text = "No events yet.\nSend or receive an SMS to see it here."
            setTextColor(0xFF707070.toInt())
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(48, 96, 48, 96)
        }
        val listContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            addView(emptyView, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))
            addView(listView, LinearLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        }

        root.addView(toolbar, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        root.addView(listContainer, LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f))
        setContentView(root)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    override fun onResume() {
        super.onResume()
        handler.post(refresh)
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(refresh)
    }

    private fun render() {
        val snapshot = InMemoryLog.snapshot().asReversed() // newest on top
        if (snapshot.size == lastSize) return
        adapter.setData(snapshot)
        emptyView.visibility = if (snapshot.isEmpty()) View.VISIBLE else View.GONE
        lastSize = snapshot.size
    }

    private fun eventToText(e: GatewayEvent): String {
        val ts = TS_FMT.format(Date(e.timestamp))
        return buildString {
            append(ts).append(' ').append(e.kind.arrow).append(' ').append(e.summary)
            e.detail?.let { append(" — ").append(it.replace('\n', ' ')) }
        }
    }

    private class EventsAdapter : BaseAdapter() {
        private var data: List<GatewayEvent> = emptyList()

        fun setData(d: List<GatewayEvent>) {
            data = d
            notifyDataSetChanged()
        }

        override fun getCount(): Int = data.size
        override fun getItem(position: Int): GatewayEvent = data[position]
        override fun getItemId(position: Int): Long = position.toLong()

        override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
            val ctx = parent.context
            val holder: Holder
            val view: View
            if (convertView == null) {
                val row = LinearLayout(ctx).apply {
                    orientation = LinearLayout.HORIZONTAL
                    setPadding(24, 16, 24, 16)
                }
                val arrow = TextView(ctx).apply {
                    textSize = 22f
                    typeface = Typeface.DEFAULT_BOLD
                    setPadding(0, 0, 24, 0)
                    minWidth = 80
                    gravity = Gravity.CENTER
                }
                val column = LinearLayout(ctx).apply {
                    orientation = LinearLayout.VERTICAL
                    layoutParams = LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f)
                }
                val timestamp = TextView(ctx).apply {
                    textSize = 11f
                    setTextColor(0xFF808080.toInt())
                    typeface = Typeface.MONOSPACE
                }
                val summary = TextView(ctx).apply {
                    textSize = 16f
                    setTextColor(0xFFE0E0E0.toInt())
                    typeface = Typeface.DEFAULT_BOLD
                    setPadding(0, 2, 0, 0)
                }
                val detail = TextView(ctx).apply {
                    textSize = 13f
                    setTextColor(0xFFA8A8A8.toInt())
                    setPadding(0, 4, 0, 0)
                    maxLines = 3
                    ellipsize = android.text.TextUtils.TruncateAt.END
                }
                column.addView(timestamp)
                column.addView(summary)
                column.addView(detail)
                row.addView(arrow)
                row.addView(column)
                holder = Holder(arrow, timestamp, summary, detail)
                row.tag = holder
                view = row
            } else {
                holder = convertView.tag as Holder
                view = convertView
            }

            val e = data[position]
            holder.arrow.text = e.kind.arrow
            holder.arrow.setTextColor(when (e.kind) {
                GatewayEventKind.RECEIVED -> 0xFF7CC9FF.toInt()
                GatewayEventKind.SENT -> 0xFF8AE881.toInt()
                GatewayEventKind.DELIVERED -> 0xFF6BCBFF.toInt()
                GatewayEventKind.FAILED -> 0xFFFF6B6B.toInt()
            })
            holder.timestamp.text = TS_FMT.format(Date(e.timestamp))
            holder.summary.text = e.summary
            if (e.detail.isNullOrBlank()) {
                holder.detail.visibility = View.GONE
            } else {
                holder.detail.visibility = View.VISIBLE
                holder.detail.text = e.detail
            }
            return view
        }

        private class Holder(
            val arrow: TextView,
            val timestamp: TextView,
            val summary: TextView,
            val detail: TextView,
        )
    }

    companion object {
        private val TS_FMT = SimpleDateFormat("HH:mm:ss", Locale.US)
    }
}
