"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { gaokaoRecommend, gaokaoProvinces } from "@/lib/api"
import { GaokaoSchoolCard, GaokaoResult } from "@/lib/types"

const TIER_CONFIG = {
  冲: {
    label: "冲一冲", desc: "录取概率 15~40%，值得一试",
    gradient: "linear-gradient(135deg, #FF4757 0%, #C0392B 100%)",
    light: { bg: "#FFF1F2", color: "#FF4757", border: "#FECDD3" },
    glow: "rgba(255,71,87,0.35)",
  },
  稳: {
    label: "稳一稳", desc: "录取概率 55~70%，重点目标",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
    light: { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" },
    glow: "rgba(124,58,237,0.35)",
  },
  保: {
    label: "保一保", desc: "录取概率 90%+，兜底保障",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    light: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
    glow: "rgba(5,150,105,0.3)",
  },
} as const

const TAG_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "985": { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  "211": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  "双一流": { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
}

function TrendSparkline({ trend }: { trend: GaokaoSchoolCard["trend"] }) {
  const pts = trend.filter(t => t.min_score != null)
  if (pts.length < 2) return null
  const scores = pts.map(p => p.min_score as number)
  const min = Math.min(...scores) - 5
  const max = Math.max(...scores) + 5
  const W = 72, H = 28
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W
    const y = H - ((p.min_score! - min) / (max - min)) * H
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={points} fill="none" stroke="#7C3AED" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => {
        const x = (i / (pts.length - 1)) * W
        const y = H - ((p.min_score! - min) / (max - min)) * H
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#7C3AED" />
      })}
    </svg>
  )
}

