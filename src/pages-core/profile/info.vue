<template>
  <view class="container">
    <!-- <full-loading :loading="loading" text="加载中..." /> -->
    <view class="custom-list">
      <view class="custom-list-item avatar-item">
        <view class="my-4 center">
          <view class="avatar-wrapper" @click="toAvatarPage">
            <Avatar :src="userProfile.user.avatarUrl" width="180rpx" height="180rpx" round />
          </view>
        </view>
      </view>
      <view class="custom-list-item">
        <view class="item-label">
          昵称
        </view>
        <view class="item-value">
          {{ userProfile.user.nickName }}
        </view>
      </view>
      <view class="custom-list-item">
        <view class="item-label">
          手机号码
        </view>
        <view class="item-value">
          {{ userProfile.user.phoneNumber }}
        </view>
      </view>
      <view class="custom-list-item">
        <view class="item-label">
          邮箱
        </view>
        <view class="item-value">
          {{ userProfile.user.email }}
        </view>
      </view>
      <view class="custom-list-item">
        <view class="item-label">
          部门
        </view>
        <view class="item-value">
          {{ userProfile.user.deptName }}
        </view>
      </view>
      <view class="custom-list-item">
        <view class="item-label">
          岗位
        </view>
        <view class="item-value">
          {{ userProfile.postGroup }}
        </view>
      </view>
      <view class="custom-list-item">
        <view class="item-label">
          角色
        </view>
        <view class="item-value">
          {{ userProfile.roleGroup }}
        </view>
      </view>
    </view>

    <view class="center" style="width: 50%; margin: 40rpx auto;">
      <button class="custom-button" @click="handleToEditInfo">
        修改个人信息
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { IUserInfo, UserProfile } from '@/api/system/types/user'
import { getUserProfile } from '@/api/system/user'
import DEFAULT_AVATAR from '@/static/images/avatar.png'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

definePage({
  style: {
    navigationBarTitleText: '个人信息',
  },
})

const loading = ref <boolean>(true)

const userProfile = ref<UserProfile>({
  user: {} as IUserInfo,
  roleGroup: '',
  postGroup: '',
})

onLoad((options) => {
  getUserInfo()
  // 监听事件
  uni.$on('refreshUserInfo', () => {
    getUserInfo()
  })
})

onUnload(() => {
  uni.$off('refreshUserInfo')
})

// 获取用户信息
function getUserInfo() {
  uni.showLoading({
    title: '加载中...',
  })
  getUserProfile().then((data) => {
    userProfile.value = data
    if (!userProfile.value.user.avatarUrl)
      userProfile.value.user.avatarUrl = DEFAULT_AVATAR
    // 获取现有store中的用户信息，更新user部分后重新设置，保留roles和permissions
    userStore.setUserInfo({
      ...userStore.userInfo,
      user: userProfile.value.user,
    })
  }).finally(() => {
    loading.value = false
    uni.hideLoading()
  })
};

function handleToEditInfo() {
  uni.navigateTo({
    url: '/pages-core/profile/edit',
  })
};

function toAvatarPage() {
  uni.navigateTo({
    url: '/pages-core/profile/avatar',
  })
}
</script>

<style lang="scss" scoped>
.container {
}

.custom-list {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  &-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.avatar-item {
      justify-content: center;
    }

    .avatar-wrapper {
      width: 180rpx;
      height: 180rpx;
      overflow: hidden;
      border-radius: 50%;
      background-color: #f0f0f0;
      border: 2rpx solid #e0e0e0;
      cursor: pointer;
    }

    .avatar-button {
      width: 180rpx;
      height: 180rpx;
      padding: 0;
      overflow: hidden;
      border-radius: 50%;
      background-color: #f0f0f0;
      border: 2rpx solid #e0e0e0;
    }

    .item-label {
      flex: 0 0 200rpx;
      font-size: 26rpx;
      color: #666;
    }

    .item-value {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      text-align: right;
    }
  }
}

.custom-button {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #409eff;
  color: #fff;
  font-size: 26rpx;
  border-radius: 40rpx;
  border: none;
}
</style>
