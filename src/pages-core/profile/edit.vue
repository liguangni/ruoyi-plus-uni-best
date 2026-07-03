<template>
  <view class="container">
    <view class="form-container">
      <view class="form-item">
        <view class="form-label">
          昵称
        </view>
        <view class="form-control">
          <input v-model="userProfile.nickName" type="text" placeholder="请输入昵称" :maxlength="20" class="input">
        </view>
      </view>
      <view class="form-item">
        <view class="form-label">
          手机号
        </view>
        <view class="form-control">
          <input v-model="userProfile.phoneNumber" type="tel" placeholder="请输入手机号" :maxlength="11" class="input">
        </view>
      </view>
      <view class="form-item">
        <view class="form-label">
          邮箱
        </view>
        <view class="form-control">
          <input v-model="userProfile.email" placeholder="请输入邮箱" :maxlength="50" class="input">
        </view>
      </view>
      <view class="form-item">
        <view class="form-label">
          性别
        </view>
        <view class="form-control">
          <radio-group class="gender-radio-group" @change="handleGenderChange">
            <label v-for="item in genderColumns" :key="item.value" class="radio-item">
              <radio :value="item.value" :checked="userProfile.gender === item.value" color="#2979ff" />
              <text class="radio-text">{{ item.label }}</text>
            </label>
          </radio-group>
        </view>
      </view>
    </view>
    <view class="submit-container">
      <button class="submit-button" @click="handleSubmit">
        提交
      </button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { getUserProfile, updateUserProfile } from '@/api/system/user'
import { showToastMsg } from '@/utils/common'
import type { UserProfileForm } from '@/api/system/types/user'

definePage({
  style: {
    navigationBarTitleText: '资料编辑',
  },
})

const genderColumns = ref([{ label: '男', value: '0' }, { label: '女', value: '1' }])

const userProfile = ref<UserProfileForm>({
  nickName: '',
  phoneNumber: '',
  email: '',
  gender: '',
})

onLoad((options) => {
  getUserData()
})

function getUserData() {
  getUserProfile().then((data) => {
    const userData = data.user
    userProfile.value.nickName = userData.nickName || ''
    userProfile.value.phoneNumber = userData.phoneNumber || ''
    userProfile.value.email = userData.email || ''
    userProfile.value.gender = userData.gender.trim()
  })
}

// 提交表单
function handleSubmit() {
  if (validateForm()) {
    updateUserProfile(userProfile.value).then(() => {
      showToastMsg('修改成功')
      // 触发刷新用户信息事件
      uni.$emit('refreshUserInfo')
      // 返回上一个页面（info页面）
      uni.navigateBack()
    })
  }
}

// 表单验证函数
function validateForm() {
  // 昵称非空校验
  if (!userProfile.value.nickName.trim()) {
    showToastMsg('昵称不能为空')
    return false
  }

  // 手机号非空校验
  if (!userProfile.value.phoneNumber.trim()) {
    showToastMsg('手机号不能为空')
    return false
  }
  else {
    // 简单的手机号格式校验
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(userProfile.value.phoneNumber)) {
      showToastMsg('请输入正确的手机号格式')
      return false
    }
  }

  // 邮箱非空校验
  if (!userProfile.value.email.trim()) {
    showToastMsg('邮箱不能为空')
    return false
  }
  else {
    // 简单的邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    if (!emailRegex.test(userProfile.value.email)) {
      showToastMsg('请输入正确的邮箱格式')
      return false
    }
  }

  // 性别非空校验
  if (!userProfile.value.gender) {
    showToastMsg('请选择性别')
    return false
  }

  return true
}

// 性别选择变化事件处理
function handleGenderChange(e) {
  userProfile.value.gender = e.detail.value
}
</script>

<style lang="scss" scoped>
.container {
  /* 移除了padding、底色和高度样式 */
}

.form-container {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 16rpx;
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.05);

  .form-item {
    display: flex;
    margin-bottom: 36rpx; /* 增加表单项之间的间距 */
    align-items: center; /* 垂直居中对齐 */

    .form-label {
      width: 120rpx;
      font-size: 26rpx;
      color: #333;
      padding-right: 16rpx;
      display: flex;
      align-items: center;
      font-weight: 500;

      .required-mark {
        color: #ff4d4f;
        margin-left: 4rpx;
      }
    }

    .form-control {
      flex: 1;
      min-width: 0; /* 确保flex子元素能正确收缩 */

      .input {
        width: 100%;
        height: 68rpx;
        border: 1rpx solid #d9d9d9;
        border-radius: 6rpx;
        padding: 0 16rpx;
        font-size: 26rpx;
        background-color: #fff;
        box-sizing: border-box;
        transition: border-color 0.3s;

        &:focus {
          outline: none;
          border-color: #409eff;
        }

        &::placeholder {
          color: #bfbfbf;
          font-size: 24rpx;
        }
      }

      .radio-group {
        display: flex;
        align-items: center;
        width: 100%;
      }

      /* 性别单选组专用样式 */
      .gender-radio-group {
        display: flex;
        align-items: center;
        width: 100%;
        flex-wrap: nowrap; /* 强制不换行 */

        .radio-item {
          display: flex;
          align-items: center;
          margin-right: 36rpx; /* 减少间距 */
          white-space: nowrap;
          flex-shrink: 0; /* 防止项目收缩 */

          .radio {
            margin-right: 8rpx;
            transform: scale(0.75); /* 调整到与文字大小匹配 */
          }

          /* 针对uni-app的radio组件内部元素进行样式调整 */
          radio {
            transform: scale(0.75) !important;
          }

          /* 确保在H5端也能正常显示 */
          /* #ifdef H5 */
          uni-radio {
            transform: scale(0.75) !important;
          }
          /* #endif */

          .radio-text {
            font-size: 26rpx;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

.radio-label {
  font-size: 26rpx;
}

.submit-container {
  padding: 16rpx;
  margin-top: 32rpx;

  .submit-button {
    width: 50%;
    height: 76rpx;
    background-color: #409eff;
    color: #fff;
    font-size: 28rpx;
    border: none;
    border-radius: 38rpx;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #66b1ff;
    }

    &:active {
      background-color: #3a8ee6;
    }
  }
}
</style>
