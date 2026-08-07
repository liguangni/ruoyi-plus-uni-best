<template>
  <view class="pwd-retrieve-container">
    <view class="uni-common-mt">
      <!-- 旧密码 -->
      <view class="uni-form-item uni-column">
        <view class="title">
          <text class="uni-form-item__title">旧密码</text>
        </view>
        <view class="uni-input-wrapper">
          <input v-model="formData.oldPassword" class="uni-input" placeholder="请输入旧密码" :password="!showOldPassword">
          <text v-if="formData.oldPassword" class="uni-icon" :class="[!showOldPassword ? 'i-carbon-view' : 'i-carbon-view-off']" @click="changeOldPassword" />
        </view>
      </view>

      <!-- 新密码 -->
      <view class="uni-form-item uni-column">
        <view class="title">
          <text class="uni-form-item__title">新密码</text>
        </view>
        <view class="uni-input-wrapper">
          <input v-model="formData.newPassword" class="uni-input" placeholder="请输入新密码" :password="!showNewPassword">
          <view v-if="formData.newPassword" class="uni-icon qqq" :class="[!showNewPassword ? 'i-carbon-view' : 'i-carbon-view-off']" @click="changeNewPassword" />
        </view>
      </view>

      <!-- 确认密码 -->
      <view class="uni-form-item uni-column">
        <view class="title">
          <text class="uni-form-item__title">密码确认</text>
        </view>
        <view class="uni-input-wrapper">
          <input v-model="formData.confirmPassword" class="uni-input" placeholder="请再次输入新的密码" :password="!showConfirmPassword">
          <text v-if="formData.confirmPassword" class="uni-icon" :class="[!showConfirmPassword ? 'i-carbon-view' : 'i-carbon-view-off']" @click="changeConfirmPassword" />
        </view>
      </view>

      <view class="footer m-5 mt-5">
        <button class="submit-button" @click="handleSubmit">
          提交
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { updateUserPwd } from '@/api/system/user'
import { showToastMsg } from '@/utils/common'

definePage({
  style: {
    navigationBarTitleText: '修改密码',
  },
})

// 密码显示/隐藏状态
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

function changeOldPassword() {
  showOldPassword.value = !showOldPassword.value
}

function changeNewPassword() {
  showNewPassword.value = !showNewPassword.value
}

function changeConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value
}

const formData = reactive<{
  oldPassword: string
  newPassword: string
  confirmPassword: string
}>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 表单验证函数
function validateForm() {
  // 验证旧密码
  if (!formData.oldPassword) {
    showToastMsg('旧密码不能为空')
    return false
  }

  // 验证新密码
  if (!formData.newPassword) {
    showToastMsg('新密码不能为空')
    return false
  }

  if (formData.newPassword.length < 6 || formData.newPassword.length > 20) {
    showToastMsg('新密码长度在6到20个字符之间')
    return false
  }

  // 验证确认密码
  if (!formData.confirmPassword) {
    showToastMsg('确认密码不能为空')
    return false
  }

  if (formData.newPassword !== formData.confirmPassword) {
    showToastMsg('两次输入的密码不一致')
    return false
  }

  return true
}

function handleSubmit() {
  if (validateForm()) {
    updateUserPwd(formData.oldPassword, formData.newPassword).then(() => {
      uni.showToast({
        title: '修改成功',
        mask: false,
        duration: 1000,
      })
      uni.navigateBack()
    })
  }
}
</script>

<style lang="scss">
.pwd-retrieve-container {
  padding: 20rpx;
  min-height: 100vh;

  .uni-common-mt {
    background-color: #fff;
    border-radius: 8rpx;
    padding: 20rpx;

    .uni-form-item {
      margin-bottom: 20rpx;

      .title {
        padding: 0 0 10rpx 0;
        box-sizing: border-box;
        width: 100%;

        .uni-form-item__title {
          font-size: 16px;
          line-height: 24px;
        }
      }

      > .uni-input-wrapper {
        border: 1px solid #ddd;
        border-radius: 4rpx;
        padding: 0 15rpx;
      }

      .uni-input-wrapper {
        /* #ifndef APP-NVUE */
        display: flex;
        /* #endif */
        flex-direction: row;
        flex-wrap: nowrap;
        background-color: #ffffff;
        width: 100%;
        box-sizing: border-box;
        align-items: center;
        gap: 15rpx;

        .uni-input {
          height: 70rpx;
          line-height: 70rpx;
          font-size: 14px;
          padding: 0;
          flex: 1;
          background-color: #ffffff;
          box-sizing: border-box;
          border: none;
          border-radius: 0;
        }

        .uni-icon {
          font-family: uniicons;
          font-size: 44rpx;
          font-weight: normal;
          font-style: normal;
          width: 44rpx;
          height: 44rpx;
          line-height: 44rpx;
          color: #999999;
          cursor: pointer;
          z-index: 1000;
        }
      }
    }

    .submit-button {
      width: 60%;
      height: 80rpx;
      background-color: #007aff;
      color: #fff;
      border: none;
      border-radius: 8rpx;
      font-size: 32rpx;
      margin-top: 40rpx;
    }
  }
}

.uni-eye-active {
  color: #007aff;
}

.uni-input-input {
  & ::-ms-reveal {
    display: none;
  }

  & ::-ms-clear {
    display: none;
  }
}
</style>
