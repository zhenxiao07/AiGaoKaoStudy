"use client"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-noise"
      style={{ background: "linear-gradient(145deg, #F7F5FF 0%, #EEF2FF 50%, #FFF5F5 100%)" }}>

      {/* Decorative blobs */}
      <div className="animate-float pointer-events-none absolute -top-10 -left-10 w-52 h-52 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }} />
      <div className="animate-float-slow pointer-events-none absolute top-32 -right-12 w-40 h-40 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #FF4757 0%, transparent 70%)" }} />
      <div className="animate-float pointer-events-none absolute bottom-40 -left-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)" }}
        />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-10">

        {/* Top badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.25)", animationDelay: "0.1s" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7C3AED" }} />
          AI 驱动 · 张雪峰风格 · 2,700+ 高校数据
        </div>

        {/* Hero text */}
        <div className="animate-fade-up text-center mb-2" style={{ animationDelay: "0.2s" }}>
          <div className="text-6xl font-black leading-none mb-1" style={{ color: "#12012E" }}>
            AI
          </div>
          <div className="text-6xl font-black leading-none"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #FF4757 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            志愿师
          </div>
        </div>
        <p className="animate-fade-up text-center text-sm mb-10 max-w-[260px] leading-relaxed"
          style={{ color: "#7B6F92", animationDelay: "0.3s" }}>
          摸清自己 → 匹配专业 → 锁定院校<br />
          从测评到志愿，一站搞定
        </p>

        {/* Entry cards */}
        <div className="animate-fade-up w-full max-w-sm space-y-3" style={{ animationDelay: "0.4s" }}>

          {/* 探索专业 */}
          <button
            onClick={() => router.push("/self-assess")}
            className="press w-full rounded-3xl p-5 text-left overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}>
            {/* Shine */}
            <div className="absolute inset-0 opacity-20"
              style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <div className="text-white font-black text-lg leading-tight">探索专业方向</div>
                    <div className="text-purple-200 text-xs mt-0.5">兴趣 × 性格 → AI精准匹配</div>
                  </div>
                </div>
                <span className="text-white/50 text-2xl">›</span>
              </div>
              <div className="flex gap-2">
                {["兴趣自评", "MBTI×Holland", "专业推荐"].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#E9D5FF" }}>{t}</span>
                ))}
              </div>
            </div>
          </button>

          {/* 按分数填报 */}
          <button
            onClick={() => router.push("/results/schools")}
            className="press w-full rounded-3xl p-5 text-left overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #FF4757 0%, #C0392B 100%)", boxShadow: "0 8px 30px rgba(255,71,87,0.35)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">📊</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-white font-black text-lg leading-tight">按分数填报志愿</div>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: "#FFE234", color: "#7A3000" }}>NEW</span>
                    </div>
                    <div className="text-red-200 text-xs mt-0.5">冲稳保智能分层 · 历年真实数据</div>
                  </div>
                </div>
                <span className="text-white/50 text-2xl">›</span>
              </div>
              <div className="flex gap-2">
                {["2016–2020数据", "2,700+高校", "32省份"].map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: "rgba(255,255,255,0.15)", color: "#FFD6D9" }}>{t}</span>
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* AI Chat entry */}
        <button
          onClick={() => router.push("/chat")}
          className="press animate-fade-up mt-6 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold"
          style={{ animationDelay: "0.5s", background: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(124,58,237,0.2)", color: "#7C3AED", backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(124,58,237,0.1)" }}>
          <span className="text-base">💬</span>
          有疑问？问问 AI 志愿师
          <span style={{ color: "#C4B5FD" }}>›</span>
        </button>

        {/* Stats */}
        <div className="animate-fade-up mt-8 flex items-center gap-4 text-center" style={{ animationDelay: "0.6s" }}>
          {[
            { num: "10,000+", label: "服务考生" },
            { num: "2,700+", label: "高校数据" },
            { num: "5年", label: "历史录取" },
          ].map(({ num, label }) => (
            <div key={label}>
              <div className="text-sm font-black" style={{ color: "#7C3AED" }}>{num}</div>
              <div className="text-xs" style={{ color: "#7B6F92" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
