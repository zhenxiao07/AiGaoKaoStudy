"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { MajorCard } from "@/lib/types"

const HOLLAND_DESC: Record<string, string> = {
  R: "实际型", I: "研究型", A: "艺术型", S: "社会型", E: "企业型", C: "常规型",
}

// ── MBTI Character config ─────────────────────────────────────────────────
interface CharCfg {
  bg1: string; bg2: string
  hair: string; hairStyle: "short" | "medium" | "long" | "curly" | "bob"
  shirt: string
  eyebrow: "arch" | "flat" | "furrow"
  mouth: "smile" | "smirk" | "wide" | "firm"
  icon: string; label: string
}

const MBTI_CHAR: Record<string, CharCfg> = {
  INTJ: { bg1:"#312e81", bg2:"#1e1b4b", hair:"#1e1b4b", hairStyle:"short",  shirt:"#4f46e5", eyebrow:"furrow", mouth:"firm",  icon:"🎯", label:"建筑师" },
  INTP: { bg1:"#1e40af", bg2:"#1e3a5f", hair:"#374151", hairStyle:"medium", shirt:"#2563eb", eyebrow:"arch",   mouth:"smirk", icon:"🔬", label:"逻辑学家" },
  ENTJ: { bg1:"#7f1d1d", bg2:"#450a0a", hair:"#111827", hairStyle:"short",  shirt:"#b91c1c", eyebrow:"furrow", mouth:"firm",  icon:"👑", label:"指挥官" },
  ENTP: { bg1:"#92400e", bg2:"#451a03", hair:"#92400e", hairStyle:"medium", shirt:"#d97706", eyebrow:"arch",   mouth:"smirk", icon:"💡", label:"辩论家" },
  INFJ: { bg1:"#0f766e", bg2:"#134e4a", hair:"#1f2937", hairStyle:"bob",    shirt:"#0d9488", eyebrow:"arch",   mouth:"smile", icon:"📖", label:"提倡者" },
  INFP: { bg1:"#6d28d9", bg2:"#4c1d95", hair:"#92400e", hairStyle:"long",   shirt:"#a855f7", eyebrow:"arch",   mouth:"smile", icon:"🌙", label:"调停者" },
  ENFJ: { bg1:"#b45309", bg2:"#78350f", hair:"#78350f", hairStyle:"bob",    shirt:"#d97706", eyebrow:"arch",   mouth:"wide",  icon:"⭐", label:"主角" },
  ENFP: { bg1:"#be185d", bg2:"#831843", hair:"#dc2626", hairStyle:"curly",  shirt:"#ec4899", eyebrow:"arch",   mouth:"wide",  icon:"🎨", label:"竞选者" },
  ISTJ: { bg1:"#1e3a8a", bg2:"#172554", hair:"#111827", hairStyle:"short",  shirt:"#1e40af", eyebrow:"flat",   mouth:"firm",  icon:"📋", label:"物流师" },
  ISFJ: { bg1:"#065f46", bg2:"#064e3b", hair:"#78350f", hairStyle:"bob",    shirt:"#059669", eyebrow:"flat",   mouth:"smile", icon:"🛡️", label:"守护者" },
  ESTJ: { bg1:"#1e3a8a", bg2:"#0f172a", hair:"#374151", hairStyle:"short",  shirt:"#1d4ed8", eyebrow:"flat",   mouth:"firm",  icon:"📊", label:"总经理" },
  ESFJ: { bg1:"#9d174d", bg2:"#500724", hair:"#d4a853", hairStyle:"bob",    shirt:"#ec4899", eyebrow:"arch",   mouth:"wide",  icon:"💝", label:"执政官" },
  ISTP: { bg1:"#1f2937", bg2:"#0f172a", hair:"#374151", hairStyle:"short",  shirt:"#374151", eyebrow:"flat",   mouth:"smirk", icon:"🔧", label:"鉴赏家" },
  ISFP: { bg1:"#5b21b6", bg2:"#3b0764", hair:"#d97706", hairStyle:"long",   shirt:"#7c3aed", eyebrow:"arch",   mouth:"smile", icon:"🌸", label:"探险家" },
  ESTP: { bg1:"#b91c1c", bg2:"#7f1d1d", hair:"#1f2937", hairStyle:"medium", shirt:"#dc2626", eyebrow:"furrow", mouth:"smirk", icon:"⚡", label:"企业家" },
  ESFP: { bg1:"#b45309", bg2:"#78350f", hair:"#fbbf24", hairStyle:"curly",  shirt:"#f59e0b", eyebrow:"arch",   mouth:"wide",  icon:"🎵", label:"表演者" },
}

