"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { sendChatStream } from "@/lib/api"

const QUICK_QUESTIONS = [
  "帮我整体评估一下志愿方案",
  "我的分数能上哪些 985/211？",
  "张雪峰怎么看我的Top专业？",
  "意向院校值得报吗？",
]

export default function ChatPage() {
  const router = useRouter()
  const { userInfo, result, chatMessages, addMessage, updateLastAssistantMessage } = useAppStore()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const topMajors = result?.recommended_majors.slice(0, 3).map((m) => m.name) || []
  const topSchool = result?.recommended_schools["稳"]?.[0]?.university_name || ""

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    setInput("")
    setLoading(true)

    addMessage({ role: "user", content: text })
    addMessage({ role: "assistant", content: "" })

    let accumulated = ""
    await sendChatStream(
      userInfo ?? { province: "广东" },
      result?.mbti_type || "",
      topMajors,
      topSchool,
      chatMessages.filter((m) => m.content),
      text,
      (chunk) => {
        accumulated += chunk
        updateLastAssistantMessage(accumulated)
      },
      () => setLoading(false)
    )
  }

  const toggleVoice = () => {
    if (reachedLimit || loading) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert("当前浏览器不支持语音输入，请使用 Chrome 或 Edge")
      return
    }
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }
    const recognition = new SR()
    recognition.lang = "zh-CN"
    recognition.continuous = false
    recognition.interimResults = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setInput((prev) => prev + text)
      inputRef.current?.focus()
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const FREE_ROUNDS = 3
  const userMsgCount = chatMessages.filter((m) => m.role === "user").length
  const reachedLimit = userMsgCount >= FREE_ROUNDS

  return (
    <div className="flex flex-col h-screen" style={{ background: "#F7F5FF" }}>

      {/* Header */}
      <div className="flex-shrink-0" style={{ background: "rgba(247,245,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "#EDE9FE", color: "#7C3AED" }}>‹</button>

          {/* AI avatar */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)" }}>
            AI
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-black text-sm" style={{ color: "#12012E" }}>AI 志愿师</div>
            <div className="text-xs truncate" style={{ color: "#7B6F92" }}>
              {userInfo?.province ?? "全国"}
              {result && ` · ${result.mbti_type} · ${topMajors[0] || ""}`}
            </div>
          </div>

          <div className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: reachedLimit ? "#FFF1F2" : "#EDE9FE", color: reachedLimit ? "#FF4757" : "#7C3AED" }}>
            {Math.min(userMsgCount, FREE_ROUNDS)}/{FREE_ROUNDS} 次
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-lg mx-auto w-full">
        {chatMessages.length === 0 && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-black text-2xl text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
              🎓
            </div>
            <p className="font-black text-base mb-2" style={{ color: "#12012E" }}>你好！我是你的AI志愿师</p>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#7B6F92" }}>
              基于你的测评结果，帮你分析专业选择、院校志愿，用数据给你最直接的建议。
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mb-1"
                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)" }}>
                AI
              </div>
            )}
            <div className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={msg.role === "user"
                ? { background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)", color: "#fff", borderBottomRightRadius: "6px", boxShadow: "0 4px 12px rgba(124,58,237,0.25)" }
                : { background: "#fff", color: "#12012E", border: "1.5px solid #E8E4F3", borderBottomLeftRadius: "6px", boxShadow: "0 2px 8px rgba(18,1,46,0.06)" }}>
              {msg.content || (loading && i === chatMessages.length - 1 ? (
                <span className="flex gap-1">
                  {[0, 150, 300].map((d, j) => (
                    <span key={j} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#7C3AED", animationDelay: `${d}ms` }} />
                  ))}
                </span>
              ) : "")}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mb-1"
                style={{ background: "#EDE9FE", color: "#7C3AED" }}>
                我
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {chatMessages.length === 0 && (
        <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto max-w-lg mx-auto w-full">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => sendMessage(q)}
              className="press flex-shrink-0 text-xs px-3 py-2 rounded-xl font-semibold"
              style={{ background: "#fff", border: "1.5px solid #E8E4F3", color: "#7C3AED", whiteSpace: "nowrap" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Paywall */}
      {reachedLimit && (
        <div className="flex-shrink-0 mx-4 mb-2 max-w-lg mx-auto">
          <div className="rounded-2xl px-4 py-3 text-center"
            style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #FFF1F2 100%)", border: "1.5px solid #E8E4F3" }}>
            <p className="text-sm font-black mb-0.5" style={{ color: "#12012E" }}>免费次数已用完 🔒</p>
            <p className="text-xs mb-2" style={{ color: "#7B6F92" }}>开通会员，无限次AI咨询 + 完整院校方案</p>
            <button className="press px-6 py-2 rounded-xl font-black text-sm text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)" }}>
              开通会员 · ¥49
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 px-4 py-3 max-w-lg mx-auto w-full"
        style={{ borderTop: "1px solid #E8E4F3", background: "rgba(247,245,255,0.98)" }}>
        {isListening && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="flex gap-0.5 items-end">
              {[8, 14, 20, 14, 8].map((h, i) => (
                <span key={i} className="w-1 rounded-full animate-bounce"
                  style={{ height: `${h}px`, background: "#FF4757", animationDelay: `${i * 80}ms` }} />
              ))}
            </span>
            <span className="text-xs font-semibold" style={{ color: "#FF4757" }}>正在聆听，说完后自动停止…</span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={reachedLimit ? "免费次数已用完，开通会员继续" : "问我任何志愿问题…"}
            disabled={reachedLimit || loading}
            className="flex-1 resize-none px-4 py-3 text-sm focus:outline-none"
            style={{
              border: "1.5px solid #E8E4F3", borderRadius: "16px", background: "#fff",
              color: "#12012E", fontSize: "16px",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* Voice button */}
          <button onClick={toggleVoice} disabled={reachedLimit || loading}
            className="press w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
            style={isListening
              ? { background: "#FFF1F2", border: "1.5px solid #FECDD3", color: "#FF4757" }
              : { background: "#EDE9FE", border: "1.5px solid #DDD6FE", color: "#7C3AED" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {/* Send button */}
          <button onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading || reachedLimit}
            className="press w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
