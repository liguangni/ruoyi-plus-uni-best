<template>
  <view class="container">
    <view class="page-body uni-content-info">
      <view class="cropper-content">
        <view
          v-if="isShowImg"
          class="uni-corpper"
          :style="{ width: `${cropperInitW}px`, height: `${cropperInitH}px`, background: '#000' }"
        >
          <view
            class="uni-corpper-content"
            :style="{ width: `${cropperW}px`, height: `${cropperH}px`, left: `${cropperL}px`, top: `${cropperT}px` }"
          >
            <image :src="imageSrc" :style="{ width: `${cropperW}px`, height: `${cropperH}px` }" />
            <view
              class="uni-corpper-crop-box"
              :style="{ left: `${cutL}px`, top: `${cutT}px`, right: `${cutR}px`, bottom: `${cutB}px` }"
              @touchstart.stop="contentStartMove"
              @touchmove.stop="contentMoveing"
              @touchend.stop="contentTouchEnd"
            >
              <view class="uni-cropper-view-box">
                <view class="uni-cropper-dashed-h" />
                <view class="uni-cropper-dashed-v" />
                <view class="uni-cropper-line-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-line-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-line-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-line-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-point point-t" data-drag="top" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-point point-tr" data-drag="topTight" />
                <view class="uni-cropper-point point-r" data-drag="right" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-point point-rb" data-drag="rightBottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-point point-b" data-drag="bottom" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-point point-bl" data-drag="bottomLeft" />
                <view class="uni-cropper-point point-l" data-drag="left" @touchstart.stop="dragStart" @touchmove.stop="dragMove" />
                <view class="uni-cropper-point point-lt" data-drag="leftTop" />
              </view>
            </view>
          </view>
        </view>
        <!-- 上传遮罩 -->
        <view v-if="isUploading" class="upload-overlay">
          <text class="upload-overlay-pct">{{ uploadProgress }}%</text>
          <view class="upload-overlay-bar">
            <view class="upload-overlay-fill" :style="{ width: `${uploadProgress}%` }" />
          </view>
        </view>
      </view>

      <view class="cropper-config">
        <button type="primary" style="margin-top: 30rpx" :disabled="isUploading" @click="getImage">
          选择头像
        </button>
        <button type="warn" style="margin-top: 30rpx" :disabled="isUploading" @click="getImageInfo">
          提交
        </button>
      </view>

      <canvas
        canvas-id="myCanvas" :style="{
          position: 'absolute',
          border: '1px solid red',
          width: `${imageW}px`,
          height: `${imageH}px`,
          top: '-9999px',
          left: '-9999px',
        }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { uploadOss } from '@/api/system/oss'
import { updateUserProfile } from '@/api/system/user'
import { useUserStore } from '@/store'
import { showToastMsg } from '@/utils/common'

definePage({
  style: {
    navigationBarTitleText: '修改头像',
  },
})

const userStore = useUserStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)

// 系统信息
const sysInfo = uni.getSystemInfoSync()
const SCREEN_WIDTH = sysInfo.screenWidth

// 拖拽临时变量（非响应式，避免不必要的渲染）
let PAGE_X // 手按下的x位置
let PAGE_Y // 手按下y的位置
const PR = sysInfo.pixelRatio // dpi
let T_PAGE_X // 手移动的时候x的位置
let T_PAGE_Y // 手移动的时候Y的位置
let CUT_L // 初始化拖拽元素的left值
let CUT_T // 初始化拖拽元素的top值
let CUT_R // 初始化拖拽元素的
let CUT_B // 初始化拖拽元素的
let CUT_W // 初始化拖拽元素的宽度
let CUT_H //  初始化拖拽元素的高度
let IMG_RATIO // 图片比例
let IMG_REAL_W // 图片实际的宽度
let IMG_REAL_H // 图片实际的高度
const DRAFG_MOVE_RATIO = 1 // 移动时候的比例,
let INIT_DRAG_POSITION = 100 // 初始化屏幕宽度和裁剪区域的宽度之差，用于设置初始化裁剪的宽度
const DRAW_IMAGE_W = SCREEN_WIDTH // 设置生成的图片宽度

const imageSrc = ref(userInfo.value.user.avatarUrl)
const isShowImg = ref(false)
const cropperInitW = ref(SCREEN_WIDTH)
const cropperInitH = ref(SCREEN_WIDTH)
const cropperW = ref(SCREEN_WIDTH)
const cropperH = ref(SCREEN_WIDTH)

