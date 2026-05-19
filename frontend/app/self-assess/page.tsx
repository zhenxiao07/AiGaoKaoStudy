"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { submitSelfAssess } from "@/lib/api"

const INTEREST_GROUPS = [
  {
    label: "理工技术", emoji: "⚙️", bg: "#EEF2FF", accent: "#4F46E5",
    items: [
      { id: "coding",       label: "编程/计算机", emoji: "💻", holland: "I" },
      { id: "math",         label: "数学/统计",   emoji: "📐", holland: "I" },
      { id: "electronics",  label: "电子/电气",   emoji: "⚡", holland: "R" },
      { id: "engineering",  label: "机械/工程",   emoji: "🔧", holland: "R" },
    ],
  },
  {
    label: "生命医学", emoji: "🧬", bg: "#F0FDF4", accent: "#059669",
    items: [
      { id: "medicine",     label: "医学/健康",   emoji: "🏥", holland: "I" },
      { id: "biology",      label: "生物/化学",   emoji: "🔬", holland: "I" },
      { id: "environment",  label: "环境/生态",   emoji: "🌱", holland: "R" },
    ],
  },
  {
    label: "人文社科", emoji: "📚", bg: "#FFFBEB", accent: "#D97706",
    items: [
      { id: "law",          label: "法律/政治",   emoji: "⚖️", holland: "E" },
      { id: "economics",    label: "经济/商业",   emoji: "📈", holland: "E" },
      { id: "psychology",   label: "心理/教育",   emoji: "🧠", holland: "S" },
      { id: "history",      label: "历史/哲学",   emoji: "🏛️", holland: "I" },
    ],
  },
  {
    label: "艺术创意", emoji: "🎨", bg: "#FFF1F2", accent: "#E11D48",
    items: [
      { id: "design",       label: "设计/美术",   emoji: "🎨", holland: "A" },
      { id: "music",        label: "音乐/表演",   emoji: "🎵", holland: "A" },
      { id: "writing",      label: "写作/文学",   emoji: "✍️", holland: "A" },
      { id: "media",        label: "新媒体/传播", emoji: "📸", holland: "A" },
    ],
  },
  {
    label: "管理运营", emoji: "👔", bg: "#F5F3FF", accent: "#7C3AED",
    items: [
      { id: "management",   label: "管理/领导",   emoji: "🧭", holland: "E" },
      { id: "finance",      label: "财务/会计",   emoji: "💰", holland: "C" },
      { id: "sports",       label: "体育/运动",   emoji: "⚽", holland: "R" },
      { id: "agriculture",  label: "农林/食品",   emoji: "🌾", holland: "R" },
    ],
  },
]

const PERSONALITY_PAIRS = [
  [{ id: "extrovert", label: "外向", desc: "喜欢社交与表达", emoji: "🗣️", mbti: "E" },
   { id: "introvert", label: "内向", desc: "享受独处与思考", emoji: "📖", mbti: "I" }],
  [{ id: "practical", label: "务实", desc: "注重实际动手",   emoji: "🔨", mbti: "S" },
   { id: "creative",  label: "创意", desc: "富有想象与灵感", emoji: "💡", mbti: "N" }],
  [{ id: "logical",   label: "理性", desc: "逻辑分析驱动",   emoji: "🧩", mbti: "T" },
   { id: "empathetic",label: "感性", desc: "关注情感体验",   emoji: "❤️", mbti: "F" }],
  [{ id: "planned",   label: "计划", desc: "喜欢有序安排",   emoji: "📅", mbti: "J" },
   { id: "flexible",  label: "灵活", desc: "随机应变自由",   emoji: "🎲", mbti: "P" }],
]

