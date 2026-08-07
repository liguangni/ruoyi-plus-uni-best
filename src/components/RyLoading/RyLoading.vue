<script lang="ts" setup>
withDefaults(
  defineProps<{
    size?: string
    color?: string
    text?: string
    icon?: string
    height?: string
    vertical?: boolean
    gap?: string
  }>(),
  {
    size: '32rpx',
    color: '#999',
    text: '',
    icon: '',
    height: '',
    vertical: false,
    gap: '12rpx',
  },
)
</script>

<template>
  <view class="wf-loading" :style="{ height }">
    <view class="wf-loading__inner" :class="{ 'wf-loading__inner--vertical': vertical }" :style="{ gap }">
      <view v-if="icon" class="wf-loading__icon" :class="icon" :style="{ fontSize: size, color }" />
      <view v-else class="wf-loading__spinner" :style="{ width: size, height: size, borderTopColor: color }" />
      <view v-if="text" class="wf-loading__text" :style="{ fontSize: size, color }">
        {{ text }}
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.wf-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.wf-loading__inner {
  display: flex;
  align-items: center;
  justify-content: center;

  &--vertical {
    flex-direction: column;
  }
}

.wf-loading__spinner {
  border: 3rpx solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: wf-spin 0.8s linear infinite;
}

.wf-loading__text {
  line-height: 1.2;
}

@keyframes wf-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
