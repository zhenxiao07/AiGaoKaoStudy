"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { UserInfo, SelfAssessData, AssessmentResult, ChatMessage } from "./types"

interface AppState {
  userInfo: UserInfo | null
  selfAssessData: SelfAssessData | null
  result: AssessmentResult | null
  chatMessages: ChatMessage[]
  setUserInfo: (info: UserInfo) => void
  setSelfAssessData: (data: SelfAssessData) => void
  setResult: (result: AssessmentResult) => void
  addMessage: (msg: ChatMessage) => void
  updateLastAssistantMessage: (content: string) => void
  clearChat: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userInfo: null,
      selfAssessData: null,
      result: null,
      chatMessages: [],
      setUserInfo: (info) => set({ userInfo: info }),
      setSelfAssessData: (data) => set({ selfAssessData: data, userInfo: { province: data.province } }),
      setResult: (result) => set({ result }),
      addMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      updateLastAssistantMessage: (content) =>
        set((s) => {
          const msgs = [...s.chatMessages]
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === "assistant") {
              msgs[i] = { ...msgs[i], content }
              break
            }
          }
          return { chatMessages: msgs }
        }),
      clearChat: () => set({ chatMessages: [] }),
    }),
    { name: "aizyz-store" }
  )
)
