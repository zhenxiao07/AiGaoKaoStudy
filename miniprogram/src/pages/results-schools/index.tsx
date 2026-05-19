import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Storage } from '../../utils/store'
import type { SchoolCard } from '../../utils/types'

const C = {
  primary: '#4F46E5', primaryBg: '#E0E7FF',
  bg: '#F8F9FC', white: '#FFFFFF',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
  gray700: '#374151', gray800: '#1F2937', gray900: '#111827',
  amber100: '#FEF3C7', amber700: '#B45309', amber50: '#FFFBEB',
  orange100: '#FFEDD5', orange600: '#EA580C', orange50: '#FFF7ED',
  green100: '#DCFCE7', green600: '#16A34A',
  blue100: '#DBEAFE', blue600: '#2563EB', blue700: '#1D4ED8',
  red100: '#FEE2E2', red700: '#B91C1C',
}

type Tier = '冲' | '稳' | '保'

const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; desc: string }> = {
  冲: { label: '冲一冲', color: C.orange600, bg: C.orange100, desc: '录取概率 20-40%，拼一把' },
  稳: { label: '稳一稳', color: C.green600, bg: C.green100, desc: '录取概率 55-75%，有把握' },
  保: { label: '保一保', color: C.blue600, bg: C.blue100, desc: '录取概率 ≥90%，稳上岸' },
}

function SchoolItem({ school }: { school: SchoolCard }) {
  const tierCfg = TIER_CONFIG[school.tier]

  return (
    <View style={{
      backgroundColor: C.white, borderRadius: '16px',
      borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray100,
      padding: '16px', marginBottom: '12px',
    }}>
      {/* 顶部：学校名称 + 录取概率 */}
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <View style={{ flex: 1 }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '6px' }}>
            <Text style={{ fontWeight: 'bold', color: C.gray900, fontSize: '15px', marginRight: '6px' }}>
              {school.university_name}
            </Text>
            {school.has_xuefeng && (
              <View style={{ backgroundColor: C.amber100, paddingLeft: '5px', paddingRight: '5px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '4px' }}>
                <Text style={{ color: C.amber700, fontSize: '11px', fontWeight: '500' }}>张</Text>
              </View>
            )}
          </View>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '6px' }}>
            <View style={{ backgroundColor: tierCfg.bg, paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '999px' }}>
              <Text style={{ color: tierCfg.color, fontSize: '11px', fontWeight: '500' }}>{school.tier}</Text>
            </View>
            {school.school_type.map(t => (
              <View
                key={t}
                style={{
                  paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '999px',
                  backgroundColor: t === '985' ? C.red100 : t === '211' ? C.orange100 : C.blue100,
                }}
              >
                <Text style={{
                  fontSize: '11px', fontWeight: '500',
                  color: t === '985' ? C.red700 : t === '211' ? C.orange600 : C.blue700,
                }}>
                  {t}
                </Text>
              </View>
            ))}
            <Text style={{ fontSize: '12px', color: C.gray400, lineHeight: 1.8 }}>{school.city}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: '12px' }}>
          <Text style={{ fontSize: '22px', fontWeight: 'bold', color: C.primary }}>
            {Math.round(school.probability * 100)}%
          </Text>
          <Text style={{ fontSize: '11px', color: C.gray400 }}>录取概率</Text>
        </View>
      </View>

      {/* 专业 + 学科排名 */}
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '10px' }}>
        <Text style={{ fontSize: '13px', color: C.gray600 }}>
          专业：<Text style={{ fontWeight: '500', color: C.gray800 }}>{school.major_name}</Text>
        </Text>
        <Text style={{ fontSize: '13px', color: C.gray600 }}>
          学科排名：<Text style={{ fontWeight: 'bold', color: C.gray800 }}>{school.subject_ranking}</Text>
        </Text>
      </View>

      {/* 历年录取位次 */}
      <Text style={{ fontSize: '12px', color: C.gray500, marginBottom: '6px' }}>
        历年录取位次：{school.trend_ranks.join(' / ')}
      </Text>
      <View style={{ height: '6px', backgroundColor: C.gray100, borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <View style={{
          width: `${Math.round(school.probability * 100)}%`, height: '100%',
          borderRadius: '3px',
          backgroundImage: 'linear-gradient(to right, #818CF8, #4F46E5)',
        }} />
      </View>

      {school.is_volatile && (
        <View style={{ backgroundColor: C.amber50, borderRadius: '8px', padding: '8px 12px', marginBottom: '10px' }}>
          <Text style={{ color: '#D97706', fontSize: '12px' }}>⚠️ 该校录取位次波动较大，建议谨慎</Text>
        </View>
      )}

      <View onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}>
        <Text style={{ color: C.primary, fontSize: '12px', fontWeight: '500' }}>问AI顾问关于此校 →</Text>
      </View>
    </View>
  )
}