export default function SelfAssessPage() {
  const router = useRouter()
  const { setSelfAssessData, setResult } = useAppStore()

  const [interests, setInterests] = useState<string[]>([])
  const [personality, setPersonality] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const toggleInterest = (id: string) => {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const togglePersonality = (id: string) => {
    const opposite: Record<string, string> = {
      extrovert: "introvert", introvert: "extrovert",
      practical: "creative",  creative: "practical",
      logical: "empathetic",  empathetic: "logical",
      planned: "flexible",    flexible: "planned",
    }
    const opp = opposite[id]
    setPersonality(prev => {
      const filtered = opp ? prev.filter(x => x !== opp) : prev
      return filtered.includes(id) ? filtered.filter(x => x !== id) : [...filtered, id]
    })
  }

  const canSubmit = interests.length >= 2 && personality.length >= 2

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true); setError("")
    try {
      const interestTags = interests.map(id => {
        for (const g of INTEREST_GROUPS) {
          const f = g.items.find(it => it.id === id)
          if (f) return f.label
        }
        return id
      })
      const personalityTags = personality.map(id => {
        for (const pair of PERSONALITY_PAIRS) {
          const f = pair.find(p => p.id === id)
          if (f) return f.label
        }
        return id
      })
      setSelfAssessData({ interests: interestTags, personality: personalityTags, province: "广东" })
      const hollandMap: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
      for (const id of interests)
        for (const g of INTEREST_GROUPS) {
          const f = g.items.find(it => it.id === id)
          if (f) hollandMap[f.holland] = (hollandMap[f.holland] || 0) + 1
        }
      const mbtiMap: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
      for (const pair of PERSONALITY_PAIRS)
        for (const tag of pair)
          if (personality.includes(tag.id)) mbtiMap[tag.mbti] = (mbtiMap[tag.mbti] || 0) + 1
      const result = await submitSelfAssess({
        province: "广东", interests: interestTags, personality: personalityTags,
        holland_scores: hollandMap, mbti_scores: mbtiMap,
      })
      setResult(result)
      router.push("/results/majors")
    } catch {
      setError("提交失败，请检查后端服务是否启动")
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #F7F5FF 0%, #EEF2FF 100%)" }}>
        <div className="text-center px-6">
          <div className="text-7xl mb-6 animate-bounce">🤖</div>
          <p className="text-2xl font-black mb-2" style={{ color: "#12012E" }}>AI 正在分析中…</p>
          <p className="text-sm" style={{ color: "#7B6F92" }}>结合兴趣与性格，为你匹配最适合的专业</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0,1,2,3,4].map(i => (
              <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#7C3AED", animationDelay: `${i*100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-36" style={{ background: "#F7F5FF" }}>

      {/* Header */}
      <div className="sticky top-0 z-20" style={{ background: "rgba(247,245,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "#EDE9FE", color: "#7C3AED" }}>‹</button>
          <div className="flex-1">
            <h1 className="font-black text-base" style={{ color: "#12012E" }}>了解自己</h1>
            <p className="text-xs" style={{ color: "#7B6F92" }}>选兴趣 + 选性格 → AI 推荐专业</p>
          </div>
          {/* progress chips */}
          <div className="flex gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: interests.length >= 2 ? "#7C3AED" : "#EDE9FE", color: interests.length >= 2 ? "#fff" : "#7B6F92" }}>
              兴趣 {interests.length}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: personality.length >= 2 ? "#7C3AED" : "#EDE9FE", color: personality.length >= 2 ? "#fff" : "#7B6F92" }}>
              性格 {personality.length}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">

        {/* 精准测评入口 */}
        <button onClick={() => { setSelfAssessData({ interests: [], personality: [], province: "广东" }); router.push("/assessment") }}
          className="press w-full rounded-3xl p-5 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
          <div className="absolute right-4 top-4 text-5xl opacity-20">🧠</div>
          <div className="relative">
            <div className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">推荐 · 更精准</div>
            <div className="text-white font-black text-lg mb-1">参加 40 题精准测评</div>
            <div className="text-purple-200 text-sm">MBTI + Holland 科学双测评，结果更准确</div>
            <div className="mt-3 inline-flex items-center gap-1 text-white text-sm font-semibold">
              立即开始 <span>→</span>
            </div>
          </div>
        </button>

        {/* divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "#E8E4F3" }} />
          <span className="text-xs font-medium px-2" style={{ color: "#7B6F92" }}>或快速自填（2 分钟）</span>
          <div className="flex-1 h-px" style={{ background: "#E8E4F3" }} />
        </div>

        {/* 兴趣选择 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🌟</span>
            <div>
              <h2 className="font-black text-base" style={{ color: "#12012E" }}>兴趣爱好</h2>
              <p className="text-xs" style={{ color: "#7B6F92" }}>选 2 个以上你真正感兴趣的方向</p>
            </div>
          </div>

          {INTEREST_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{group.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: group.accent }}>{group.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map(item => {
                  const active = interests.includes(item.id)
                  return (
                    <button key={item.id} onClick={() => toggleInterest(item.id)}
                      className="press px-3 py-3 rounded-2xl text-sm font-semibold text-left flex items-center gap-2 border-2 transition-all"
                      style={active
                        ? { background: group.accent, borderColor: group.accent, color: "#fff" }
                        : { background: group.bg, borderColor: "transparent", color: group.accent }}>
                      <span className="text-base">{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 性格选择 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✨</span>
            <div>
              <h2 className="font-black text-base" style={{ color: "#12012E" }}>性格特点</h2>
              <p className="text-xs" style={{ color: "#7B6F92" }}>每对选一个更像你的描述</p>
            </div>
          </div>

          {PERSONALITY_PAIRS.map((pair, pi) => (
            <div key={pi} className="grid grid-cols-2 gap-2 mb-2">
              {pair.map(tag => {
                const active = personality.includes(tag.id)
                return (
                  <button key={tag.id} onClick={() => togglePersonality(tag.id)}
                    className="press p-3.5 rounded-2xl text-left border-2 transition-all"
                    style={active
                      ? { background: "#7C3AED", borderColor: "#7C3AED", color: "#fff" }
                      : { background: "#fff", borderColor: "#E8E4F3", color: "#12012E" }}>
                    <div className="text-xl mb-1">{tag.emoji}</div>
                    <div className="font-black text-sm">{tag.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{tag.desc}</div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-center text-sm py-3 px-4 rounded-2xl"
            style={{ background: "#FFF1F2", color: "#FF4757", border: "1px solid #FECDD3" }}>{error}</p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-8"
        style={{ background: "rgba(247,245,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto">
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="press w-full py-4 rounded-2xl font-black text-base transition-all"
            style={canSubmit
              ? { background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)", color: "#fff", boxShadow: "0 6px 20px rgba(124,58,237,0.4)" }
              : { background: "#EDE9FE", color: "#C4B5FD" }}>
            {canSubmit ? "🚀 AI 为我推荐专业" : `还需选 ${Math.max(0,2-interests.length)} 个兴趣 · ${Math.max(0,2-personality.length)} 个性格`}
          </button>
        </div>
      </div>
    </div>
  )
}
