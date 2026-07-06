<script lang="ts" setup>
import { ref } from 'vue'
import { toPrivacyPage, toUserAgreementPage } from '@/utils/common'

definePage({
  style: {
    navigationBarTitleText: '关于',
  },
})

const appName = import.meta.env.VITE_APP_TITLE
const version = ref('0.0.1')
const phoneNumber = '400-888-8888'

onLoad(() => {
  getVersion()
})

function getVersion() {
  version.value = import.meta.env.VITE_APP_VERSION
}

function canMakePhoneCall(): boolean {
  // #ifdef APP-PLUS || MP
  return true
  // #endif
  // #ifndef APP-PLUS || MP
  return false
  // #endif
}

function handleCall() {
  if (canMakePhoneCall()) {
    uni.showModal({
      title: '拨打客服电话',
      content: phoneNumber,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          uni.makePhoneCall({
            phoneNumber,
            fail: () => {
              // 拨打失败，复制到剪贴板
              copyToClipboard()
            },
          })
        }
      },
    })
  }
  else {
    copyToClipboard()
  }
}

function copyToClipboard() {
  uni.setClipboardData({
    data: phoneNumber,
    success: () => {
      uni.showToast({ title: '联系方式已复制', icon: 'success' })
    },
  })
}
</script>

<template>
  <view class="page-container">
    <view class="page-content">
      <view class="header-section">
        <image class="logo" src="@/static/logo.svg" mode="widthFix" />
        <text class="title mt-2 text-2xl">Ruoyi-Plus-Uni-Best</text>
        <text class="subtitle mt-2">{{ version }}</text>
      </view>

      <view class="content-section mt-3">
        <view class="menu-list">
          <view class="list-cell list-cell-arrow" @click="toUserAgreementPage">
            <view class="menu-item-box">
              <text>用户协议</text>
              <view class="text-right">
                <view class="i-carbon-chevron-right" />
              </view>
            </view>
          </view>
          <view class="list-cell list-cell-arrow" @click="toPrivacyPage">
            <view class="menu-item-box">
              <text>隐私政策</text>
              <view class="text-right">
                <view class="i-carbon-chevron-right" />
              </view>
            </view>
          </view>
          <view class="list-cell list-cell-arrow" @click="handleCall">
            <view class="menu-item-box">
              <text>联系我们</text>
              <view class="text-right">
                <text class="phone-text">{{ phoneNumber }}</text>
                <view class="i-carbon-chevron-right" />
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="copyright fixed-bottom-safe-area">
        <view>Copyright &copy; 2026 Ruoyi-Plus-Uni-Best</view>
        <view>All Rights Reserved.</view>
      </view>
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

    .phone-text {
      margin-right: 10rpx;
      color: #667eea;
    }

    .arrow {
      margin-left: 10rpx;
      color: #ccc;
    }
  }
}

.copyright {
  text-align: center;
  line-height: 40rpx;
  color: #999;
  font-size: 24rpx;
}
</style>
