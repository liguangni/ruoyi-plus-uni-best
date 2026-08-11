<script lang="ts" setup>
import type { ApprovalTabbarType } from '../utils/workflow'

defineProps<{
  modelValue: ApprovalTabbarType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ApprovalTabbarType]
  'toggle-popup': []
}>()

const activeColor = '#018d71'
const inactiveColor = '#9ca3af'
</script>

<template>
  <view class="wf-tabbar">
    <view class="wf-tabbar__content">
      <!-- 我的待办 -->
      <view class="wf-tabbar__item" @click="emit('update:modelValue', 'waiting')">
        <view class="wf-tabbar__icon" :style="{ color: modelValue === 'waiting' ? activeColor : inactiveColor }">
          <view class="i-carbon-document-import text-xl" />
        </view>
        <view class="wf-tabbar__text" :style="{ color: modelValue === 'waiting' ? activeColor : inactiveColor }">
          我的待办
        </view>
      </view>
      <!-- 我的已办 -->
      <view class="wf-tabbar__item" @click="emit('update:modelValue', 'finish')">
        <view class="wf-tabbar__icon" :style="{ color: modelValue === 'finish' ? activeColor : inactiveColor }">
          <view class="i-carbon-task-complete text-xl" />
        </view>
        <view class="wf-tabbar__text" :style="{ color: modelValue === 'finish' ? activeColor : inactiveColor }">
          我的已办
        </view>
      </view>
      <!-- 凸起按钮 -->
      <view class="wf-tabbar__item">
        <view class="wf-tabbar__bulge-btn" @click.stop="emit('toggle-popup')">
          <view class="i-carbon-add-alt text-2xl text-white" />
        </view>
      </view>
      <!-- 我的抄送 -->
      <view class="wf-tabbar__item" @click="emit('update:modelValue', 'copy')">
        <view class="wf-tabbar__icon" :style="{ color: modelValue === 'copy' ? activeColor : inactiveColor }">
          <view class="i-carbon-send-alt text-xl" />
        </view>
        <view class="wf-tabbar__text" :style="{ color: modelValue === 'copy' ? activeColor : inactiveColor }">
          我的抄送
        </view>
      </view>
      <!-- 我的发起 -->
      <view class="wf-tabbar__item" @click="emit('update:modelValue', 'document')">
        <view class="wf-tabbar__icon" :style="{ color: modelValue === 'document' ? activeColor : inactiveColor }">
          <view class="i-carbon-document-add text-xl" />
        </view>
        <view class="wf-tabbar__text" :style="{ color: modelValue === 'document' ? activeColor : inactiveColor }">
          我的发起
        </view>
      </view>
    </view>
    <view class="wf-tabbar__safe" />
  </view>
</template>

<style scoped lang="scss">
.wf-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background: #fff;
  border-top: 1px solid #eee;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.1);
}
.wf-tabbar__content {
  display: flex;
  align-items: center;
  height: 100rpx;
}
.wf-tabbar__safe {
  height: env(safe-area-inset-bottom);
}
.wf-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.wf-tabbar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}
.wf-tabbar__text {
  margin-top: 2px;
  font-size: 24rpx;
  transition: color 0.2s ease;
}
.wf-tabbar__bulge-btn {
  margin-top: -44rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #018d71, #04b494);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(1, 141, 113, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.wf-tabbar__bulge-btn:active {
  transform: scale(0.92);
  box-shadow: 0 4rpx 12rpx rgba(1, 141, 113, 0.3);
}
</style>