const HAIR_PATHS = {
  short:  "M30,42 C30,18 70,18 70,42 C65,22 55,14 50,14 C45,14 35,22 30,42Z",
  medium: "M28,44 C26,14 74,14 72,44 C67,20 57,12 50,12 C43,12 33,20 28,44Z",
  long:   "M28,44 C26,14 74,14 72,44 L76,70 C64,62 59,52 57,44 Q50,54 43,44 C41,52 36,62 24,70Z",
  curly:  "M24,44 C18,24 26,6 40,8 C43,2 48,2 50,4 C52,2 57,2 60,8 C74,6 82,24 76,44 C68,22 60,14 50,14 C40,14 32,22 24,44Z",
  bob:    "M28,44 C26,14 74,14 72,44 L74,58 C64,54 58,48 57,44 Q50,52 43,44 C42,48 36,54 26,58Z",
}

const MOUTH_PATHS = {
  smile: "M44,53 Q50,57 56,53",
  smirk: "M44,52 Q50,55 58,51",
  wide:  "M42,52 Q50,59 58,52",
  firm:  "M44,53 L56,53",
}

function MBTICharacter({ type, size = 120 }: { type: string; size?: number }) {
  const cfg = MBTI_CHAR[type] || MBTI_CHAR.INFP
  const skin = "#FBBF8F"
  const hairPath = HAIR_PATHS[cfg.hairStyle]
  const mouthPath = MOUTH_PATHS[cfg.mouth]

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `radial-gradient(circle at 40% 35%, ${cfg.bg1}, ${cfg.bg2})`,
      overflow: "hidden",
      boxShadow: `0 8px 24px ${cfg.bg2}88`,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* shirt / body */}
        <path d="M8,100 C8,74 26,67 50,65 C74,67 92,74 92,100Z" fill={cfg.shirt} />
        {/* collar V */}
        <path d="M44,65 L50,72 L56,65" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
        {/* neck */}
        <rect x="44" y="60" width="12" height="14" rx="4" fill={skin} />
        {/* head */}
        <ellipse cx="50" cy="42" rx="20" ry="22" fill={skin} />
        {/* hair */}
        <path d={hairPath} fill={cfg.hair} />
        {/* ears */}
        <ellipse cx="30" cy="43" rx="3.5" ry="4.5" fill={skin} />
        <ellipse cx="70" cy="43" rx="3.5" ry="4.5" fill={skin} />
        {/* eyes */}
        <circle cx="43" cy="40" r="3" fill="#1e1b4b" />
        <circle cx="57" cy="40" r="3" fill="#1e1b4b" />
        <circle cx="44.2" cy="38.8" r="1" fill="white" />
        <circle cx="58.2" cy="38.8" r="1" fill="white" />
        {/* eyebrows */}
        {cfg.eyebrow === "arch" && <>
          <path d="M39,34 Q43,31 47,33" stroke={cfg.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M53,33 Q57,31 61,34" stroke={cfg.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>}
        {cfg.eyebrow === "flat" && <>
          <line x1="39" y1="33" x2="47" y2="33" stroke={cfg.hair} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="53" y1="33" x2="61" y2="33" stroke={cfg.hair} strokeWidth="1.8" strokeLinecap="round" />
        </>}
        {cfg.eyebrow === "furrow" && <>
          <path d="M39,33 Q43,35 47,33" stroke={cfg.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M53,33 Q57,35 61,33" stroke={cfg.hair} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>}
        {/* nose (subtle) */}
        <path d="M49,46 Q50,50 51,46" stroke="#c8855a" strokeWidth="1" fill="none" strokeLinecap="round" />
        {/* mouth */}
        <path d={mouthPath} stroke="#9a5232" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* icon badge */}
        <circle cx="76" cy="20" r="14" fill="white" fillOpacity="0.92" />
        <text x="76" y="25" textAnchor="middle" fontSize="15" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
          {cfg.icon}
        </text>
      </svg>
    </div>
  )
}

// ── Major card ────────────────────────────────────────────────────────────

function MajorCardItem({ major, rank }: { major: MajorCard; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  const empStyle =
    major.employment_rating === "高"
      ? { bg: "#F0FDF4", color: "#059669", border: "#A7F3D0" }
      : major.employment_rating === "中"
      ? { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" }
      : { bg: "#FFF1F2", color: "#E11D48", border: "#FECDD3" }

  const rankGrad = ["linear-gradient(135deg,#FFD700,#FFA500)", "linear-gradient(135deg,#C0C0C0,#A0A0A0)", "linear-gradient(135deg,#CD7F32,#A0522D)"]

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
              style={{ background: rank <= 3 ? rankGrad[rank - 1] : "#EDE9FE", color: rank <= 3 ? "#fff" : "#7C3AED" }}>
              {rank}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base" style={{ color: "#12012E" }}>{major.name}</h3>
                {major.has_xuefeng && (
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-black"
                    style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff" }}>
                    张⚡
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 inline-block"
                style={{ background: empStyle.bg, color: empStyle.color, borderColor: empStyle.border }}>
                就业{major.employment_rating}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xl font-black" style={{ color: "#7C3AED" }}>
              {major.score.toFixed(0)}<span className="text-xs font-normal" style={{ color: "#7B6F92" }}>分</span>
            </div>
            <div className="text-xs" style={{ color: "#7B6F92" }}>{major.avg_salary}</div>
          </div>
        </div>

        <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: "#4B3F6B" }}>{major.fit_reason}</p>

        {major.caution && (
          <p className="text-xs px-3 py-2 rounded-xl mb-3"
            style={{ background: "#FFF7ED", color: "#EA580C", border: "1px solid #FED7AA" }}>
            ⚠️ {major.caution}
          </p>
        )}

        <button onClick={() => setExpanded(!expanded)}
          className="press text-xs font-semibold flex items-center gap-1"
          style={{ color: "#7C3AED" }}>
          {expanded ? "收起 ▲" : "查看详情 ▼"}
        </button>
      </div>

      {expanded && (
        <div className="border-t px-5 py-4 space-y-3" style={{ background: "#FAFAFE", borderColor: "#E8E4F3" }}>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "MBTI匹配", val: `${major.mbti_match.toFixed(0)}%`, color: "#4F46E5" },
              { label: "Holland匹配", val: `${major.holland_match.toFixed(0)}%`, color: "#059669" },
              { label: "就业前景", val: `${major.employment_score.toFixed(0)}分`, color: "#D97706" },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-3" style={{ background: "#fff", border: "1px solid #E8E4F3" }}>
                <div className="text-xs mb-1" style={{ color: "#7B6F92" }}>{item.label}</div>
                <div className="text-base font-black" style={{ color: item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function MajorsPage() {
  const router = useRouter()
  const { result } = useAppStore()

  useEffect(() => {
    if (!result) router.replace("/")
  }, [result, router])

  if (!result) return null

  const FREE_LIMIT = 3
  const majors = result.recommended_majors
  const mbtiType = result.mbti_type || "INFP"
  const charCfg = MBTI_CHAR[mbtiType] || MBTI_CHAR.INFP

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F5FF" }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-20"
        style={{ background: "rgba(247,245,255,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "#EDE9FE", color: "#7C3AED" }}>‹</button>
          <div className="flex-1">
            <h1 className="font-black text-base" style={{ color: "#12012E" }}>专业推荐</h1>
            <p className="text-xs" style={{ color: "#7B6F92" }}>共 {majors.length} 个方向</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-black text-white"
            style={{ background: `radial-gradient(circle, ${charCfg.bg1}, ${charCfg.bg2})` }}>
            {mbtiType} · {charCfg.label}
          </span>
        </div>
      </div>

      {/* Character hero */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <div className="rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden"
          style={{ background: `radial-gradient(circle at 30% 50%, ${charCfg.bg1}, ${charCfg.bg2})` }}>
          {/* decorative ring */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full opacity-10"
            style={{ border: "16px solid white" }} />
          <MBTICharacter type={mbtiType} size={96} />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-0.5">{charCfg.label}</p>
            <p className="text-white font-black text-xl leading-tight mb-1">{mbtiType}</p>
            <p className="text-white/80 text-xs leading-relaxed line-clamp-2">{result.mbti_desc}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {result.holland_top2.map(dim => (
                <span key={dim} className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                  {HOLLAND_DESC[dim] || dim}型
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Major list */}
      <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: "#7B6F92" }}>
          🎓 AI 推荐专业
        </p>

        {majors.slice(0, FREE_LIMIT).map((m, i) => (
          <MajorCardItem key={m.name} major={m} rank={i + 1} />
        ))}

        {/* Paywall — standalone card, no overlay */}
        {majors.length > FREE_LIMIT && (
          <div className="card p-6 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #F5F3FF, #EDE9FE)" }}>
            {/* gradient top stripe */}
            <div className="absolute top-0 left-0 right-0 h-1"
              style={{ background: "linear-gradient(90deg, #7C3AED, #FF4757)", borderRadius: "20px 20px 0 0" }} />
            <div className="text-4xl mb-3">🔓</div>
            <p className="font-black text-lg mb-1" style={{ color: "#12012E" }}>解锁完整推荐</p>
            <p className="text-sm mb-5" style={{ color: "#7B6F92" }}>
              还有 <span className="font-black" style={{ color: "#7C3AED" }}>{majors.length - FREE_LIMIT}</span> 个精准专业 + AI院校志愿方案
            </p>
            <div className="text-left space-y-2 mb-5 max-w-[220px] mx-auto">
              {["全部专业详细报告", "AI个性化院校志愿方案", "无限次AI顾问咨询"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm" style={{ color: "#4B3F6B" }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0"
                    style={{ background: "#059669" }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
            <button className="press w-full py-3.5 rounded-2xl font-black text-base text-white"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)", boxShadow: "0 6px 20px rgba(124,58,237,0.35)" }}>
              开通会员 · ¥49
            </button>
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-8"
        style={{ background: "rgba(247,245,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #E8E4F3" }}>
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
          <button onClick={() => router.push("/results/schools")}
            className="press py-4 rounded-2xl font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
            🎓 去选院校
          </button>
          <button onClick={() => router.push("/chat")}
            className="press py-4 rounded-2xl font-black text-sm"
            style={{ background: "#fff", border: "2px solid #E8E4F3", color: "#7C3AED" }}>
            💬 问问AI顾问
          </button>
        </div>
      </div>
    </div>
  )
}
