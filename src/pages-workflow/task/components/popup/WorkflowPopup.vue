<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { StyleValue } from 'vue'

defineOptions({ name: 'WorkflowPopup' })

const props = withDefaults(
  defineProps<{
    /** v-model:visible 控制显隐 */
    visible?: boolean
    /** 标题，为空则隐藏标题栏 */
    title?: string
    /** 是否显示关闭按钮 */
    showClose?: boolean
    /** 点击遮罩层是否关闭 */
    closeOnOverlay?: boolean
    /** 是否显示遮罩层 */
    showOverlay?: boolean
    /** 固定高度（如 75vh），为空则用 maxHeight */
    height?: string | null
    /** 最大高度 */
    maxHeight?: string
    /** 层级 */
    zIndex?: number
    /** 内容区自定义 class */
    bodyClass?: string
    /** 内容区自定义 style */
    bodyStyle?: StyleValue
    /** 底部栏自定义 class */
    footerClass?: string
    /**
     * 是否内置滚动容器（默认 true）。内容超长时自动滚动；
     * 设为 false 时 body 为普通 view，用于内部已自带滚动区的场景（如历史记录面板的附件/审批人列表）。
     */
    scroll?: boolean
    /**
     * 内容区是否保留默认内边距（默认 true）。需要内容贴边铺满时设为 false，例如发起申请弹窗的网格列表。
     */
    bodyPadding?: boolean
  }>(),
  {
    visible: false,
    title: '',
    showClose: true,
    closeOnOverlay: true,
    showOverlay: true,
    height: null,
    maxHeight: '75vh',
    zIndex: 1100,
    bodyClass: '',
    bodyStyle: '',
    footerClass: '',
    scroll: true,
    bodyPadding: true,
  },
)

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'scroll', ev: any): void
  (e: 'scrolltolower', ev: any): void
}>()

const bodyRef = ref()

const sheetStyle = computed(() => {
  const style: Record<string, string> = {
    maxHeight: props.height ?? props.maxHeight,
  }
  if (props.height) {
    style.height = props.height
  }
  return style
})

function close() {
  emit('update:visible', false)
  emit('close')
}

function onOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}
</script>

<template>
  <view v-if="visible && showOverlay" class="wf-popup__overlay" :style="{ zIndex }" @click="onOverlayClick">
    <view class="wf-popup__sheet" :style="sheetStyle" @click.stop>
      <!-- header -->
      <view v-if="title || $slots.header" class="wf-popup__header">
        <slot name="header">
          <text class="wf-popup__title">{{ title }}</text>
          <view v-if="showClose" class="wf-popup__close" @click="close">
            <text class="i-carbon-close wf-popup__close-icon" />
          </view>
        </slot>
      </view>

      <!-- body：内置滚动容器（scroll=true）或普通 view（scroll=false） -->
      <scroll-view
        v-if="scroll"
        ref="bodyRef"
        class="wf-popup__body wf-scroll-fill"
        :class="[bodyClass, bodyPadding ? 'wf-popup__body--scroll' : 'wf-popup__body--no-padding']"
        :style="bodyStyle"
        scroll-y
        @scroll="ev => emit('scroll', ev)"
        @scrolltolower="ev => emit('scrolltolower', ev)"
      >
        <slot />
      </scroll-view>
      <view
        v-else
        ref="bodyRef"
        class="wf-popup__body"
        :class="[bodyClass, { 'wf-popup__body--no-padding': !bodyPadding }]"
        :style="bodyStyle"
      >
        <slot />
      </view>

      <!-- footer：结构固定，恒在滚动区之外（与 body 同级兄弟） -->
      <view v-if="$slots.footer" class="wf-popup__footer" :class="footerClass">
        <slot name="footer" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.wf-popup__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
}

.wf-popup__sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.wf-popup__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.wf-popup__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
  text-align: center;
}

.wf-popup__close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.wf-popup__close-icon {
  font-size: 36rpx;
  color: #999;
}

.wf-popup__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.wf-popup__body--scroll {
  padding: 24rpx 32rpx 32rpx;
}

.wf-popup__body--no-padding {
  padding: 0 !important;
}

.wf-popup__footer {
  flex-shrink: 0;
  width: 100%;
}
</style>
