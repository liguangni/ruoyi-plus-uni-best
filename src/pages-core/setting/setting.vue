<template>
  <view class="page">
    <view class="content-section">
      <view class="wy-cell-list-group">
        <view class="wy-cell-list-item border-bottom" @click="handleToPwd">
          <text class="list-icon color-5 i-carbon-unlocked" />
          <text class="list-text">修改密码</text>
          <view class="list-arrow i-carbon-chevron-right" />
        </view>
        <view class="wy-cell-list-item border-bottom" @click="handleToUpgrade">
          <text class="list-icon color-2 i-carbon-update-now" />
          <text class="list-text">检查更新</text>
          <view class="list-arrow i-carbon-chevron-right" />
        </view>
        <view class="wy-cell-list-item" @click="handleCleanTmp">
          <text class="list-icon color-4 i-carbon-trash-can" />
          <text class="list-text">清理缓存</text>
          <view class="list-arrow i-carbon-chevron-right" />
        </view>
      </view>
    </view>
    <view class="mt-6 center">
      <button class="logout-button" type="warn" @click="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useTokenStore } from '@/store/token'
import { showToastMsg } from '@/utils/common'
import { toLoginPage } from '@/utils/toLoginPage'

definePage({
  style: {
    navigationBarTitleText: '应用设置',
  },
})

// 编辑资料
function handleToEdit() {
  uni.redirectTo({
    url: '/pages-core/profile/edit',
  })
}

// 修改密码
function handleToPwd() {
  uni.navigateTo({
    url: '/pages-core/profile/pwd',
  })
};

function handleToUpgrade() {
  uni.showToast({
    title: '模块建设中~',
    mask: false,
    icon: 'none',
    duration: 1000,
  })
};

function handleCleanTmp() {
  uni.showToast({
    title: '模块建设中~',
    mask: false,
    icon: 'none',
    duration: 1000,
  })
};
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        // 清空用户信息
        await useTokenStore().logout()
        // 执行退出登录逻辑
        showToastMsg('退出登录成功')
        toLoginPage()
      }
    },
  })
}
</script>

<style lang="scss" scoped>
:deep(uni-page-wrapper) {
  background-color: #efefef;
}
.content-section {
  // padding: 30rpx 0;
}

.logout-button {
  width: 60%;
  height: 80rpx;
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
}
</style>
