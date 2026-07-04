<script lang="ts" setup>
import { ref } from 'vue'

definePage({
  style: {
    navigationBarTitleText: '关于',
  },
})

const version = ref('')

onLoad(() => {
  const info = uni.getAppBaseInfo()
  version.value = info?.appVersion ?? ''
})

// 隐私协议
function handlePrivacy() {
  const site = {
    title: '隐私政策',
    url: 'https://ruoyi.vip/protocol.html',
  }
  uni.navigateTo({ url: `/pages-core/common/webview/webview?title=${site.title}&url=${site.url}` })
}
// 用户协议
function handleUserAgrement() {
  const site = {
    title: '用户协议',
    url: 'https://ruoyi.vip/protocol.html',
  }
  uni.navigateTo({ url: `/pages-core/common/webview/webview?title=${site.title}&url=${site.url}` })
}
</script>

<template>
  <view class="page-container">
    <view class="header-section">
      <image class="logo" src="@/static/logo.svg" mode="widthFix" />
      <text class="title mt-2 text-2xl">Ruoyi-Plus-Uni-Best</text>
      <text class="subtitle mt-2">{{ version }}</text>
    </view>

    <view class="content-section mt-3">
      <view class="menu-list">
        <view class="list-cell list-cell-arrow" @click="handleUserAgrement">
          <view class="menu-item-box">
            <text>用户协议</text>
            <view class="text-right">
              <view class="i-carbon-chevron-right" />
            </view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow" @click="handlePrivacy">
          <view class="menu-item-box">
            <text>隐私政策</text>
            <view class="text-right">
              <view class="i-carbon-chevron-right" />
            </view>
          </view>
        </view>
        <view class="list-cell list-cell-arrow">
          <view class="menu-item-box">
            <text>联系我们</text>
            <view class="text-right">
              <view class="i-carbon-chevron-right" />
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="copyright pos-fixed bottom-10 left-0 right-0">
      <view>Copyright &copy; 2026 Ruoyi-Plus-Uni-Best</view>
      <view>All Rights Reserved.</view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.about-container {
  background-color: #f8f8f8;
  padding-top: var(--window-top);
  min-height: calc(100vh - var(--window-top));
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;

  .logo {
    width: 120rpx;
    height: 120rpx;
  }

  .title {
    margin-top: 20rpx;
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }
}

.content-section {
  margin: 0 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-list {
  .list-cell {
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .menu-item-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    font-size: 30rpx;
    color: #333;
  }

  .text-right {
    display: flex;
    align-items: center;
    color: #999;
    font-size: 28rpx;

    .arrow {
      margin-left: 10rpx;
      color: #ccc;
    }
  }
}

.copyright {
  margin-top: 50rpx;
  text-align: center;
  line-height: 60rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
