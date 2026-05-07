package ai.domovina.sms

import android.content.ClipData
import android.content.ClipboardManager
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.MenuItem
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class LogActivity : AppCompatActivity() {
    private lateinit var textView: TextView
    private lateinit var scrollView: ScrollView
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
        title = "Logs"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(0xFF101418.toInt())
        }

        val buttons = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(16, 8, 16, 8)
        }
        val copyBtn = Button(this).apply {
            text = "Copy all"
            setOnClickListener {
                val cm = getSystemService(ClipboardManager::class.java)
                cm.setPrimaryClip(ClipData.newPlainText("logs", InMemoryLog.snapshot().joinToString("\n")))
                Toast.makeText(this@LogActivity, "Copied to clipboard", Toast.LENGTH_SHORT).show()
            }
            layoutParams = LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f).apply { marginEnd = 8 }
        }
        val clearBtn = Button(this).apply {
            text = "Clear"
            setOnClickListener {
                InMemoryLog.clear()
                lastSize = -1
                render()
            }
            layoutParams = LinearLayout.LayoutParams(0, WRAP_CONTENT, 1f)
        }
        buttons.addView(copyBtn)
        buttons.addView(clearBtn)

        textView = TextView(this).apply {
            setPadding(24, 16, 24, 16)
            textSize = 11f
            setTextColor(0xFFD0D0D0.toInt())
            typeface = Typeface.MONOSPACE
            setTextIsSelectable(true)
        }
        scrollView = ScrollView(this).apply { addView(textView) }

        root.addView(buttons, LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        root.addView(scrollView, LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f))
        setContentView(root)
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    private fun render() {
        val snapshot = InMemoryLog.snapshot()
        if (snapshot.size == lastSize) return
        val ssb = SpannableStringBuilder()
        snapshot.forEach { line ->
            val start = ssb.length
            ssb.append(line).append('\n')
            val color = when {
                line.contains(" E ") -> 0xFFFF6B6B
                line.contains(" W ") -> 0xFFFFD86B
                line.contains(" I ") -> 0xFF7CC9FF
                line.contains(" D ") -> 0xFFB0B0B0
                else -> 0xFF707070
            }.toInt()
            ssb.setSpan(ForegroundColorSpan(color), start, ssb.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        }
        textView.text = ssb
        lastSize = snapshot.size
        scrollView.post { scrollView.fullScroll(ScrollView.FOCUS_DOWN) }
    }

    override fun onResume() {
        super.onResume()
        handler.post(refresh)
    }

    override fun onPause() {
        super.onPause()
        handler.removeCallbacks(refresh)
    }
}
