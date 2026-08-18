<script lang="ts" setup>
import { computed } from 'vue'
import noList from '@/static/images/empty/no-list.png'
import noBox from '@/static/images/empty/no-box.png'

const props = withDefaults(
  defineProps<{
    /** 图标类型：no-list 列表空态 / no-box 通用空态 */
    icon?: 'no-list' | 'no-box'
    /** 空态文案 */
    text?: string
    /** 图标尺寸（rpx） */
    size?: number
  }>(),
  {
    icon: 'no-list',
    text: '暂无数据',
    size: 240,
  },
)

const iconMap = {
  'no-list': noList,
  'no-box': noBox,
}

const iconSrc = computed(() => iconMap[props.icon])
const iconStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`,
}))
</script>

<template>
  <view class="empty-state">
    <image
      class="empty-state__icon"
      :src="iconSrc"
      :style="iconStyle"
      mode="aspectFit"
    />
    <text class="empty-state__text">{{ text }}</text>
    <slot />
  </view>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 120rpx 0;

  &__icon {
    display: block;
  }

  &__text {
    font-size: 28rpx;
    line-height: 1.5;
    color: #86909c;
  }
}
</style>