// 动态的left top值
const cropperL = ref(0)
const cropperT = ref(0)

const transL = ref(0)
const transT = ref(0)

// 图片缩放值
const scaleP = ref(0)
const imageW = ref(0)
const imageH = ref(0)

// 裁剪框 宽高
const cutL = ref(0)
const cutT = ref(0)
const cutB = ref(SCREEN_WIDTH)
const cutR = ref(SCREEN_WIDTH)
const qualityWidth = ref(DRAW_IMAGE_W)
const innerAspectRadio = ref(DRAFG_MOVE_RATIO)
const uploadProgress = ref(0)
const isUploading = ref(false)

// ==================== 方法 ====================

function getImage() {
  uni.chooseImage({
    success: (res) => {
      imageSrc.value = res.tempFilePaths[0]
      loadImage()
    },
  })
}

function loadImage() {
  uni.getImageInfo({
    src: imageSrc.value,
    success: (res) => {
      IMG_RATIO = 1 / 1

      if (IMG_RATIO >= 1) {
        IMG_REAL_W = SCREEN_WIDTH
        IMG_REAL_H = SCREEN_WIDTH / IMG_RATIO
      }
      else {
        IMG_REAL_W = SCREEN_WIDTH * IMG_RATIO
        IMG_REAL_H = SCREEN_WIDTH
      }

      const minRange = IMG_REAL_W > IMG_REAL_H ? IMG_REAL_W : IMG_REAL_H
      INIT_DRAG_POSITION = minRange > INIT_DRAG_POSITION ? INIT_DRAG_POSITION : minRange

      // 根据图片的宽高显示不同的效果   保证图片可以正常显示
      if (IMG_RATIO >= 1) {
        const computedCutT = Math.ceil((SCREEN_WIDTH / IMG_RATIO - (SCREEN_WIDTH / IMG_RATIO - INIT_DRAG_POSITION)) / 2)
        const computedCutB = computedCutT
        const computedCutL = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH + INIT_DRAG_POSITION) / 2)
        const computedCutR = computedCutL

        cutT.value = computedCutT
        cutB.value = computedCutB
        cutL.value = computedCutT
        cutR.value = cutL.value

        // 横图
        cropperW.value = SCREEN_WIDTH
        cropperH.value = SCREEN_WIDTH / IMG_RATIO
        cropperL.value = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2)
        cropperT.value = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH / IMG_RATIO) / 2)
        imageW.value = IMG_REAL_W
        imageH.value = IMG_REAL_H
        scaleP.value = IMG_REAL_W / SCREEN_WIDTH
        qualityWidth.value = DRAW_IMAGE_W
        innerAspectRadio.value = IMG_RATIO
      }
      else {
        // 竖图
        const computedCutL = Math.ceil((SCREEN_WIDTH * IMG_RATIO - (SCREEN_WIDTH * IMG_RATIO)) / 2)
        const computedCutR = computedCutL
        const computedCutT = Math.ceil((SCREEN_WIDTH - INIT_DRAG_POSITION) / 2)
        const computedCutB = computedCutT

        cropperW.value = SCREEN_WIDTH * IMG_RATIO
        cropperH.value = SCREEN_WIDTH
        cropperL.value = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH * IMG_RATIO) / 2)
        cropperT.value = Math.ceil((SCREEN_WIDTH - SCREEN_WIDTH) / 2)
        cutL.value = computedCutL
        cutT.value = computedCutT
        cutR.value = computedCutR
        cutB.value = computedCutB
        imageW.value = IMG_REAL_W
        imageH.value = IMG_REAL_H
        scaleP.value = IMG_REAL_W / SCREEN_WIDTH
        qualityWidth.value = DRAW_IMAGE_W
        innerAspectRadio.value = IMG_RATIO
      }

      isShowImg.value = true
      uni.hideLoading()
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '图片加载失败', icon: 'none' })
    },
  })
}

function contentStartMove(e: any) {
  PAGE_X = e.touches[0].pageX
  PAGE_Y = e.touches[0].pageY
}

