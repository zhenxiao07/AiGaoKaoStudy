import Taro from '@tarojs/taro'
import type { UserInfo, AssessmentResult, ChatMessage, Question } from './types'

// ⚠️  开发时：使用模拟器，在抖音开发者工具中勾选「不校验合法域名」
// ⚠️  正式发布：需要部署到公网 HTTPS 服务器并在开放平台配置请求域名
const BASE = 'http://localhost:8000'

function request<T>(url: string, method: 'GET' | 'POST' = 'GET', data?: object): Promise<T> {
  return new Promise((resolve, reject) => {
    Taro.request({
      url: `${BASE}${url}`,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      },
    })
  })
}

export async function fetchQuestions(): Promise<{ questions: Question[] }> {
  return request('/assessment/questions')
}

export async function submitAssessment(
  userInfo: UserInfo,
  answers: { question_id: number; selected_option: string }[]
): Promise<AssessmentResult> {
  return request('/assessment/submit', 'POST', {
    user_info: userInfo,
    answers,
  })
}

// 抖音小程序不支持 SSE 流式传输，使用普通 POST 接口
export async function sendChat(
  userInfo: UserInfo,
  mbtiType: string,
  topMajors: string[],
  topSchool: string,
  messages: ChatMessage[],
  newMessage: string
): Promise<string> {
  const data = await request<{ reply: string }>('/agent/chat', 'POST', {
    user_info: userInfo,
    mbti_type: mbtiType,
    top_majors: topMajors,
    top_school: topSchool,
    messages,
    new_message: newMessage,
  })
  return data.reply
}
