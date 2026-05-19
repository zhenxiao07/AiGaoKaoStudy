import { useState, useEffect } from 'react'
import { View, Text, Textarea, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Storage } from '../../utils/store'
import { sendChat } from '../../utils/api'
import type { ChatMessage } from '../../utils/types'

const C = {
  primary: '#4F46E5', primaryDark: '#4338CA', primaryLight: '#EEF2FF',
  bg: '#F8F9FC', white: '#FFFFFF',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
  gray700: '#374151', gray800: '#1F2937', gray900: '#111827',
}

const FREE_ROUNDS = 3

const QUICK_QUESTIONS = [
  '帮我整体评估一下我的志愿方案',
  '我的分数能上哪些 985/211？',
  '张雪峰怎么看我的Top专业？',
  '我意向院校值得报吗？',
]

export default function ChatPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const userInfo = Storage.getUserInfo()
  const result = Storage.getResult()

  useEffect(() => {
    if (!userInfo) {
      Taro.redirectTo({ url: '/pages/index/index' })
      return
    }
    Taro.setNavigationBarTitle({ title: 'AI志愿师' })
    const saved = Storage.getChatMessages()
    setChatMessages(saved)
  }, [])

  const topMajors = result?.recommended_majors.slice(0, 3).map(m => m.name) || []
  const topSchool = result?.recommended_schools['稳']?.[0]?.university_name || ''

  const userMsgCount = chatMessages.filter(m => m.role === 'user').length
  const reachedLimit = userMsgCount >= FREE_ROUNDS

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !userInfo || reachedLimit) return
    setInput('')
    setLoading(true)

    const userMsg: ChatMessage = { role: 'user', content: text }
    const placeholder: ChatMessage = { role: 'assistant', content: '' }
    const updatedMsgs = [...chatMessages, userMsg, placeholder]
    setChatMessages(updatedMsgs)
    Storage.setChatMessages(updatedMsgs)

    try {
      const reply = await sendChat(
        userInfo,
        result?.mbti_type || '',
        topMajors,
        topSchool,
        chatMessages.filter(m => m.content),
        text
      )
      const finalMsgs = updatedMsgs.map((m, i) =>
        i === updatedMsgs.length - 1 ? { ...m, content: reply } : m
      )
      setChatMessages(finalMsgs)
      Storage.setChatMessages(finalMsgs)
    } catch {
      const errorMsgs = updatedMsgs.map((m, i) =>
        i === updatedMsgs.length - 1
          ? { ...m, content: '请求失败，请检查网络后重试' }
          : m
      )
      setChatMessages(errorMsgs)
      Storage.setChatMessages(errorMsgs)
    } finally {
      setLoading(false)
    }
  }

  if (!userInfo) return null

  const scrollId = chatMessages.length > 0 ? 'msg-bottom' : ''

  return (
    <View style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: C.bg }}>

      {/* 顶栏 */}
      <View style={{
        backgroundColor: C.white,
        borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: C.gray100,
        padding: '10px 16px',
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        flexShrink: 0,
      }}>
        <View onClick={() => Taro.navigateBack()} style={{ marginRight: '10px', padding: '4px' }}>
          <Text style={{ color: C.gray500, fontSize: '18px' }}>←</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '600', color: C.gray900, fontSize: '14px', display: 'block' }}>AI 志愿师</Text>
          <Text style={{ fontSize: '12px', color: C.gray400 }}>
            {userInfo.province} · {userInfo.score}分
            {result ? ` · ${result.mbti_type} · ${topMajors[0] || ''}` : ''}
          </Text>
        </View>
        <Text style={{ fontSize: '12px', color: C.gray400 }}>
          免费 {Math.min(userMsgCount, FREE_ROUNDS)}/{FREE_ROUNDS} 次
        </Text>
      </View>

      {/* 消息列表 */}
      <ScrollView
        scrollY
        scrollIntoView={scrollId}
        scrollWithAnimation
        style={{ flex: 1, minHeight: 0 }}
      >
        <View style={{ padding: '16px' }}>
          {/* 欢迎语 */}
          {chatMessages.length === 0 && (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', paddingBottom: '20px' }}>
              <Text style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</Text>
              <Text style={{ fontWeight: '600', color: C.gray800, fontSize: '16px', marginBottom: '8px' }}>
                你好！我是你的AI志愿师
              </Text>
              <Text style={{ fontSize: '13px', color: C.gray500, textAlign: 'center', lineHeight: 1.6, maxWidth: '260px' }}>
                基于你的测评结果，我可以帮你分析专业选择、院校志愿，用数据和张雪峰的视角给你最直接的建议。
              </Text>
            </View>
          )}

          {/* 消息气泡 */}
          {chatMessages.map((msg, i) => (
            <View
              key={i}
              id={i === chatMessages.length - 1 ? 'msg-bottom' : `msg-${i}`}
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '12px',
                alignItems: 'flex-end',
              }}
            >
              {msg.role === 'assistant' && (
                <View style={{
                  width: '32px', height: '32px', borderRadius: '16px',
                  backgroundColor: C.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: '8px', flexShrink: 0,
                }}>
                  <Text style={{ color: C.white, fontSize: '11px', fontWeight: 'bold' }}>AI</Text>
                </View>
              )}
              <View style={{
                maxWidth: '75%',
                backgroundColor: msg.role === 'user' ? C.primary : C.white,
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px',
                boxShadow: msg.role === 'assistant' ? '0 1px 6px rgba(0,0,0,0.06)' : 'none',
                borderWidth: msg.role === 'assistant' ? '1px' : '0',
                borderStyle: 'solid',
                borderColor: msg.role === 'assistant' ? C.gray100 : 'transparent',
              }}>
                {!msg.content && loading && i === chatMessages.length - 1 ? (
                  <View style={{ display: 'flex', flexDirection: 'row', gap: '4px', padding: '2px 0' }}>
                    {[0, 150, 300].map(delay => (
                      <View
                        key={delay}
                        style={{
                          width: '6px', height: '6px', borderRadius: '3px',
                          backgroundColor: C.gray400,
                          animation: `bounce 1s ${delay}ms infinite`,
                        }}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={{
                    fontSize: '14px',
                    color: msg.role === 'user' ? C.white : C.gray800,
                    lineHeight: 1.6,
                  }}>
                    {msg.content}
                  </Text>
                )}
              </View>
            </View>
          ))}

          <View id="msg-bottom" style={{ height: '4px' }} />
        </View>
      </ScrollView>

      {/* 快捷问题（首次对话时显示） */}
      {chatMessages.length === 0 && (
        <View style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'row', overflow: 'scroll',
          padding: '0 16px 8px',
          gap: '8px',
        }}>
          {QUICK_QUESTIONS.map(q => (
            <View
              key={q}
              onClick={() => sendMessage(q)}
              style={{
                flexShrink: 0,
                backgroundColor: C.white,
                borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray200,
                borderRadius: '12px',
                paddingTop: '8px', paddingBottom: '8px', paddingLeft: '12px', paddingRight: '12px',
              }}
            >
              <Text style={{ fontSize: '12px', color: C.gray600, whiteSpace: 'nowrap' }}>{q}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 付费提示 */}
      {reachedLimit && (
        <View style={{
          flexShrink: 0,
          margin: '0 16px 8px',
          backgroundColor: C.primaryLight,
          borderWidth: '1px', borderStyle: 'solid', borderColor: '#c7d2fe',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <Text style={{ fontSize: '14px', fontWeight: '500', color: '#3730a3', marginBottom: '4px' }}>
            免费次数已用完
          </Text>
          <Text style={{ fontSize: '12px', color: C.primary, marginBottom: '10px' }}>
            开通会员，无限次AI咨询 + 完整院校方案
          </Text>
          <View
            onClick={() => Taro.showToast({ title: '会员功能即将开放', icon: 'none' })}
            style={{
              backgroundColor: C.primary, borderRadius: '10px',
              paddingTop: '8px', paddingBottom: '8px', paddingLeft: '20px', paddingRight: '20px',
            }}
          >
            <Text style={{ color: C.white, fontSize: '13px', fontWeight: '500' }}>开通会员 · ¥49</Text>
          </View>
        </View>
      )}

      {/* 输入框 */}
      <View style={{
        flexShrink: 0,
        backgroundColor: C.white,
        borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: C.gray100,
        padding: '10px 16px',
        display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '8px',
      }}>
        <Textarea
          value={input}
          onInput={(e: any) => setInput(e.detail.value)}
          placeholder={reachedLimit ? '免费次数已用完，开通会员继续' : '问我任何志愿问题...'}
          placeholderStyle={`color: ${C.gray400}`}
          disabled={reachedLimit || loading}
          maxlength={500}
          autoHeight
          style={{
            flex: 1, minHeight: '40px', maxHeight: '100px',
            borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray200,
            borderRadius: '12px',
            paddingTop: '10px', paddingBottom: '10px', paddingLeft: '14px', paddingRight: '14px',
            fontSize: '14px', color: C.gray800,
            backgroundColor: (reachedLimit || loading) ? C.gray50 : C.white,
          }}
        />
        <View
          onClick={() => sendMessage(input)}
          style={{
            width: '44px', height: '44px', borderRadius: '12px',
            backgroundColor: (!input.trim() || loading || reachedLimit) ? C.gray200 : C.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {loading ? (
            <View style={{
              width: '16px', height: '16px', borderRadius: '8px',
              borderWidth: '2px', borderStyle: 'solid',
              borderColor: C.white, borderTopColor: 'transparent',
            }} />
          ) : (
            <Text style={{ color: C.white, fontSize: '18px', lineHeight: 1, marginTop: '-2px' }}>↑</Text>
          )}
        </View>
      </View>
    </View>
  )
}
