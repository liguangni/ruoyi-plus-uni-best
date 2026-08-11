<script lang="ts" setup>
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'
import { START_REGISTRY } from '@/pages-workflow/task/utils/start-registry'
import { navigateToStart } from '@/pages-workflow/task/utils/workflow'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}

/** 由注册表派生网格项：新增业务只需在 start-registry 加一项，弹窗自动出现 */
const items = Object.entries(START_REGISTRY).map(([key, cfg]) => ({
  key,
  name: cfg.name,
  icon: cfg.icon,
}))

/**
 * 选完业务类型后直接跳转对应发起页。
 * 后台直发起（mode==='backend'）必须配置 submitApi，否则提示「未配置发起接口」并不跳转，避免跳到发起页后无法提交。
 */
function onSelect(key: string) {
  close()
  const cfg = START_REGISTRY[key]
  if (cfg?.mode === 'backend' && !cfg.submitApi) {
    uni.showToast({ title: '未配置发起接口', icon: 'none' })
    return
  }
  navigateToStart(key)
}
</script>

<template>
  <WorkflowPopup
    :visible="modelValue"
    title="发起申请"
    height="75vh"
    :body-padding="false"
    @update:visible="close"
  >
    <view class="start-grid__inner">
      <view
        v-for="item in items"
        :key="item.key"
        class="start-grid__item"
        @click="onSelect(item.key)"
      >
        <view class="start-grid__icon">
          <view :class="item.icon" />
        </view>
        <text class="start-grid__text">{{ item.name }}</text>
      </view>
    </view>
  </WorkflowPopup>
</template>

<style lang="scss" scoped>
.start-grid__inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1rpx solid #f0f0f0;
}
.start-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
  border-right: 1rpx solid #f0f0f0;
  transition: background 0.2s;
}
.start-grid__icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: #fff;
  background: #4a90e2;
  margin-bottom: 12rpx;
  transition: transform 0.2s ease;
}
.start-grid__text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}
.start-grid__item:nth-child(4n) {
  border-right: none;
}
.start-grid__item:active {
  background: #f5f5f5;
}
</style>
