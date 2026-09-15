<script lang="ts" setup>
import { computed } from 'vue'
import type { DictDataOption } from '@/api/system/dict/data/types'

type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'volcano' | 'lightblue' | 'cyan' | 'pink' | 'purple'
type TagSize = 'large' | 'medium' | 'small'
type TagVariant = 'dark' | 'light' | 'outlined'

const props = withDefaults(defineProps<{
  /** 字典选项（来自 useDict 返回的同名 ref） */
  options: DictDataOption[]
  /** 当前值 */
  value?: string | number
  /** 未匹配到字典项时的回退文案，默认显示原值 */
  fallback?: string
  /** 标签尺寸 */
  size?: TagSize
  /** 左侧图标 */
  icon?: string
  /** 标签变体，默认 dark */
  variant?: TagVariant
  /** 是否圆角，默认 true */
  round?: boolean
}>(), {
  variant: 'dark',
  round: true,
})

const VALID_TAG_TYPES: TagType[] = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'volcano',
  'lightblue',
  'cyan',
  'pink',
  'purple',
]

const TAG_COLORS: Record<TagType, { bg: string, color: string, border: string }> = {
  default: { bg: '#f5f5f5', color: '#666', border: '#ddd' },
  primary: { bg: '#e8f4fd', color: '#1677ff', border: '#91caff' },
  success: { bg: '#e8f5e9', color: '#52c41a', border: '#b7eb8f' },
  warning: { bg: '#fff7e6', color: '#faad14', border: '#ffe58f' },
  danger: { bg: '#fff1f0', color: '#ff4d4f', border: '#ffa39e' },
  volcano: { bg: '#fff2e8', color: '#fa541c', border: '#ffbb96' },
  lightblue: { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
  cyan: { bg: '#e6fffb', color: '#13c2c2', border: '#87e8de' },
  pink: { bg: '#fff0f6', color: '#eb2f96', border: '#ffadd2' },
  purple: { bg: '#f9f0ff', color: '#722ed1', border: '#d3adf7' },
}

const SIZE_MAP: Record<TagSize, { fontSize: string, padding: string, height: string }> = {
  large: { fontSize: '28rpx', padding: '0 24rpx', height: '48rpx' },
  medium: { fontSize: '24rpx', padding: '0 20rpx', height: '40rpx' },
  small: { fontSize: '20rpx', padding: '0 16rpx', height: '32rpx' },
}

const current = computed<DictDataOption | undefined>(() => {
  if (props.value === undefined || props.value === null || props.value === '')
    return undefined
  return props.options.find(item => item.value === String(props.value))
})

const loading = computed(() => props.options.length === 0)

const tagType = computed<TagType>(() => {
  const t = current.value?.tagType
  return t && (VALID_TAG_TYPES as string[]).includes(t) ? (t as TagType) : 'default'
})

const tagStyle = computed(() => {
  const colors = TAG_COLORS[tagType.value]
  const size = SIZE_MAP[props.size ?? 'medium']
  const isOutlined = props.variant === 'outlined'
  return {
    fontSize: size.fontSize,
    padding: size.padding,
    height: size.height,
    lineHeight: size.height,
    background: isOutlined ? 'transparent' : colors.bg,
    color: colors.color,
    border: isOutlined ? `1rpx solid ${colors.color}` : `1rpx solid ${colors.border}`,
    borderRadius: props.round ? '999rpx' : '6rpx',
  }
})

const text = computed(() =>
  current.value?.label ?? props.fallback ?? String(props.value ?? ''),
)
</script>

<template>
  <view v-if="loading" class="dict-tag-loading" />
  <view
    v-else
    class="dict-tag"
    :class="current?.tagClass || current?.cssClass || ''"
    :style="tagStyle"
  >
    <text v-if="icon" :class="icon" class="dict-tag__icon" />
    {{ text }}
  </view>
</template>

<style lang="scss" scoped>
.dict-tag-loading {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #e8e8e8;
  border-top-color: #999;
  border-radius: 50%;
  animation: dict-spin 0.6s linear infinite;
}

.dict-tag {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  white-space: nowrap;
  box-sizing: border-box;
  vertical-align: middle;
}

.dict-tag__icon {
  font-size: inherit;
}

@keyframes dict-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
