<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { LOGIN_PAGE } from '@/router/config'
import { useUserStore } from '@/store'
import { useTokenStore } from '@/store/token'

definePage({
  style: {
    navigationBarTitleText: '我的',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()
// 使用storeToRefs解构userInfo
const { userInfo } = storeToRefs(userStore)
const userHasLogin = ref(tokenStore.updateNowTime().hasLogin)

// 微信小程序下登录
async function handleLogin() {
  // #ifdef MP-WEIXIN
  // 微信登录
  await tokenStore.wxLogin()

  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({
    url: `${LOGIN_PAGE}`,
  })
  // #endif
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清空用户信息
        useTokenStore().logout()
        // 执行退出登录逻辑
        uni.showToast({
          title: '退出登录成功',
          icon: 'success',
        })
        // #ifdef MP-WEIXIN
        // 微信小程序，去首页
        // uni.reLaunch({ url: '/pages/index/index' })
        // #endif
        // #ifndef MP-WEIXIN
        // 非微信小程序，去登录页
        // uni.navigateTo({ url: LOGIN_PAGE })
        // #endif
      }
    },
  })
}

function handleToInfo() {
  uni.navigateTo({
    url: '/pages-core/profile/info',
  })
};
function toSettingPage() {
  uni.navigateTo({
    url: '/pages-core/setting/setting',
  })
}
function toHelpPage() {
  uni.navigateTo({
    url: '/pages-core/help/help',
  })
}
function toAboutPage() {
  uni.navigateTo({
    url: '/pages-core/about/about',
  })
}
</script>

<template>
  <view class="page-container pc-tabbar bg-light">
    <view class="page-content">
      <view class="profile-container">
        <!-- 用户信息区域 -->
        <view class="bg">
          <view class="bg-radius" />
          <view class="user-info-container">
            <Avatar class="avatar-img" width="140rpx" height="140rpx" round />
            <text class="uer-name">{{ userInfo.user.nickName }}</text>
          </view>
          <view class="header-bottom position-relative center">
            <view v-if="!userHasLogin">
              <view class="login-btn" @click="handleLogin">
                立即登录
              </view>
            </view>
            <view v-else class="logo-title">
              <view class="count">
                <view class="count-item">
                  <text class="count-item-num">0</text>
                  <text class="count-item-text">消息通知</text>
                </view>
                <view class="count-item">
                  <text class="count-item-num">0</text>
                  <text class="count-item-text">我的审批</text>
                </view>
                <view class="count-item">
                  <text class="count-item-num">0</text>
                  <text class="count-item-text">消息通知</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="content-section bg-light">
          <view class="center-nav">
            <view class="center-nav-title">
              <text>常用服务</text>
            </view>
            <view class="center-nav-content">
              <view class="center-nav-item">
                <view class="center-nav-item-icon i-carbon-group text-pink" />
                <text class="center-nav-item-text">交流群</text>
              </view>
              <view class="center-nav-item">
                <text class="center-nav-item-icon i-carbon-headset text-blue" />
                <text class="center-nav-item-text">在线客服</text>
              </view>
              <view class="center-nav-item">
                <text class="center-nav-item-icon i-carbon-chat-bot text-yellow" />
                <text class="center-nav-item-text">反馈社区</text>
              </view>
              <view class="center-nav-item">
                <text class="center-nav-item-icon i-carbon-thumbs-up text-green" />
                <text class="center-nav-item-text">点赞我们</text>
              </view>
            </view>
          </view>

          <view class="wy-cell-list-group">
            <view class="wy-cell-list-item border-bottom" @click="handleToInfo">
              <view class="list-icon color-5 i-carbon-identification" />
              <text class="list-text">个人信息</text>
              <view class="list-arrow i-carbon-chevron-right" />
            </view>
            <view class="wy-cell-list-item border-bottom" @click="toSettingPage">
              <view class="list-icon color-2 i-carbon-settings" />
              <text class="list-text">应用设置</text>
              <view class="list-arrow i-carbon-chevron-right" />
            </view>
          </view>
          <view class="wy-cell-list-group">
            <view class="wy-cell-list-item border-bottom" @click="toHelpPage">
              <view class="list-icon color-3 i-carbon-help" />
              <text class="list-text">帮助中心</text>
              <view class="list-arrow i-carbon-chevron-right" />
            </view>
            <view class="wy-cell-list-item">
              <text class="list-icon color-4 i-carbon-user-feedback" />
              <text class="list-text">问题反馈</text>
              <view class="list-arrow i-carbon-chevron-right" />
            </view>
          </view>

          <view class="wy-cell-list-group">
            <view class="wy-cell-list-item" @click="toAboutPage">
              <view class="list-icon color-1 i-carbon-favorite" />
              <text class="list-text">关于应用</text>
              <view class="list-arrow i-carbon-chevron-right" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
$main-color: #333;
$border-color: #efefef;
$color-1: #09a137; // success green (used for setting icon)
$color-2: #4cd964; // message
$color-3: #f0ad4e; // help
$color-4: #dd524d; // terms
$color-5: #007aff; // user

$list-item-height: 100rpx;
$list-margin: 20rpx;

.profile-container {
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

.bg {
  width: 100%;
  height: 435rpx;
  position: relative;
  background: linear-gradient(0deg, rgba(255, 222, 102, 1) 0%, rgba(202, 245, 253, 1) 100%);

  .bg-radius {
    background-color: #fff;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
    width: 120vw;
    height: 550rpx;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 150rpx;
  }

  .user-info-container {
    padding-top: 70rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 10;

    .avatar-img {
      border: solid 6rpx #fff;
      background-color: #f5f5f5;
    }
    .uer-name {
      height: 60rpx;
      line-height: 60rpx;
      font-size: 34rpx;
      color: $main-color;
    }
  }

  .header-bottom {
    height: 160rpx;
    z-index: 20;

    .logo-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      z-index: 99;

      .count {
        display: flex;
        width: 100%;

        .count-item {
          flex: 1;
          text-align: center;
          display: flex;
          flex-direction: column;

          .count-item-num {
            color: $main-color;
            font-size: 36rpx;
            font-weight: 500;
          }

          .count-item-text {
            color: $main-color;
            font-size: 28rpx;
            margin-top: 10rpx;
          }
        }
      }
    }
  }

  .login-btn {
    width: 300rpx;
    height: 70rpx;
    line-height: 70rpx;
    background-color: #22c55e;
    color: white;
    text-align: center;
    border-radius: 20rpx;
  }
}

.content-section {
  position: relative;
  z-index: 300;
  padding: 20rpx 0;
}

.center-nav {
  background-color: #ffffff;
  margin: 0 auto $list-margin;
  width: 100%;
  border-radius: 0;

  .center-nav-title {
    padding: 25rpx 30rpx;
    font-size: 28rpx;
    color: $main-color;
    border-bottom: 1rpx solid $border-color;
  }

  .center-nav-content {
    height: 150rpx;
    display: flex;
    align-items: center;

    .center-nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      text-align: center;

      .center-nav-item-icon {
        font-size: 40rpx;
        font-weight: 500;
        font-family: texticons;
        margin: 0 auto;
      }

      .center-nav-item-text {
        color: #666;
        font-size: 26rpx;
        margin-top: 15rpx;
      }
    }
  }
}
</style>
