<script setup lang="ts">
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { getMenuGroups, getQuickEntrances } from './work'
import { useUserStore } from '@/store/user'
import type { MenuGroupChildItem, QuickEntranceItem } from './work'

definePage({
  style: {
    navigationBarTitleText: '工作台',
    enablePullDownRefresh: true,
  },
})

const userStore = useUserStore()
const quickEntrances = getQuickEntrances()
const menuGroups = ref(getMenuGroups())
const expandedGroups = reactive<Record<string, boolean>>({})
const maxMenuItems = 8
const menuLoading = ref(false)

function loadMenuGroups() {
  menuGroups.value = getMenuGroups()
  menuGroups.value.forEach((group) => {
    if (expandedGroups[group.key] === undefined) {
      expandedGroups[group.key] = false
    }
  })
}

loadMenuGroups()

onPullDownRefresh(() => {
  menuLoading.value = true
  setTimeout(() => {
    loadMenuGroups()
    menuLoading.value = false
    uni.stopPullDownRefresh()
  }, 800)
})

function toggleGroup(groupKey: string) {
  expandedGroups[groupKey] = !expandedGroups[groupKey]
}

function handleMenuClick(item: MenuGroupChildItem) {
  if (item.path) {
    uni.navigateTo({ url: item.path })
  }
  else {
    uni.showToast({ title: '模块建设中~', icon: 'none' })
  }
}

function handleQuickClick(item: QuickEntranceItem) {
  if (item.path) {
    uni.navigateTo({ url: item.path })
  }
  else {
    uni.showToast({ title: '模块建设中~', icon: 'none' })
  }
}

function getDisplayItems(groupKey: string, children: any[]) {
  if (expandedGroups[groupKey]) {
    return children
  }
  return children.slice(0, maxMenuItems)
}
</script>

<template>
  <view class="page-container pc-tabbar bg-light">
    <view class="page-content">
      <view class="page-top">
        <view class="m-2 h-auto p-1">
          <view class="swiper-container">
            <swiper class="swiper" circular :indicator-dots="false" :autoplay="true" :interval="4000" :duration="500">
              <swiper-item>
                <view class="banner">
                  <image src="@/static/work/work.png" mode="widthFix" />
                </view>
              </swiper-item>
              <swiper-item>
                <view class="banner">
                  <image src="@/static/work/work.png" mode="widthFix" />
                </view>
              </swiper-item>
              <swiper-item>
                <view class="banner">
                  <image src="@/static/work/work.png" mode="widthFix" />
                </view>
              </swiper-item>
            </swiper>
          </view>
        </view>
        <view class="quick-entrances px-4">
          <view
            v-for="item in quickEntrances"
            :key="item.name"
            class="entrance-card"
            @click="handleQuickClick(item)"
          >
            <view class="entrance-icon">
              <view :class="[item.icon]" :style="{ color: item.iconColor }" />
            </view>
            <view class="entrance-info">
              <text class="entrance-name">{{ item.name }}</text>
              <text class="entrance-subtitle">{{ item.subtitle }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="menu-section p-4">
        <view v-if="menuLoading" class="menu-loading">
          <view class="loading-spinner" />
          <text class="loading-text">加载中...</text>
        </view>
        <view
          v-for="group in menuGroups"
          v-show="!menuLoading"
          :key="group.key"
          class="menu-group"
        >
          <view class="group-header" @click="toggleGroup(group.key)">
            <text class="group-title">{{ group.name }}</text>
            <view v-if="group.children.length > maxMenuItems" class="expand-arrow" :class="{ rotated: expandedGroups[group.key] }">
              <view class="i-carbon-chevron-right text-gray-500" />
            </view>
          </view>
          <view class="group-content">
            <view class="menu-grid">
              <view
                v-for="item in getDisplayItems(group.key, group.children)"
                :key="item.key"
                class="menu-item"
                @click="handleMenuClick(item)"
              >
                <view class="menu-icon" :style="{ 'background-image': item.iconBg }">
                  <view class="text-white" :class="[item.icon] " />
                </view>
                <text class="menu-name">{{ item.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
$head-color: #5b8cff;
$white-color: #fff;
$radius: 5rpx;
$border-color: #efefef;
$color-1: #6eacfe;
$color-2: #52f0cf;
$color-3: #ffcd46;
$color-4: #ff727d;
$list-item-height: 100rpx;
$list-margin: 15rpx;
$bg-color: #f5f7fa;
$card-bg: #ffffff;
$text-primary: #333333;
$text-secondary: #666666;
$text-light: #999999;

.work-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: calc(50px + env(safe-area-inset-bottom));
}

.page-top {
  background-image: linear-gradient($head-color, #4194fc);
  // min-height: 400rpx;
  padding-bottom: 80rpx;
  margin-bottom: 80rpx;
  border-bottom-left-radius: 20%;
  border-bottom-right-radius: 20%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;

  .user-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: calc(10px + env(safe-area-inset-top));
    padding-left: 40rpx;

    .user-avatar {
      border: 3rpx solid rgba(255, 255, 255, 0.3);
    }

    .nickname {
      font-size: 30rpx;
      color: #fff;
      font-weight: 500;
    }
  }

  .banner {
    width: 100%;
    height: 270rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-left: 0;
    margin-top: 10rpx;

    image {
      width: calc(100vw - 80rpx);
      margin: 0 auto;
      height: 270rpx;
      border-radius: 20rpx;
    }
  }

  .swiper {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
.quick-entrances {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  gap: 24rpx;
  transform: translateY(50%);
  height: 150rpx;
}

.entrance-card {
  flex: 1;
  background-color: $card-bg;
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  height: 144rpx;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.entrance-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.entrance-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.entrance-name {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.entrance-subtitle {
  font-size: 24rpx;
  color: $text-light;
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  // margin-top: 130rpx;
}

.menu-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 60rpx 0;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #e0e0e0;
    border-top-color: $head-color;
    border-radius: 50%;
    animation: menu-spin 0.8s linear infinite;
  }

  .loading-text {
    font-size: 26rpx;
    color: $text-light;
  }
}

@keyframes menu-spin {
  to {
    transform: rotate(360deg);
  }
}

.menu-group {
  background-color: $card-bg;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.group-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.expand-arrow {
  transition: transform 0.3s ease;

  &.rotated {
    transform: rotate(90deg);
  }

  .i-carbon-chevron-right {
    font-size: 28rpx;
  }
}

.group-content {
  padding: 0 20rpx 20rpx;
}

.menu-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 0;
}

.menu-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
}

.menu-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  .i-carbon {
    font-size: 36rpx;
  }
}

.menu-name {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
