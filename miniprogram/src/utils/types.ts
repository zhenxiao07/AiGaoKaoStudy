export interface UserInfo {
  province: string
  score: number
  subject_type: string
  subject_selection: string[]
}

export interface Question {
  id: number
  type: 'mbti' | 'holland'
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
  employment_rating: '高' | '中' | '低'
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
  tier: '冲' | '稳' | '保'
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

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
