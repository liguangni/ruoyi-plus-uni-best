<template>
  <view class="container">
    <view class="page-body uni-content-info">
      <view class="cropper-content">
        <view class="crop-container" :style="containerStyle">
          <image
            :src="imageSrc"
            :style="imageStyle"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          />
          <view class="crop-mask">
            <view class="crop-circle" />
          </view>
        </view>

        <view v-if="isUploading" class="upload-overlay">
          <text class="upload-overlay-pct">{{ uploadProgress }}%</text>
          <view class="upload-overlay-bar">
            <view class="upload-overlay-fill" :style="{ width: `${uploadProgress}%` }" />
          </view>
        </view>
      </view>

      <view class="cropper-config">
        <view class="btn btn-select" :class="{ disabled: isUploading }" @click="getImage">
          选择头像
        </view>
        <view class="btn btn-submit" :class="{ disabled: isUploading || !hasImage }" @click="getImageInfo">
          上传
        </view>
      </view>

      <canvas
        canvas-id="myCanvas"
        :style="{ position: 'absolute', width: `${canvasW}px`, height: `${canvasH}px`, top: '-9999px', left: '-9999px' }"
        :width="canvasW"
        :height="canvasH"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store'
import { showToastMsg } from '@/utils/common'
import { uploadOss } from '@/api/system/oss'
import { updateUserProfile } from '@/api/system/user'
import { computed, ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '修改头像',
  },
})

const userStore = useUserStore()
const SCREEN_WIDTH = uni.getSystemInfoSync().screenWidth

// 固定裁剪容器 = 页面宽度 90%，正方形
const CONTAINER_SIZE = Math.round(SCREEN_WIDTH * 0.9)

// 原始图片尺寸
const IMG_REAL_W = ref(0)
const IMG_REAL_H = ref(0)

// 初始加载现有头像用于预览
const imageSrc = ref(userStore.userInfo?.user?.avatarUrl || '')
const hasImage = ref(false) // 是否用户选择了新图片
const scale = ref(1)
const imgX = ref(0)
const imgY = ref(0)
const isUploading = ref(false)
const uploadProgress = ref(0)
const canvasW = ref(0)
const canvasH = ref(0)

// 容器样式
const containerStyle = computed(() => ({
  width: `${CONTAINER_SIZE}px`,
  height: `${CONTAINER_SIZE}px`,
}))

// 图片显示尺寸
const imgDisplayW = computed(() => Math.round(IMG_REAL_W.value * scale.value))
const imgDisplayH = computed(() => Math.round(IMG_REAL_H.value * scale.value))