export default function SchoolsPage() {
  const [activeTier, setActiveTier] = useState<Tier>('冲')

  const userInfo = Storage.getUserInfo()
  const result = Storage.getResult()

  useEffect(() => {
    if (!result || !userInfo) {
      Taro.redirectTo({ url: '/pages/index/index' })
      return
    }
    Taro.setNavigationBarTitle({ title: '院校推荐' })
  }, [])

  if (!result || !userInfo) return null

  const schools = result.recommended_schools[activeTier] || []

  return (
    <View style={{ minHeight: '100vh', backgroundColor: C.bg, paddingBottom: '90px' }}>

      {/* 导航栏 */}
      <View style={{
        backgroundColor: C.white,
        borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: C.gray100,
        padding: '12px 16px',
        display: 'flex', flexDirection: 'row', alignItems: 'center',
      }}>
        <View onClick={() => Taro.navigateBack()} style={{ padding: '4px 8px 4px 0', marginRight: '8px' }}>
          <Text style={{ color: C.gray500, fontSize: '20px' }}>←</Text>
        </View>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: C.gray900, flex: 1 }}>院校推荐</Text>
        <View
          onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}
          style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: C.gray100 }}
        >
          <Text style={{ fontSize: '12px', color: C.gray500 }}>首页</Text>
        </View>
      </View>

      {/* 顶部Tab栏 */}
      <View style={{
        backgroundColor: C.white,
        borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: C.gray100,
        padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Text style={{ fontSize: '13px', color: C.gray500, marginBottom: '10px', display: 'block' }}>
          {userInfo.province} · {userInfo.score}分 · {userInfo.subject_type}类
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          {(['冲', '稳', '保'] as Tier[]).map(t => (
            <View
              key={t}
              onClick={() => setActiveTier(t)}
              style={{
                flex: 1, padding: '10px',
                borderRadius: '12px', textAlign: 'center',
                backgroundColor: activeTier === t ? TIER_CONFIG[t].bg : C.gray100,
              }}
            >
              <Text style={{
                fontSize: '13px', fontWeight: '500',
                color: activeTier === t ? TIER_CONFIG[t].color : C.gray500,
              }}>
                {TIER_CONFIG[t].label}
              </Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: '12px', color: C.gray400, marginTop: '6px', display: 'block' }}>
          {TIER_CONFIG[activeTier].desc}
        </Text>
      </View>

      {/* 院校列表 */}
      <View style={{ padding: '16px' }}>
        {schools.length === 0 ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px' }}>
            <Text style={{ fontSize: '40px', marginBottom: '12px' }}>🏫</Text>
            <Text style={{ color: C.gray400, fontSize: '14px', marginBottom: '4px' }}>
              暂无匹配的{activeTier}学校
            </Text>
            <Text style={{ color: C.gray400, fontSize: '13px' }}>换个档位看看</Text>
          </View>
        ) : (
          schools.map(school => (
            <SchoolItem key={`${school.university_id}-${school.major_name}`} school={school} />
          ))
        )}
      </View>

      {/* 底部按钮 */}
      <View style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: C.white,
        borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: C.gray100,
        padding: '12px 16px 28px',
      }}>
        <View
          onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
          style={{
            backgroundColor: C.primary, borderRadius: '12px',
            padding: '14px', textAlign: 'center',
          }}
        >
          <Text style={{ color: C.white, fontWeight: '600', fontSize: '15px' }}>
            查看完整志愿方案 & 问AI顾问
          </Text>
        </View>
      </View>
    </View>
  )
}