function SchoolCard({ card, rank }: { card: GaokaoSchoolCard; rank: number }) {
  const [trendOpen, setTrendOpen] = useState(false)
  const tierCfg = TIER_CONFIG[card.tier]
  const probPct = Math.round(card.probability * 100)
  const hasMajorData = (card.eligible_majors?.length ?? 0) > 0

  // Collect all unique years from eligible_majors for table header
  const allYears: number[] = []
  if (hasMajorData) {
    const yearSet = new Set<number>()
    card.eligible_majors.forEach(m => (m.year_scores ?? []).forEach(y => yearSet.add(y.year)))
    allYears.push(...Array.from(yearSet).sort())
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        {/* Tier badge + rank */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: "#EDE9FE", color: "#7C3AED" }}>
            {rank}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: tierCfg.light.bg, color: tierCfg.light.color, border: `1px solid ${tierCfg.light.border}` }}>
            {tierCfg.label}
          </span>
          {card.is_volatile && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#FFF7ED", color: "#EA580C", border: "1px solid #FED7AA" }}>波动大</span>
          )}
        </div>

        {/* School name + probability */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-base leading-tight mb-0.5" style={{ color: "#12012E" }}>
              {card.university_name}
            </h3>
            <p className="text-xs mb-2" style={{ color: "#7B6F92" }}>
              {card.uni_province} · {card.uni_city} · {card.batch}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {card.school_tags.map(tag => {
                const s = TAG_STYLE[tag] || { bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" }
                return (
                  <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                    {tag}
                  </span>
                )
              })}
            </div>
          </div>
          {/* Probability circle */}
          <div className="flex-shrink-0 text-center">
            <div className="w-14 h-14 rounded-full flex flex-col items-center justify-center"
              style={{ background: tierCfg.light.bg, border: `2px solid ${tierCfg.light.border}` }}>
              <span className="text-lg font-black leading-none" style={{ color: tierCfg.light.color }}>{probPct}%</span>
              <span className="text-[9px] font-medium" style={{ color: tierCfg.light.color }}>录取率</span>
            </div>
          </div>
        </div>

        {/* Score / rank strip */}
        <div className="flex items-center gap-4 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F0EDF8" }}>
          {card.latest_score != null && (
            <div>
              <span className="text-xs" style={{ color: "#7B6F92" }}>近年最低分 </span>
              <span className="text-sm font-black" style={{ color: "#12012E" }}>{card.latest_score}</span>
            </div>
          )}
          {card.latest_rank != null && (
            <div>
              <span className="text-xs" style={{ color: "#7B6F92" }}>最低位次 </span>
              <span className="text-sm font-black" style={{ color: "#12012E" }}>{card.latest_rank.toLocaleString()}</span>
            </div>
          )}
          <div className="ml-auto">
            <TrendSparkline trend={card.trend} />
          </div>
        </div>

        {/* ── Per-major historical scores table (always visible when data exists) ── */}
        {hasMajorData && allYears.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid #F0EDF8" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#7B6F92" }}>📚 专业录取分数（历年）</p>
            <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #E8E4F3" }}>
              <table className="w-full text-xs" style={{ minWidth: `${120 + allYears.length * 44 + 80}px` }}>
                <thead>
                  <tr style={{ background: "#EDE9FE" }}>
                    <th className="text-left px-2.5 py-2 font-bold sticky left-0"
                      style={{ color: "#4B3F6B", background: "#EDE9FE", minWidth: "120px" }}>专业</th>
                    {allYears.map(y => (
                      <th key={y} className="text-right px-2 py-2 font-bold" style={{ color: "#4B3F6B" }}>
                        {String(y).slice(2)}年
                      </th>
                    ))}
                    <th className="text-right px-2 py-2 font-bold" style={{ color: "#4B3F6B" }}>均线</th>
                    <th className="text-right px-2.5 py-2 font-bold" style={{ color: "#4B3F6B" }}>分差</th>
                  </tr>
                </thead>
                <tbody>
                  {card.eligible_majors.map((m, idx) => {
                    const tierColor = m.tier === "保" ? "#059669" : m.tier === "稳" ? "#7C3AED" : "#FF4757"
                    const tierBg   = m.tier === "保" ? "#ECFDF5" : m.tier === "稳" ? "#F5F3FF" : "#FFF1F2"
                    const gapStr   = m.gap >= 0 ? `+${m.gap}` : `${m.gap}`
                    const scoreMap = Object.fromEntries((m.year_scores ?? []).map(y => [y.year, y.min_score]))
                    return (
                      <tr key={m.name} style={{ borderTop: "1px solid #E8E4F3", background: idx % 2 === 0 ? "#fff" : "#FAFAFE" }}>
                        <td className="px-2.5 py-2 sticky left-0" style={{ background: idx % 2 === 0 ? "#fff" : "#FAFAFE" }}>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black px-1 py-0.5 rounded flex-shrink-0"
                              style={{ background: tierBg, color: tierColor }}>{m.tier}</span>
                            <span className="font-semibold" style={{ color: "#12012E" }}>{m.name}</span>
                          </div>
                        </td>
                        {allYears.map(y => (
                          <td key={y} className="text-right px-2 py-2" style={{ color: "#4B3F6B" }}>
                            {scoreMap[y] ?? "—"}
                          </td>
                        ))}
                        <td className="text-right px-2 py-2 font-black" style={{ color: "#12012E" }}>
                          {m.avg_min_score}
                        </td>
                        <td className="text-right px-2.5 py-2 font-bold" style={{ color: tierColor }}>
                          {gapStr}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expand button for school-level trend */}
        <button className="press w-full mt-3 text-xs font-semibold flex items-center justify-center gap-1"
          style={{ color: "#7C3AED" }}
          onClick={() => setTrendOpen(!trendOpen)}>
          学校历年位次 {trendOpen ? "▲" : "▼"}
        </button>
      </div>

      {/* School-level trend table */}
      {trendOpen && (
        <div className="border-t px-4 py-3" style={{ background: "#FAFAFE", borderColor: "#E8E4F3" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#7B6F92" }}>
                <th className="text-left py-1 font-medium">年份</th>
                <th className="text-right font-medium">最低分</th>
                <th className="text-right font-medium">最低位次</th>
              </tr>
            </thead>
            <tbody>
              {card.trend.slice().reverse().map(pt => (
                <tr key={pt.year} style={{ borderTop: "1px solid #E8E4F3" }}>
                  <td className="py-1.5 font-bold" style={{ color: "#4B3F6B" }}>{pt.year}</td>
                  <td className="text-right font-black" style={{ color: "#12012E" }}>{pt.min_score ?? "—"}</td>
                  <td className="text-right" style={{ color: "#7B6F92" }}>{pt.min_rank != null ? pt.min_rank.toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// 演示数据中的专业列表（与 create_major_demo.py 保持一致）
const MAJORS_BY_TYPE: Record<string, string[]> = {
  理科: [
    "计算机科学与技术", "软件工程", "人工智能", "数据科学与大数据技术",
    "电气工程及其自动化", "机械工程", "土木工程", "化学工程与工艺",
    "数学与应用数学", "统计学", "物理学",
    "金融学", "经济学", "临床医学", "药学",
    "英语", "汉语言文学", "法学", "工商管理", "新闻传播学",
  ],
  文科: [
    "汉语言文学", "历史学", "哲学",
    "经济学", "金融学", "会计学", "工商管理",
    "法学", "新闻学", "英语",
    "行政管理", "国际关系", "政治学", "社会学", "教育学",
  ],
}

export default function SchoolsPage() {
  const router = useRouter()
  const { userInfo, result } = useAppStore()

  const [activeTier, setActiveTier] = useState<"冲" | "稳" | "保">("稳")
  const [data, setData] = useState<GaokaoResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<string[]>([])

  // filter state
  const [province, setProvince] = useState(userInfo?.province ?? "河北")
  const [subjectType, setSubjectType] = useState(userInfo?.subject_type ?? "理科")
  const [score, setScore] = useState<string>(userInfo?.score?.toString() ?? "")
  const [batches, setBatches] = useState<string[]>(["本科一批", "本科二批"])

  // major selection
  const [selectedMajors, setSelectedMajors] = useState<string[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

  const BATCHES = ["本科提前批", "本科一批", "本科二批", "专科批"]
  const availableMajors = MAJORS_BY_TYPE[subjectType] ?? MAJORS_BY_TYPE["理科"]

  // AI-recommended major names (flat list)
  const aiMajorNames = result?.recommended_majors.map(m => m.name) ?? []

  useEffect(() => { gaokaoProvinces().then(setProvinces) }, [])

  const toggleMajor = (name: string) =>
    setSelectedMajors(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    )

  const importFromAI = () => {
    const valid = aiMajorNames.filter(n => availableMajors.includes(n))
    setSelectedMajors(prev => [...new Set([...prev, ...valid])])
  }

  const doFetch = async () => {
    const scoreNum = score ? parseInt(score, 10) : undefined
    if (!province || !subjectType) return
    setLoading(true); setError(null)
    try {
      const targets = selectedMajors.length > 0 ? selectedMajors : []
      const res = await gaokaoRecommend(province, subjectType, scoreNum, batches, 30, targets)
      if (res.results.error) setError(res.results.error)
      else setData(res)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "请求失败，请确认后端已启动")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { doFetch() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tierCards: GaokaoSchoolCard[] = data?.results[activeTier] ?? []
  const counts = data
    ? { 冲: data.results.冲.length, 稳: data.results.稳.length, 保: data.results.保.length }
    : { 冲: 0, 稳: 0, 保: 0 }

  return (
    <div className="min-h-screen" style={{ background: "#F7F5FF" }}>

      {/* Header */}
      <div className="sticky top-0 z-20" style={{ background: "rgba(247,245,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "#EDE9FE", color: "#7C3AED" }}>‹</button>
          <div className="flex-1">
            <h1 className="font-black text-base" style={{ color: "#12012E" }}>志愿推荐</h1>
            <p className="text-xs" style={{ color: "#7B6F92" }}>历史数据 2016–2020</p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-3">
        <div className="card p-4 space-y-3">

          {/* Province / Subject / Score */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[80px]">
              <label className="text-xs font-semibold block mb-1" style={{ color: "#7B6F92" }}>省份</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ border: "1.5px solid #E8E4F3", background: "#FAFAFE", color: "#12012E" }}
                value={province} onChange={e => setProvince(e.target.value)}>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="text-xs font-semibold block mb-1" style={{ color: "#7B6F92" }}>科类</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ border: "1.5px solid #E8E4F3", background: "#FAFAFE", color: "#12012E" }}
                value={subjectType} onChange={e => { setSubjectType(e.target.value); setSelectedMajors([]) }}>
                <option value="理科">理科</option>
                <option value="文科">文科</option>
              </select>
            </div>
            <div className="flex-1 min-w-[80px]">
              <label className="text-xs font-semibold block mb-1" style={{ color: "#7B6F92" }}>分数</label>
              <input type="number"
                className="w-full rounded-xl px-3 py-2 text-sm font-semibold"
                style={{ border: "1.5px solid #E8E4F3", background: "#FAFAFE", color: "#12012E" }}
                value={score} onChange={e => setScore(e.target.value)} placeholder="如 600" />
            </div>
          </div>

          {/* Batch */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "#7B6F92" }}>批次</label>
            <div className="flex gap-1.5 flex-wrap">
              {BATCHES.map(b => (
                <button key={b}
                  onClick={() => setBatches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}
                  className="press text-xs px-3 py-1 rounded-full font-bold"
                  style={batches.includes(b)
                    ? { background: "#7C3AED", color: "#fff", border: "1.5px solid #7C3AED" }
                    : { background: "#fff", color: "#7B6F92", border: "1.5px solid #E8E4F3" }}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Major picker */}
          {(
            <div className="rounded-2xl p-3 space-y-2" style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black" style={{ color: "#7C3AED" }}>
                  目标专业 {selectedMajors.length > 0 && <span className="font-normal opacity-70">（已选 {selectedMajors.length} 个）</span>}
                </span>
                <div className="flex items-center gap-2">
                  {aiMajorNames.length > 0 && (
                    <button onClick={importFromAI}
                      className="press text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "linear-gradient(135deg,#7C3AED,#FF4757)", color: "#fff" }}>
                      ✦ 导入AI推荐
                    </button>
                  )}
                  {selectedMajors.length > 0 && (
                    <button onClick={() => setSelectedMajors([])}
                      className="text-xs" style={{ color: "#7B6F92" }}>清空</button>
                  )}
                </div>
              </div>

              {/* Selected chips */}
              {selectedMajors.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedMajors.map(m => (
                    <span key={m} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold"
                      style={{ background: "#7C3AED", color: "#fff" }}>
                      {m}
                      <button onClick={() => toggleMajor(m)} className="opacity-70 hover:opacity-100 leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}

              {selectedMajors.length === 0 && (
                <p className="text-xs" style={{ color: "#A78BFA" }}>
                  请选择专业，只显示分数能达到该专业录取线的学校
                </p>
              )}

              {/* Picker toggle */}
              <button onClick={() => setPickerOpen(p => !p)}
                className="press w-full py-1.5 rounded-xl text-xs font-bold border-dashed border-2 transition-all"
                style={{ borderColor: "#DDD6FE", color: "#7C3AED", background: "transparent" }}>
                {pickerOpen ? "▲ 收起" : "＋ 选择专业"}
              </button>

              {/* Major grid */}
              {pickerOpen && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {availableMajors.map(m => {
                    const sel = selectedMajors.includes(m)
                    const fromAI = aiMajorNames.includes(m)
                    return (
                      <button key={m} onClick={() => toggleMajor(m)}
                        className="press text-xs px-2.5 py-1 rounded-full font-semibold transition-all"
                        style={sel
                          ? { background: "#7C3AED", color: "#fff", border: "1.5px solid #7C3AED" }
                          : fromAI
                          ? { background: "#FFF1F2", color: "#FF4757", border: "1.5px solid #FECDD3" }
                          : { background: "#fff", color: "#4B3F6B", border: "1.5px solid #E8E4F3" }}>
                        {fromAI && !sel && <span className="mr-0.5 text-[10px]">✦</span>}
                        {m}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <button onClick={doFetch} disabled={loading}
            className="press w-full py-3 rounded-2xl font-black text-sm text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>
            {loading ? "查询中…" : selectedMajors.length > 0
              ? `🔍 按 ${selectedMajors.length} 个专业筛选`
              : "🔍 查询推荐院校"}
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-lg mx-auto mx-4 px-4">
          <div className="rounded-2xl px-4 py-3 text-sm"
            style={{ background: "#FFF1F2", color: "#FF4757", border: "1px solid #FECDD3" }}>
            {error}
          </div>
        </div>
      )}

      {/* Tier tabs */}
      {data && !error && (
        <div className="max-w-lg mx-auto px-4 pt-2">
          <div className="grid grid-cols-3 gap-2 mb-2">
            {(["冲", "稳", "保"] as const).map(tier => {
              const cfg = TIER_CONFIG[tier]
              const isActive = activeTier === tier
              return (
                <button key={tier} onClick={() => setActiveTier(tier)}
                  className="press py-3 rounded-2xl font-black text-sm transition-all"
                  style={isActive
                    ? { background: cfg.gradient, color: "#fff", boxShadow: `0 4px 16px ${cfg.glow}` }
                    : { background: "#fff", color: "#7B6F92", border: "1.5px solid #E8E4F3" }}>
                  {cfg.label}
                  <span className={`ml-1 text-xs font-semibold ${isActive ? "opacity-80" : ""}`}>
                    ({counts[tier]})
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-center mb-3" style={{ color: "#7B6F92" }}>
            {TIER_CONFIG[activeTier].desc}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="max-w-lg mx-auto px-4 pb-24 space-y-3">
        {loading && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 animate-bounce">🔍</div>
            <p className="text-sm font-semibold" style={{ color: "#7B6F92" }}>正在从 2016–2020 历史数据中为你匹配…</p>
            <div className="mt-4 flex justify-center gap-1.5">
              {[0,1,2,3,4].map(i => (
                <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: "#7C3AED", animationDelay: `${i*100}ms` }} />
              ))}
            </div>
          </div>
        )}

        {!loading && data && tierCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔎</div>
            <p className="text-sm font-semibold" style={{ color: "#7B6F92" }}>该档位暂无匹配院校，可调整分数或批次再试</p>
          </div>
        )}

        {!loading && tierCards.map((card, i) => (
          <SchoolCard key={`${card.university_name}_${card.batch}_${i}`} card={card} rank={i + 1} />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-8"
        style={{ background: "rgba(247,245,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
          <button onClick={() => router.push("/results/majors")}
            className="press py-3.5 rounded-2xl font-black text-sm"
            style={{ background: "#fff", border: "2px solid #E8E4F3", color: "#7C3AED" }}>
            ← 专业推荐
          </button>
          <button onClick={() => router.push("/chat")}
            className="press py-3.5 rounded-2xl font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>
            💬 AI 顾问
          </button>
        </div>
      </div>
    </div>
  )
}
