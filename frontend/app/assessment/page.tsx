"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { fetchQuestions, submitAssessment } from "@/lib/api"
import { Question } from "@/lib/types"

const DIMENSION_EMOJI: Record<string, string> = {
  EI: "🗣️", SN: "💡", TF: "❤️", JP: "📅",
  R: "🔧", I: "🔬", A: "🎨", S: "🤝", E: "📈", C: "📋",
}

export default function AssessmentPage() {
  const router = useRouter()
  const { userInfo, setResult } = useAppStore()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<{ question_id: number; selected_option: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    fetchQuestions().then((data) => setQuestions(data.questions))
  }, [])

  const handleSelect = (label: string) => {
    if (animating) return
    setSelectedOpt(label)
    const qid = questions[current].id
    const newAnswers = [...answers, { question_id: qid, selected_option: label }]
    setAnswers(newAnswers)

    if (current + 1 >= questions.length) {
      setTimeout(() => handleSubmit(newAnswers), 300)
      return
    }

    setAnimating(true)
    timerRef.current = setTimeout(() => {
      setCurrent((c) => c + 1)
      setSelectedOpt(null)
      setAnimating(false)
    }, 350)
  }

  const handleSubmit = async (finalAnswers: typeof answers) => {
    setSubmitting(true)
    try {
      const info = userInfo ?? { province: "广东" }
      const result = await submitAssessment(info, finalAnswers)
      setResult(result)
      router.push("/results/majors")
    } catch {
      alert("提交失败，请检查后端服务是否启动")
      setSubmitting(false)
    }
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F5FF" }}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🧠</div>
          <p className="font-black text-lg mb-2" style={{ color: "#12012E" }}>题目加载中…</p>
          <div className="flex justify-center gap-1.5">
            {[0,1,2,3,4].map(i => (
              <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#7C3AED", animationDelay: `${i*100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #F7F5FF 0%, #EEF2FF 100%)" }}>
        <div className="text-center px-6">
          <div className="text-7xl mb-6 animate-bounce">🤖</div>
          <p className="text-2xl font-black mb-2" style={{ color: "#12012E" }}>AI 正在分析中…</p>
          <p className="text-sm mb-6" style={{ color: "#7B6F92" }}>正在解析你的 MBTI 和 Holland 特征，为你匹配最适合的专业</p>
          <div className="flex justify-center gap-1.5">
            {[0,1,2,3,4].map(i => (
              <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#7C3AED", animationDelay: `${i*100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const q = questions[current]
  const progress = Math.round((current / questions.length) * 100)
  const dimEmoji = DIMENSION_EMOJI[q.dimension] || "❓"
  const isHolland = q.type === "holland"

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F5FF" }}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-20"
        style={{ background: "rgba(247,245,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "#EDE9FE", color: "#7C3AED" }}>‹</button>
              <span className="text-xs font-semibold" style={{ color: "#7B6F92" }}>
                第 {current + 1} / {questions.length} 题
              </span>
            </div>
            <span className="text-xs font-black" style={{ color: "#7C3AED" }}>{progress}%</span>
          </div>
          {/* Progress track */}
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E8E4F3" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7C3AED 0%, #FF4757 100%)" }} />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-10">
        <div className="w-full max-w-lg"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(12px) scale(0.98)" : "none",
            transition: "all 0.25s ease",
          }}>

          {/* Type badge */}
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={isHolland
                ? { background: "#FFF1F2", color: "#E11D48", border: "1px solid #FECDD3" }
                : { background: "#EDE9FE", color: "#7C3AED", border: "1px solid #DDD6FE" }}>
              <span className="text-sm">{dimEmoji}</span>
              {q.type === "mbti" ? `MBTI · ${q.dimension} 维度` : `Holland · ${q.dimension} 型`}
            </span>
          </div>

          {/* Question card */}
          <div className="card rounded-3xl p-7 mb-5">
            <p className="text-xl font-black text-center leading-relaxed mb-7" style={{ color: "#12012E" }}>
              {q.text}
            </p>

            <div className="space-y-2.5">
              {q.options.map((opt, oi) => {
                const isSelected = selectedOpt === opt.label
                const optColors = [
                  { active: "#7C3AED", lightBg: "#F5F3FF", lightBorder: "#DDD6FE" },
                  { active: "#059669", lightBg: "#F0FDF4", lightBorder: "#A7F3D0" },
                  { active: "#2563EB", lightBg: "#EFF6FF", lightBorder: "#BFDBFE" },
                  { active: "#D97706", lightBg: "#FFFBEB", lightBorder: "#FDE68A" },
                ]
                const col = optColors[oi % optColors.length]
                return (
                  <button key={opt.label} onClick={() => handleSelect(opt.label)}
                    className="press w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center gap-3"
                    style={isSelected
                      ? { background: col.active, borderColor: col.active, color: "#fff" }
                      : { background: col.lightBg, borderColor: col.lightBorder, color: "#12012E" }}>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={isSelected
                        ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                        : { background: "#fff", color: col.active }}>
                      {opt.label}
                    </span>
                    <span className="text-sm font-semibold leading-snug">{opt.text}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-center text-xs font-medium" style={{ color: "#C4B5FD" }}>
            点击选项后自动跳转下一题
          </p>
        </div>
      </div>
    </div>
  )
}
