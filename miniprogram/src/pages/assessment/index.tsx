import { useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Storage } from '../../utils/store'
import { fetchQuestions, submitAssessment } from '../../utils/api'
import type { Question } from '../../utils/types'

const C = {
  primary: '#4F46E5', primaryLight: '#EEF2FF', primaryBg: '#E0E7FF',
  bg: '#F8F9FC', white: '#FFFFFF',
  gray100: '#F3F4F6', gray200: '#E5E7EB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937', gray900: '#111827',
}

export default function AssessmentPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<{ question_id: number; selected_option: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const userInfo = Storage.getUserInfo()

  useEffect(() => {
    if (!userInfo) {
      Taro.redirectTo({ url: '/pages/index/index' })
      return
    }
    Taro.setNavigationBarTitle({ title: '性格测评' })
    fetchQuestions().then(data => {
      setQuestions(data.questions)
      setLoading(false)
    }).catch(() => {
      Taro.showToast({ title: '加载失败，请检查网络', icon: 'none', duration: 2000 })
    })
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleSelect = (label: string) => {
    if (animating || !questions.length) return
    const qid = questions[current].id
    const newAnswers = [...answers, { question_id: qid, selected_option: label }]
    setAnswers(newAnswers)

    if (current + 1 >= questions.length) {
      handleSubmit(newAnswers)
      return
    }

    setAnimating(true)
    timerRef.current = setTimeout(() => {
      setCurrent(c => c + 1)
      setAnimating(false)
    }, 280)
  }

  const handleSubmit = async (finalAnswers: typeof answers) => {
    if (!userInfo) return
    setSubmitting(true)
    try {
      const result = await submitAssessment(userInfo, finalAnswers)
      Storage.setResult(result)
      Taro.redirectTo({ url: '/pages/results-majors/index' })
    } catch {
      Taro.showToast({ title: '提交失败，请检查后端服务', icon: 'none', duration: 3000 })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '40px', height: '40px', borderRadius: '20px', borderWidth: '4px', borderStyle: 'solid', borderColor: C.primary, borderTopColor: 'transparent', marginBottom: '12px' }} />
        <Text style={{ color: C.gray500, fontSize: '14px' }}>加载题目中...</Text>
      </View>
    )
  }

  if (submitting) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</Text>
        <Text style={{ fontSize: '18px', fontWeight: '600', color: C.gray800, marginBottom: '8px' }}>正在分析你的性格类型...</Text>
        <Text style={{ fontSize: '14px', color: C.gray500 }}>AI 正在为你匹配最合适的专业和院校</Text>
      </View>
    )
  }

  if (!questions.length) return null

  const q = questions[current]
  const progress = Math.round((current / questions.length) * 100)

  return (
    <View style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* 进度条 */}
      <View style={{
        backgroundColor: C.white,
        borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: C.gray100,
        padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <Text style={{ fontSize: '12px', color: C.gray500 }}>第 {current + 1} / {questions.length} 题</Text>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            <Text style={{ fontSize: '12px', color: C.gray500 }}>{progress}%</Text>
            <View
              onClick={() => Taro.navigateBack()}
              style={{ padding: '2px 8px', borderRadius: '8px', backgroundColor: C.gray100 }}
            >
              <Text style={{ fontSize: '12px', color: C.gray500 }}>退出</Text>
            </View>
          </View>
        </View>
        <View style={{ height: '8px', backgroundColor: C.gray100, borderRadius: '4px', overflow: 'hidden' }}>
          <View style={{
            width: `${progress}%`, height: '100%',
            backgroundColor: C.primary, borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </View>
      </View>

      {/* 题目区域 */}
      <View style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'none',
        transition: 'all 0.2s ease',
      }}>
        <View style={{ width: '100%' }}>
          {/* 维度标签 */}
          <View style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <View style={{ backgroundColor: C.primaryLight, paddingTop: '4px', paddingBottom: '4px', paddingLeft: '12px', paddingRight: '12px', borderRadius: '999px' }}>
              <Text style={{ color: C.primary, fontSize: '12px', fontWeight: '500' }}>
                {q.type === 'mbti' ? `MBTI · ${q.dimension}维度` : `Holland · ${q.dimension}型`}
              </Text>
            </View>
          </View>

          {/* 题目卡片 */}
          <View style={{
            backgroundColor: C.white, borderRadius: '24px',
            padding: '28px 20px', marginBottom: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <Text style={{
              fontSize: '18px', fontWeight: '600', color: C.gray900,
              textAlign: 'center', lineHeight: 1.6, marginBottom: '28px', display: 'block',
            }}>
              {q.text}
            </Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q.options.map(opt => (
                <View
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    borderWidth: '2px', borderStyle: 'solid', borderColor: C.gray100,
                    backgroundColor: C.gray50,
                  }}
                >
                  <View style={{
                    width: '24px', height: '24px', borderRadius: '12px',
                    backgroundColor: C.primaryBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '12px', flexShrink: 0,
                  }}>
                    <Text style={{ color: C.primary, fontSize: '12px', fontWeight: 'bold' }}>{opt.label}</Text>
                  </View>
                  <Text style={{ color: C.gray700, fontSize: '14px', fontWeight: '500', flex: 1, lineHeight: 1.5 }}>
                    {opt.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={{ textAlign: 'center', color: C.gray400, fontSize: '12px' }}>
            点击选项后自动跳转下一题
          </Text>
        </View>
      </View>
    </View>
  )
}