// 图片样式
const imageStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${imgX.value}px`,
  top: `${imgY.value}px`,
  width: `${imgDisplayW.value}px`,
  height: `${imgDisplayH.value}px`,
}))

// 最小缩放比例：短边恰好填满容器，长边按比例等比例放大（≥容器）
function getMinScale() {
  if (!IMG_REAL_W.value || !IMG_REAL_H.value)
    return 0.5
  return CONTAINER_SIZE / Math.min(IMG_REAL_W.value, IMG_REAL_H.value)
}

function clampScale() {
  const minS = getMinScale()
  if (scale.value < minS)
    scale.value = minS
}

function clampPosition() {
  clampScale()
  const minX = CONTAINER_SIZE - imgDisplayW.value
  const minY = CONTAINER_SIZE - imgDisplayH.value
  imgX.value = Math.min(0, Math.max(minX, imgX.value))
  imgY.value = Math.min(0, Math.max(minY, imgY.value))
}

// 触摸状态
interface TouchState {
  startX: number
  startY: number
  startImgX: number
  startImgY: number
  startScale: number
  startDist: number
  touching: boolean
  pinching: boolean
}

const touchState: TouchState = {
  startX: 0,
  startY: 0,
  startImgX: 0,
  startImgY: 0,
  startScale: 1,
  startDist: 0,
  touching: false,
  pinching: false,
}

function getDist(t1: { pageX: number, pageY: number }, t2: { pageX: number, pageY: number }) {
  const dx = t1.pageX - t2.pageX
  const dy = t1.pageY - t2.pageY
  return Math.sqrt(dx * dx + dy * dy)
}

function onTouchStart(e: any) {
  const touches = e.touches
  if (touches.length === 1) {
    touchState.startX = touches[0].pageX
    touchState.startY = touches[0].pageY
    touchState.startImgX = imgX.value
    touchState.startImgY = imgY.value
    touchState.touching = true
    touchState.pinching = false
  }
  else if (touches.length === 2) {
    touchState.startDist = getDist(touches[0], touches[1])
    touchState.startScale = scale.value
    touchState.pinching = true
  }
}

function onTouchMove(e: any) {
  const touches = e.touches
  if (touches.length === 1 && touchState.touching && !touchState.pinching) {
    const dx = touches[0].pageX - touchState.startX
    const dy = touches[0].pageY - touchState.startY
    imgX.value = touchState.startImgX + dx
    imgY.value = touchState.startImgY + dy
    clampPosition()
  }
  else if (touches.length === 2 && touchState.pinching) {
    const dist = getDist(touches[0], touches[1])
    const ratio = dist / touchState.startDist
    scale.value = Math.max(getMinScale(), Math.min(10, touchState.startScale * ratio))
    clampPosition()
  }
}

function onTouchEnd(e: any) {
  // 双指松开一只后，立即以剩下的手指重新开始拖动，避免“捏完无法拖动”
  if (e.touches && e.touches.length === 1) {
    touchState.touching = true
    touchState.pinching = false
    touchState.startX = e.touches[0].pageX
    touchState.startY = e.touches[0].pageY
    touchState.startImgX = imgX.value
    touchState.startImgY = imgY.value
  }
  else {
    touchState.touching = false
    touchState.pinching = false
  }
}

function getImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      imageSrc.value = res.tempFilePaths[0]
      hasImage.value = true
      loadImage()
    },
  })
}

function loadImage() {
  uni.showLoading({ title: '加载中...' })
  uni.getImageInfo({
    src: imageSrc.value,
    success: (res) => {
      IMG_REAL_W.value = res.width
      IMG_REAL_H.value = res.height
      canvasW.value = IMG_REAL_W.value
      canvasH.value = IMG_REAL_H.value

      // 以短边填满容器，居中显示，长边按比例变化
      scale.value = getMinScale()
      imgX.value = Math.round((CONTAINER_SIZE - imgDisplayW.value) / 2)
      imgY.value = Math.round((CONTAINER_SIZE - imgDisplayH.value) / 2)
      clampPosition()
      uni.hideLoading()
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '图片加载失败', icon: 'none' })
    },
  })
}

async function getImageInfo() {
  if (!hasImage.value) {
    return showToastMsg('请先选择图片')
  }

  uni.showLoading({ title: '图片生成中...' })

  const src = imageSrc.value

  // 计算容器可见区域在原始图片中的位置
  const sx = Math.max(0, Math.round(-imgX.value / scale.value))
  const sy = Math.max(0, Math.round(-imgY.value / scale.value))
  const sw = Math.round(Math.min(IMG_REAL_W.value - sx, CONTAINER_SIZE / scale.value))
  const sh = Math.round(Math.min(IMG_REAL_H.value - sy, CONTAINER_SIZE / scale.value))

  const ctx = uni.createCanvasContext('myCanvas')
  ctx.drawImage(src, 0, 0, IMG_REAL_W.value, IMG_REAL_H.value)
  ctx.draw(true, () => {
    uni.canvasToTempFilePath({
      x: sx,
      y: sy,
      width: sw,
      height: sh,
      destWidth: sw,
      destHeight: sh,
      canvasId: 'myCanvas',
      quality: 0.8,
      success: async (res) => {
        uni.hideLoading()
        try {
          uploadProgress.value = 0
          isUploading.value = true
          const oss = uploadOss({ filePath: res.tempFilePath, name: 'file' })
          oss.uploadTask.onProgressUpdate((e) => {
            uploadProgress.value = e.progress
          })
          const data = await oss
          uploadProgress.value = 100
          await updateUserProfile({ avatar: data.ossId })
          userStore.setUserAvatar(data.url)
          uni.$emit('refreshUserInfo')
          showToastMsg('修改成功')
          uni.navigateBack()
        }
        catch {
          showToastMsg('上传失败')
        }
        finally {
          isUploading.value = false
        }
      },
      fail: () => {
        uni.hideLoading()
        showToastMsg('生成图片失败')
      },
    })
  })
}

onLoad(() => {
  if (imageSrc.value) {
    loadImage()
  }
})
</script>

<style scoped>
.cropper-content {
  position: relative;
  width: 100%;
  min-height: 750rpx;
}

.crop-container {
  position: relative;
  overflow: hidden;
  background: #000;
  margin: 40rpx auto 0;
  border-radius: 12rpx;
}

.crop-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.crop-circle {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.2);
  border: 4rpx dashed rgba(255, 255, 255, 0.5);
}

.cropper-config {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  margin-top: 60rpx;
  padding: 0 40rpx;
}

.btn {
  flex: 1;
  max-width: 280rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 28rpx;
  color: #fff;
  border-radius: 40rpx;
}

.btn-select {
  background-color: #409eff;
}

.btn-submit {
  background-color: #67c23a;
}

.btn.disabled {
  opacity: 0.5;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.upload-overlay-pct {
  font-size: 50rpx;
  font-weight: bold;
  color: #fff;
}

.upload-overlay-bar {
  width: 300rpx;
  height: 10rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5rpx;
  overflow: hidden;
  margin-top: 24rpx;
}

.upload-overlay-fill {
  height: 100%;
  background: #409eff;
  border-radius: 5rpx;
  transition: width 0.3s;
}
</style>
