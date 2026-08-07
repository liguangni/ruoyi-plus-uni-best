<template>
  <view v-if="params.url">
    <web-view :webview-styles="webviewStyles" :src="params.url" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 1. 定义 Props 类型并使用 defineProps
interface Props {
  src?: string | null
}
const props = withDefaults(defineProps<Props>(), {
  src: null,
})

// 2. 定义响应式数据 (替代 data)
const params = ref<Record<string, any>>({})
const webviewStyles = ref({
  progress: {
    color: '#FF3333',
  },
})

// 3. 使用 uni-app 的页面生命周期钩子
onLoad((event) => {
  if (event) {
    params.value = { ...event }
    if (event.url) {
      // uni-app onLoad 不会自动解码 query，需手动 decode
      params.value.url = decodeURIComponent(event.url)
    }
    if (event.title) {
      uni.setNavigationBarTitle({ title: event.title })
    }
  }
})
</script>
