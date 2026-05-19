import { UserInfo, SelfAssessSubmit, AssessmentResult, ChatMessage, GaokaoResult } from "./types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api"

export async function fetchQuestions() {
  const res = await fetch(`${BASE}/assessment/questions`)
  return res.json()
}

export async function submitAssessment(
  userInfo: UserInfo,
  answers: { question_id: number; selected_option: string }[]
): Promise<AssessmentResult> {
  const res = await fetch(`${BASE}/assessment/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_info: userInfo, answers }),
  })
  if (!res.ok) throw new Error("提交失败")
  return res.json()
}

export async function submitSelfAssess(data: SelfAssessSubmit): Promise<AssessmentResult> {
  const res = await fetch(`${BASE}/assessment/self-submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("提交失败")
  return res.json()
}

export async function sendChat(
  userInfo: UserInfo,
  mbtiType: string,
  topMajors: string[],
  topSchool: string,
  messages: ChatMessage[],
  newMessage: string
): Promise<string> {
  const res = await fetch(`${BASE}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_info: userInfo,
      mbti_type: mbtiType,
      top_majors: topMajors,
      top_school: topSchool,
      messages,
      new_message: newMessage,
    }),
  })
  const data = await res.json()
  return data.reply
}

export async function gaokaoProvinces(): Promise<string[]> {
  const res = await fetch(`${BASE}/gaokao/provinces`)
  const data = await res.json()
  return data.provinces ?? []
}

export async function gaokaoRecommend(
  province: string,
  subjectType: string,
  score: number | undefined,
  batches: string[] = ["本科一批", "本科二批"],
  topN: number = 30,
  targetMajors: string[] = [],
): Promise<GaokaoResult> {
  const res = await fetch(`${BASE}/gaokao/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      province,
      subject_type: subjectType,
      score: score ?? null,
      batches,
      top_n: topN,
      target_majors: targetMajors,
    }),
  })
  if (!res.ok) throw new Error("推荐请求失败")
  return res.json()
}

export async function gaokaoSearchSchools(q: string): Promise<{ university_name: string; uni_city: string; is_985: number; is_211: number }[]> {
  const res = await fetch(`${BASE}/gaokao/search?q=${encodeURIComponent(q)}`)
  const data = await res.json()
  return data.schools ?? []
}

export async function sendChatStream(
  userInfo: UserInfo,
  mbtiType: string,
  topMajors: string[],
  topSchool: string,
  messages: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const res = await fetch(`${BASE}/agent/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_info: userInfo,
      mbti_type: mbtiType,
      top_majors: topMajors,
      top_school: topSchool,
      messages,
      new_message: newMessage,
    }),
  })

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    const lines = chunk.split("\n")
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6)
        if (data === "[DONE]") { onDone(); return }
        try {
          const parsed = JSON.parse(data)
          onChunk(parsed.text)
        } catch {}
      }
    }
  }
  onDone()
}
