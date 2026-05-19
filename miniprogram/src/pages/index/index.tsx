import { useState } from 'react'
import { View, Text, Picker, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Storage } from '../../utils/store'
import type { UserInfo } from '../../utils/types'

const PROVINCES = [
  '北京', '天津', '上海', '重庆',
  '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南',
  '广东', '广西', '海南',
  '四川', '贵州', '云南', '西藏',
  '陕西', '甘肃', '青海', '宁夏', '新疆',
]

const NEW_GAOKAO = new Set([
  '北京', '天津', '上海', '重庆', '河北', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '湖北', '湖南',
  '广东', '广西', '海南', '贵州', '云南', '陕西', '甘肃', '青海', '宁夏', '内蒙古',
])

const ALL_SUBJECTS = ['物理', '化学', '生物', '历史', '地理', '政治']

const C = {
  primary: '#4F46E5',
  primaryDark: '#4338CA',
  primaryLight: '#EEF2FF',
  primaryBg: '#E0E7FF',
  bg: '#F8F9FC',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
}

export default function IndexPage() {
  const [province, setProvince] = useState('广东')
  const [score, setScore] = useState('')
  const [subjectType, setSubjectType] = useState('物理')
  const [selection, setSelection] = useState<string[]>([])

  const isNewGaokao = NEW_GAOKAO.has(province)
  const optionalSubjects = ALL_SUBJECTS.filter(
    s => s !== subjectType && s !== (subjectType === '物理' ? '历史' : '物理')
  )

  const canStart = score && !isNaN(Number(score)) && Number(score) > 0 &&
    (!isNewGaokao || selection.length === 2)

  const toggleSubject = (s: string) => {
    setSelection(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : prev.length < 2 ? [...prev, s] : prev
    )
  }

  const handleStart = () => {
    if (!canStart) return
    const userInfo: UserInfo = {
      province,
      score: Number(score),
      subject_type: subjectType,
      subject_selection: isNewGaokao ? [subjectType, ...selection] : [],
    }
    Storage.setUserInfo(userInfo)
    Storage.setChatMessages([])
    Taro.navigateTo({ url: '/pages/assessment/index' })
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px 40px' }}>

      {/* 头部标题 */}
      <View style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <View style={{
          backgroundColor: C.primaryLight,
          paddingTop: '6px', paddingBottom: '6px', paddingLeft: '16px', paddingRight: '16px',
          borderRadius: '999px',
          marginBottom: '16px',
          display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}>
          <View style={{ width: '8px', height: '8px', backgroundColor: '#6366F1', borderRadius: '4px', marginRight: '8px' }} />
          <Text style={{ color: C.primaryDark, fontSize: '13px', fontWeight: '500' }}>AI 驱动 · 张雪峰风格顾问</Text>
        </View>
        <Text style={{ fontSize: '30px', fontWeight: 'bold', color: C.gray900, marginBottom: '10px', textAlign: 'center' }}>
          AI 志愿师
        </Text>
        <Text style={{ fontSize: '14px', color: C.gray500, textAlign: 'center', lineHeight: 1.6 }}>
          10分钟测评 + AI分析{'\n'}找到最适合你的专业和院校
        </Text>
      </View>

      {/* 表单卡片 */}
      <View style={{
        width: '100%',
        backgroundColor: C.white,
        borderRadius: '24px',
        padding: '28px 20px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}>

        {/* 省份选择 */}
        <View style={{ marginBottom: '20px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '500', color: C.gray700, marginBottom: '8px', display: 'block' }}>
            所在省份
          </Text>
          <Picker
            mode='selector'
            range={PROVINCES}
            value={PROVINCES.indexOf(province)}
            onChange={(e: any) => { setProvince(PROVINCES[Number(e.detail.value)]); setSelection([]) }}
          >
            <View style={{
              borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray200,
              borderRadius: '12px', padding: '12px 16px',
              display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: C.white,
            }}>
              <Text style={{ color: C.gray800, fontSize: '15px' }}>{province}</Text>
              <Text style={{ color: C.gray400, fontSize: '12px' }}>▾</Text>
            </View>
          </Picker>
        </View>

        {/* 分数输入 */}
        <View style={{ marginBottom: '20px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '500', color: C.gray700, marginBottom: '8px', display: 'block' }}>
            高考分数
          </Text>
          <Input
            type='number'
            value={score}
            onInput={(e: any) => setScore(e.detail.value)}
            placeholder='请输入你的高考分数'
            placeholderStyle={`color: ${C.gray400}`}
            style={{
              borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray200,
              borderRadius: '12px', padding: '12px 16px',
              fontSize: '15px', color: C.gray800,
              width: '100%', boxSizing: 'border-box',
            }}
          />
        </View>

        {/* 首选科目 */}
        <View style={{ marginBottom: '20px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '500', color: C.gray700, marginBottom: '8px', display: 'block' }}>
            首选科目
          </Text>
          <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
            {['物理', '历史'].map(t => (
              <View
                key={t}
                onClick={() => { setSubjectType(t); setSelection([]) }}
                style={{
                  flex: 1, padding: '12px',
                  borderRadius: '12px',
                  borderWidth: '1px', borderStyle: 'solid',
                  borderColor: subjectType === t ? C.primary : C.gray200,
                  backgroundColor: subjectType === t ? C.primary : C.gray50,
                  textAlign: 'center',
                }}
              >
                <Text style={{ color: subjectType === t ? C.white : C.gray600, fontWeight: '500', fontSize: '14px' }}>
                  {t}类
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 再选科目（新高考省份） */}
        {isNewGaokao && (
          <View style={{ marginBottom: '20px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '500', color: C.gray700, marginBottom: '8px', display: 'block' }}>
              再选科目
              <Text style={{ color: C.gray400, fontSize: '12px', fontWeight: 'normal' }}>（从下列选2科）</Text>
            </Text>
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
              {optionalSubjects.map(s => (
                <View
                  key={s}
                  onClick={() => toggleSubject(s)}
                  style={{
                    paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px',
                    borderRadius: '12px',
                    borderWidth: '1px', borderStyle: 'solid',
                    borderColor: selection.includes(s) ? '#818CF8' : C.gray200,
                    backgroundColor: selection.includes(s) ? C.primaryLight : C.gray50,
                  }}
                >
                  <Text style={{
                    color: selection.includes(s) ? C.primaryDark : C.gray600,
                    fontSize: '14px', fontWeight: '500',
                  }}>
                    {s}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 开始按钮 */}
        <View
          onClick={handleStart}
          style={{
            width: '100%',
            backgroundColor: canStart ? C.primary : C.gray300,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginTop: '4px',
          }}
        >
          <Text style={{ color: C.white, fontWeight: '600', fontSize: '16px' }}>开始测评 →</Text>
        </View>
      </View>

      <Text style={{ color: C.gray400, fontSize: '12px', marginTop: '20px', textAlign: 'center' }}>
        完成约需 10 分钟 · 40 道情境题
      </Text>
    </View>
  )
}
