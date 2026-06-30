<template>
  <view class="container">
    <!-- <full-loading :loading="loading" text="加载中..." /> -->
    <view class="custom-list">
      <view class="custom-list-item avatar-item">
        <view class="my-4 center">
          <!-- #ifdef MP-WEIXIN -->
          <!--

          <button v-if="false" class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image :src="userStore.userInfo.avatar" mode="aspectFill" class="h-full w-full" />
          </button>
          -->
          <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
            <image :src="userStore.userInfo.user.avatar" mode="aspectFill" class="h-full w-full" />
          </button>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view class="avatar-wrapper" @click="toAvatarPage">
            <image :src="userStore.userInfo.user.avatar" mode="aspectFill" class="h-full w-full" />
          </view>
          <!-- #endif -->
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
import type { UserInfo, UserProfile } from '@/types/system/user'
import UserApi from '@/api/system/user'
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
  user: {} as UserInfo,
  roleGroup: '',
  postGroup: '',
})

onLoad((options) => {
  getUserInfo()
})

// 获取用户信息
function getUserInfo() {
  UserApi.getUserProfile().then((data) => {
    userProfile.value = data
    if (!userProfile.value.user.avatar)
      userProfile.value.user.avatar = DEFAULT_AVATAR
    userStore.setUserAvatar(userProfile.value.user.avatar)
  }).finally(() => {
    loading.value = false
  })
};

function handleToEditInfo() {
  uni.navigateTo({
    url: '/pages-core/profile/edit',
  })
};

// #ifndef MP-WEIXIN
// 上传头像
function toAvatarPage() {
  console.log('toAvatarPage')
  uni.navigateTo({
    url: '/pages-core/profile/avatar',
  })
}
// #endif

// #ifdef MP-WEIXIN
// 微信小程序下选择头像事件
function onChooseAvatar(e: any) {
  console.log('选择头像', e.detail)
  // const { avatarUrl } = e.detail
  // const { run } = useUpload<IUploadSuccessInfo>(
  //   '/system/user/profile/avatar',
  //   {},
  //   {
  //     onSuccess: (res) => {
  //       console.log('wx头像上传成功', res)
  //       userStore.setUserAvatar(res.url)
  //       // 更新本地用户头像
  //       userProfile.value.user.avatar = res.url
  //     },
  //   },
  //   avatarUrl,
  // )
  // run()

  uni.navigateTo({
    url: '/pages-core/profile/avatar',
  })
}
// #endif
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
