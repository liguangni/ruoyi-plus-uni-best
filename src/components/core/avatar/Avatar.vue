<template>
  <view class="core-avatar" :style="wrapperStyle">
    <image
      class="core-avatar__img"
      :src="finalSrc"
      mode="aspectFill"
      :style="imgStyle"
    />
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import DEFAULT_AVATAR from '@/static/images/default-avatar.png'

const props = withDefaults(defineProps<{
  src?: string | number
  width?: string | number
  height?: string | number
  round?: boolean
}>(), {
  src: '',
  width: '100rpx',
  height: '100rpx',
  round: false,
})

const userStore = useUserStore()

const finalSrc = computed(() => {
  if (props.src)
    return String(props.src)
  const url = userStore.userInfo.user.avatarUrl
  if (url && url.trim())
    return url
  return DEFAULT_AVATAR
})

const wrapperStyle = computed(() => ({
  width: toSize(props.width),
  height: toSize(props.height),
  borderRadius: props.round ? '50%' : '0',
}))

const imgStyle = computed(() => ({
  borderRadius: props.round ? '50%' : '0',
}))

function toSize(val: string | number) {
  return typeof val === 'number' ? `${val}rpx` : val
}
</script>

<style lang="scss" scoped>
.core-avatar {
  overflow: hidden;
  flex-shrink: 0;

  &__img {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