function contentMoveing(e: any) {
  let dragLengthX = (PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
  let dragLengthY = (PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO

  if (dragLengthX > 0) {
    if (cutL.value - dragLengthX < 0)
      dragLengthX = cutL.value
  }
  else {
    if (cutR.value + dragLengthX < 0)
      dragLengthX = -cutR.value
  }

  if (dragLengthY > 0) {
    if (cutT.value - dragLengthY < 0)
      dragLengthY = cutT.value
  }
  else {
    if (cutB.value + dragLengthY < 0)
      dragLengthY = -cutB.value
  }

  cutL.value = cutL.value - dragLengthX
  cutT.value = cutT.value - dragLengthY
  cutR.value = cutR.value + dragLengthX
  cutB.value = cutB.value + dragLengthY

  PAGE_X = e.touches[0].pageX
  PAGE_Y = e.touches[0].pageY
}

function contentTouchEnd() {}

// 设置大小的时候触发的touchStart事件
function dragStart(e: any) {
  T_PAGE_X = e.touches[0].pageX
  T_PAGE_Y = e.touches[0].pageY
  CUT_L = cutL.value
  CUT_T = cutT.value
  CUT_R = cutR.value
  CUT_B = cutB.value
}

// 设置大小的时候触发的touchMove事件
function dragMove(e: any) {
  const dragType = e.target.dataset.drag

  switch (dragType) {
    case 'right':{
      let dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
      if (CUT_R + dragLength < 0)
        dragLength = -CUT_R
      cutR.value = CUT_R + dragLength
      break
    }
    case 'left':{
      let dragLength = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
      if (CUT_L - dragLength < 0)
        dragLength = CUT_L
      if ((CUT_L - dragLength) > (cropperW.value - cutR.value))
        dragLength = CUT_L - (cropperW.value - cutR.value)
      cutL.value = CUT_L - dragLength
      break }
    case 'top': {
      let dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
      if (CUT_T - dragLength < 0)
        dragLength = CUT_T
      if ((CUT_T - dragLength) > (cropperH.value - cutB.value))
        dragLength = CUT_T - (cropperH.value - cutB.value)
      cutT.value = CUT_T - dragLength
      break
    }
    case 'bottom': {
      let dragLength = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO
      if (CUT_B + dragLength < 0)
        dragLength = -CUT_B
      cutB.value = CUT_B + dragLength
      break
    }
    case 'rightBottom': {
      let dragLengthX = (T_PAGE_X - e.touches[0].pageX) * DRAFG_MOVE_RATIO
      let dragLengthY = (T_PAGE_Y - e.touches[0].pageY) * DRAFG_MOVE_RATIO

      if (CUT_B + dragLengthY < 0)
        dragLengthY = -CUT_B
      if (CUT_R + dragLengthX < 0)
        dragLengthX = -CUT_R

      cutB.value = CUT_B + dragLengthY
      cutR.value = CUT_R + dragLengthX
      break
    }
    default:
      break
  }
}

async function getImageInfo() {
  uni.showLoading({ title: '图片生成中...' })

  const ctx = uni.createCanvasContext('myCanvas')
  ctx.drawImage(imageSrc.value, 0, 0, IMG_REAL_W, IMG_REAL_H)
  ctx.draw(true, () => {
    const canvasW = ((cropperW.value - cutL.value - cutR.value) / cropperW.value) * IMG_REAL_W
    const canvasH = ((cropperH.value - cutT.value - cutB.value) / cropperH.value) * IMG_REAL_H
    const canvasL = (cutL.value / cropperW.value) * IMG_REAL_W
    const canvasT = (cutT.value / cropperH.value) * IMG_REAL_H

    uni.canvasToTempFilePath({
      x: canvasL,
      y: canvasT,
      width: canvasW,
      height: canvasH,
      destWidth: canvasW,
      destHeight: canvasH,
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
        catch (error) {
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

onLoad(async () => {
  if (imageSrc.value) {
    loadImage()
  }
})
</script>

<style scoped>
.cropper-config {
  padding: 20rpx 40rpx;
}

.cropper-content {
  position: relative;
  min-height: 750rpx;
  width: 100%;
}

.uni-corpper {
  position: relative;
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  box-sizing: border-box;
}

.uni-corpper-content {
  position: relative;
}

.uni-corpper-content image {
  display: block;
  width: 100%;
  min-width: 0 !important;
  max-width: none !important;
  height: 100%;
  min-height: 0 !important;
  max-height: none !important;
  image-orientation: 0deg !important;
  margin: 0 auto;
}

/* 移动图片效果 */
.uni-cropper-drag-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  cursor: move;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

/* 内部的信息 */
.uni-corpper-crop-box {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.uni-corpper-crop-box .uni-cropper-view-box {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  outline: 1rpx solid #69f;
  outline-color: rgba(102, 153, 255, 0.75);
}

/* 横向虚线 */
.uni-cropper-dashed-h {
  position: absolute;
  top: 33.33333333%;
  left: 0;
  width: 100%;
  height: 33.33333333%;
  border-top: 1rpx dashed rgba(255, 255, 255, 0.5);
  border-bottom: 1rpx dashed rgba(255, 255, 255, 0.5);
}

/* 纵向虚线 */
.uni-cropper-dashed-v {
  position: absolute;
  left: 33.33333333%;
  top: 0;
  width: 33.33333333%;
  height: 100%;
  border-left: 1rpx dashed rgba(255, 255, 255, 0.5);
  border-right: 1rpx dashed rgba(255, 255, 255, 0.5);
}

/* 四个方向的线  为了之后的拖动事件*/
.uni-cropper-line-t {
  position: absolute;
  display: block;
  width: 100%;
  background-color: #69f;
  top: 0;
  left: 0;
  height: 1rpx;
  opacity: 0.1;
  cursor: n-resize;
}

.uni-cropper-line-t::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0rpx;
  width: 100%;
  -webkit-transform: translate3d(0, -50%, 0);
  transform: translate3d(0, -50%, 0);
  bottom: 0;
  height: 41rpx;
  background: transparent;
  z-index: 11;
}

.uni-cropper-line-r {
  position: absolute;
  display: block;
  background-color: #69f;
  top: 0;
  right: 0rpx;
  width: 1rpx;
  opacity: 0.1;
  height: 100%;
  cursor: e-resize;
}

.uni-cropper-line-r::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 41rpx;
  -webkit-transform: translate3d(-50%, 0, 0);
  transform: translate3d(-50%, 0, 0);
  bottom: 0;
  height: 100%;
  background: transparent;
  z-index: 11;
}

.uni-cropper-line-b {
  position: absolute;
  display: block;
  width: 100%;
  background-color: #69f;
  bottom: 0;
  left: 0;
  height: 1rpx;
  opacity: 0.1;
  cursor: s-resize;
}

.uni-cropper-line-b::before {
  content: '';
  position: absolute;
  top: 50%;
  right: 0rpx;
  width: 100%;
  -webkit-transform: translate3d(0, -50%, 0);
  transform: translate3d(0, -50%, 0);
  bottom: 0;
  height: 41rpx;
  background: transparent;
  z-index: 11;
}

.uni-cropper-line-l {
  position: absolute;
  display: block;
  background-color: #69f;
  top: 0;
  left: 0;
  width: 1rpx;
  opacity: 0.1;
  height: 100%;
  cursor: w-resize;
}

.uni-cropper-line-l::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 41rpx;
  -webkit-transform: translate3d(-50%, 0, 0);
  transform: translate3d(-50%, 0, 0);
  bottom: 0;
  height: 100%;
  background: transparent;
  z-index: 11;
}

.uni-cropper-point {
  width: 5rpx;
  height: 5rpx;
  background-color: #69f;
  opacity: 0.75;
  position: absolute;
  z-index: 3;
}

.point-t {
  top: -3rpx;
  left: 50%;
  margin-left: -3rpx;
  cursor: n-resize;
}

.point-tr {
  top: -3rpx;
  left: 100%;
  margin-left: -3rpx;
  cursor: n-resize;
}

.point-r {
  top: 50%;
  left: 100%;
  margin-left: -3rpx;
  margin-top: -3rpx;
  cursor: n-resize;
}

.point-rb {
  left: 100%;
  top: 100%;
  -webkit-transform: translate3d(-50%, -50%, 0);
  transform: translate3d(-50%, -50%, 0);
  cursor: n-resize;
  width: 36rpx;
  height: 36rpx;
  background-color: #69f;
  position: absolute;
  z-index: 1112;
  opacity: 1;
}

.point-b {
  left: 50%;
  top: 100%;
  margin-left: -3rpx;
  margin-top: -3rpx;
  cursor: n-resize;
}

.point-bl {
  left: 0%;
  top: 100%;
  margin-left: -3rpx;
  margin-top: -3rpx;
  cursor: n-resize;
}

.point-l {
  left: 0%;
  top: 50%;
  margin-left: -3rpx;
  margin-top: -3rpx;
  cursor: n-resize;
}

.point-lt {
  left: 0%;
  top: 0%;
  margin-left: -3rpx;
  margin-top: -3rpx;
  cursor: n-resize;
}

/* 裁剪框预览内容 */
.uni-cropper-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.uni-cropper-viewer image {
  position: absolute;
  z-index: 2;
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
.upload-overlay-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16rpx;
}
</style>
