<script lang="ts" setup>
withDefaults(
  defineProps<{
    current: number
    items: any[]
    statusKey?: string
  }>(),
  {
    statusKey: 'flowStatus',
  },
)

function getStepStatus(item: any, index: number, current: number, statusKey: string) {
  const val = item[statusKey]
  if (val === 'waiting') {
    return 'process'
  }
  if (index <= current) {
    return 'finish'
  }
  return 'process'
}

function getStepIcon(item: any, statusKey: string) {
  return item[statusKey] === 'waiting' ? 'i-carbon-time' : 'i-carbon-checkmark-outline'
}
</script>

<template>
  <view class="wf-steps">
    <view v-for="(item, idx) in items" :key="idx" class="wf-step">
      <view class="wf-step__indicator">
        <view class="wf-step__dot" :class="`wf-step__dot--${getStepStatus(item, idx, current, statusKey)}`">
          <view class="text-xs" :class="[getStepIcon(item, statusKey), getStepStatus(item, idx, current, statusKey) === 'finish' ? 'text-[#22c55e]' : 'text-[#4096ff]']" />
        </view>
        <view v-if="idx < items.length - 1" class="wf-step__line" />
      </view>
      <view class="wf-step__content">
        <slot name="item" :item="item" :index="idx" :status="getStepStatus(item, idx, current, statusKey)" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.wf-steps {
  display: flex;
  flex-direction: column;
}

.wf-step {
  display: flex;
  flex-direction: row;
}

.wf-step__indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.wf-step__dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.wf-step__line {
  flex: 1;
  width: 3rpx;
  min-height: 32rpx;
  background: #e5e7eb;
}

.wf-step__content {
  flex: 1;
  padding-bottom: 32rpx;
}
</style>
