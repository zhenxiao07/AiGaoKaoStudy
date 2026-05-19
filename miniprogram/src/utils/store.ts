import Taro from '@tarojs/taro'
import type { UserInfo, AssessmentResult, ChatMessage } from './types'

// 抖音小程序使用 Taro.setStorageSync/getStorageSync 代替 localStorage
// Taro 会自动调用平台对应的存储 API（tt.setStorageSync / wx.setStorageSync）

export const Storage = {
  getUserInfo(): UserInfo | null {
    try {
      const v = Taro.getStorageSync('userInfo')
      return v || null
    } catch {
      return null
    }
  },

  setUserInfo(info: UserInfo) {
    try { Taro.setStorageSync('userInfo', info) } catch {}
  },

  getResult(): AssessmentResult | null {
    try {
      const v = Taro.getStorageSync('result')
      return v || null
    } catch {
      return null
    }
  },

  setResult(result: AssessmentResult) {
    try { Taro.setStorageSync('result', result) } catch {}
  },

  getChatMessages(): ChatMessage[] {
    try {
      const v = Taro.getStorageSync('chatMessages')
      return Array.isArray(v) ? v : []
    } catch {
      return []
    }
  },

  setChatMessages(msgs: ChatMessage[]) {
    try { Taro.setStorageSync('chatMessages', msgs) } catch {}
  },

  clearAll() {
    try {
      Taro.removeStorageSync('userInfo')
      Taro.removeStorageSync('result')
      Taro.removeStorageSync('chatMessages')
    } catch {}
  },
}
