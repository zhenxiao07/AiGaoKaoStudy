import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Storage } from '../../utils/store'
import type { MajorCard } from '../../utils/types'

const C = {
  primary: '#4F46E5', primaryDark: '#4338CA', primaryLight: '#EEF2FF', primaryBg: '#E0E7FF',
  bg: '#F8F9FC', white: '#FFFFFF',
  gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563',
  gray700: '#374151', gray800: '#1F2937', gray900: '#111827',
  amber100: '#FEF3C7', amber700: '#B45309', amber50: '#FFFBEB',
  orange50: '#FFF7ED', orange600: '#EA580C',
  green100: '#DCFCE7', green700: '#15803D',
  yellow100: '#FEF9C3', yellow700: '#A16207',
  red100: '#FEE2E2', red700: '#B91C1C',
}

const HOLLAND_DESC: Record<string, string> = {
  R: '实际型', I: '研究型', A: '艺术型', S: '社会型', E: '企业型', C: '常规型',
}

const FREE_LIMIT = 3

function MajorItem({ major, rank, expanded, onToggle }: {
  major: MajorCard
  rank: number
  expanded: boolean
  onToggle: () => void
}) {
  const empColor = major.employment_rating === '高'
    ? { bg: C.green100, text: C.green700 }
    : major.employment_rating === '中'
    ? { bg: C.yellow100, text: C.yellow700 }
    : { bg: C.red100, text: C.red700 }

  return (
    <View style={{
      backgroundColor: C.white, borderRadius: '16px',
      borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray100,
      overflow: 'hidden', marginBottom: '12px',
    }}>
      <View style={{ padding: '16px' }}>
        {/* 标题行 */}
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{
              width: '28px', height: '28px', borderRadius: '14px',
              backgroundColor: C.primaryBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '10px', flexShrink: 0,
            }}>
              <Text style={{ color: C.primary, fontSize: '13px', fontWeight: 'bold' }}>{rank}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Text style={{ fontWeight: 'bold', color: C.gray900, fontSize: '15px' }}>{major.name}</Text>
                {major.has_xuefeng && (
                  <View style={{ backgroundColor: C.amber100, paddingLeft: '6px', paddingRight: '6px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '4px' }}>
                    <Text style={{ color: C.amber700, fontSize: '11px', fontWeight: '500' }}>张</Text>
                  </View>
                )}
              </View>
              <View style={{ backgroundColor: empColor.bg, paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '999px', alignSelf: 'flex-start' }}>
                <Text style={{ color: empColor.text, fontSize: '11px', fontWeight: '500' }}>就业{major.employment_rating}</Text>
              </View>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: '12px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: C.primary }}>
              {major.score.toFixed(0)}<Text style={{ fontSize: '12px', color: C.gray400, fontWeight: 'normal' }}>分</Text>
            </Text>
            <Text style={{ fontSize: '11px', color: C.gray500, marginTop: '2px' }}>{major.avg_salary}</Text>
          </View>
        </View>

        <Text style={{ fontSize: '13px', color: C.gray600, lineHeight: 1.6, marginBottom: '8px' }}>
          {major.fit_reason}
        </Text>

        {major.caution && (
          <View style={{ backgroundColor: C.orange50, borderRadius: '8px', padding: '8px 12px', marginBottom: '8px' }}>
            <Text style={{ color: C.orange600, fontSize: '12px' }}>⚠️ {major.caution}</Text>
          </View>
        )}

        <View onClick={onToggle}>
          <Text style={{ color: C.primary, fontSize: '12px', fontWeight: '500' }}>
            {expanded ? '收起 ▲' : '查看详情 ▼'}
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={{
          borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: C.gray100,
          padding: '14px 16px', backgroundColor: C.gray50,
        }}>
          <View style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
            {[
              { label: 'MBTI匹配', value: `${major.mbti_match.toFixed(0)}%` },
              { label: 'Holland匹配', value: `${major.holland_match.toFixed(0)}%` },
              { label: '就业前景', value: `${major.employment_score.toFixed(0)}分` },
            ].map(item => (
              <View key={item.label} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: '11px', color: C.gray500, marginBottom: '4px' }}>{item.label}</Text>
                <Text style={{ fontSize: '14px', fontWeight: 'bold', color: C.gray800 }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

export default function MajorsPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const userInfo = Storage.getUserInfo()
  const result = Storage.getResult()

  useEffect(() => {
    if (!result || !userInfo) {
      Taro.redirectTo({ url: '/pages/index/index' })
      return
    }
    Taro.setNavigationBarTitle({ title: '专业推荐' })
  }, [])

  if (!result || !userInfo) return null

  const majors = result.recommended_majors

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
        <Text style={{ fontSize: '16px', fontWeight: '600', color: C.gray900, flex: 1 }}>专业推荐</Text>
        <View
          onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}
          style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: C.gray100 }}
        >
          <Text style={{ fontSize: '12px', color: C.gray500 }}>首页</Text>
        </View>
      </View>

      {/* 顶部信息 */}
      <View style={{
        backgroundColor: C.white,
        borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: C.gray100,
        padding: '16px',
      }}>
        <Text style={{ fontSize: '16px', fontWeight: 'bold', color: C.gray900, marginBottom: '12px', display: 'block' }}>
          你的测评结果
        </Text>
        <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
          <View style={{
            backgroundColor: C.primary, paddingTop: '8px', paddingBottom: '8px', paddingLeft: '14px', paddingRight: '14px',
            borderRadius: '12px', display: 'flex', flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: '14px', marginRight: '6px' }}>🧠</Text>
            <Text style={{ color: C.white, fontSize: '13px', fontWeight: '500' }}>{result.mbti_type}</Text>
            <Text style={{ color: '#a5b4fc', fontSize: '12px', marginLeft: '4px' }}>
              {result.mbti_desc.slice(0, 8)}...
            </Text>
          </View>
          {result.holland_top2.map(dim => (
            <View
              key={dim}
              style={{
                backgroundColor: C.amber50, paddingTop: '8px', paddingBottom: '8px', paddingLeft: '12px', paddingRight: '12px',
                borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', borderColor: C.amber100,
              }}
            >
              <Text style={{ color: C.amber700, fontSize: '13px', fontWeight: '500' }}>
                {HOLLAND_DESC[dim] || dim}型
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 专业列表 */}
      <View style={{ padding: '16px' }}>
        {majors.slice(0, FREE_LIMIT).map((m, i) => (
          <MajorItem
            key={m.name}
            major={m}
            rank={i + 1}
            expanded={expandedIndex === i}
            onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
          />
        ))}

        {/* 付费墙 */}
        {majors.length > FREE_LIMIT && (
          <View style={{ position: 'relative', marginTop: '4px' }}>
            {/* 模糊背景内容 */}
            <View style={{ opacity: 0.15, pointerEvents: 'none' }}>
              {majors.slice(FREE_LIMIT).map((m, i) => (
                <MajorItem
                  key={m.name}
                  major={m}
                  rank={i + FREE_LIMIT + 1}
                  expanded={false}
                  onToggle={() => {}}
                />
              ))}
            </View>
            {/* 遮罩 */}
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(248,249,252,0.92)',
              borderRadius: '16px',
              zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '32px 20px',
            }}>
              <Text style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</Text>
              <Text style={{ fontWeight: 'bold', color: C.gray800, fontSize: '16px', marginBottom: '6px' }}>
                解锁完整推荐
              </Text>
              <Text style={{ fontSize: '13px', color: C.gray500, marginBottom: '20px', textAlign: 'center' }}>
                还有 {majors.length - FREE_LIMIT} 个专业推荐 + 完整院校方案
              </Text>
              <View
                onClick={() => Taro.showToast({ title: '会员功能即将开放，敬请期待', icon: 'none', duration: 2000 })}
                style={{
                  backgroundColor: C.primary, borderRadius: '12px',
                  paddingTop: '12px', paddingBottom: '12px', paddingLeft: '28px', paddingRight: '28px',
                }}
              >
                <Text style={{ color: C.white, fontWeight: '600', fontSize: '14px' }}>开通会员 · ¥49</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 底部操作按钮 */}
      <View style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: C.white,
        borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: C.gray100,
        padding: '12px 16px 28px',
        display: 'flex', flexDirection: 'row', gap: '12px',
      }}>
        <View
          onClick={() => Taro.navigateTo({ url: '/pages/results-schools/index' })}
          style={{
            flex: 1, backgroundColor: C.primary, borderRadius: '12px',
            padding: '14px', textAlign: 'center',
          }}
        >
          <Text style={{ color: C.white, fontWeight: '600', fontSize: '14px' }}>去选院校 →</Text>
        </View>
        <View
          onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
          style={{
            flex: 1, backgroundColor: C.gray50, borderRadius: '12px',
            padding: '14px', textAlign: 'center',
            borderWidth: '1px', borderStyle: 'solid', borderColor: C.gray200,
          }}
        >
          <Text style={{ color: C.gray700, fontWeight: '600', fontSize: '14px' }}>问问AI顾问</Text>
        </View>
      </View>
    </View>
  )
}
