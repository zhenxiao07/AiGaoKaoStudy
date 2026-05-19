export interface UserInfo {
  province: string
  score?: number
  subject_type?: string
  subject_selection?: string[]
}

export interface SelfAssessData {
  province: string
  interests: string[]
  personality: string[]
}

export interface SelfAssessSubmit {
  province: string
  interests: string[]
  personality: string[]
  holland_scores: Record<string, number>
  mbti_scores: Record<string, number>
}

export interface Question {
  id: number
  type: "mbti" | "holland"
  dimension: string
  text: string
  options: { label: string; text: string; score: string }[]
}

export interface MajorCard {
  name: string
  score: number
  mbti_match: number
  holland_match: number
  employment_score: number
  avg_salary: string
  employment_rating: "高" | "中" | "低"
  fit_reason: string
  caution?: string
  has_xuefeng: boolean
}

export interface SchoolCard {
  university_id: string
  university_name: string
  city: string
  school_type: string[]
  major_name: string
  probability: number
  tier: "冲" | "稳" | "保"
  subject_ranking: string
  trend_ranks: number[]
  is_volatile: boolean
  has_xuefeng: boolean
}

export interface AssessmentResult {
  mbti_type: string
  mbti_desc: string
  holland_top2: string[]
  recommended_majors: MajorCard[]
  recommended_schools: {
    冲: SchoolCard[]
    稳: SchoolCard[]
    保: SchoolCard[]
  }
}

export interface GaokaoTrendPoint {
  year: number
  min_score: number | null
  min_rank: number | null
}

export interface EligibleMajor {
  name: string
  avg_min_score: number
  latest_min_score: number
  gap: number            // user_score - major_avg  (正=高于线，负=低于线)
  tier: "冲" | "稳" | "保"
  year_scores: Array<{ year: number; min_score: number }>
}

export interface GaokaoSchoolCard {
  university_name: string
  uni_city: string
  uni_province: string
  school_tags: string[]
  batch: string
  tier: "冲" | "稳" | "保"
  probability: number
  is_volatile: boolean
  trend: GaokaoTrendPoint[]
  latest_score: number | null
  latest_rank: number | null
  eligible_majors: EligibleMajor[]
}

export interface GaokaoResult {
  province: string
  subject_type: string
  score: number | null
  results: {
    冲: GaokaoSchoolCard[]
    稳: GaokaoSchoolCard[]
    保: GaokaoSchoolCard[]
    error?: string
  }
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}
