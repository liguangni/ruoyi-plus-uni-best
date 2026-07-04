<script lang="ts" setup>
import { tabbarList } from '@/tabbar/config'
import { isPageTabbar } from '@/tabbar/store'
// import { ensureDecodeURIComponent } from '@/utils'
import { getCodeImg } from '@/api/auth/login'
import { useTokenStore } from '@/store/token'
import { showToastMsg } from '@/utils/common'
import { parseUrlToObj } from '@/utils/index'

definePage({
  name: 'Login',
  style: {
    navigationBarTitleText: '登录',
    navigationStyle: 'custom',
  },
})

const tokenStore = useTokenStore()

const redirectUrl = ref('')
const codeUrl = ref('')
const captchaEnabled = ref(true)

onLoad((options) => {
  console.log('login options: ', options)
  // 李广妮: 由于redirectUrl可能会遇到各种各样的页面问题。这个地方暂时安装若依官方，跳转首页了
  // 如有需要，可自行修改
  // if (options.redirect) {
  //   redirectUrl.value = ensureDecodeURIComponent(options.redirect)
  // }
  // else {
  redirectUrl.value = tabbarList[0].pagePath
  // }
})

const loginForm = ref({
  username: 'admin',
  password: 'admin123',
  code: '',
  uuid: '',
})

async function handleLogin() {
  if (loginForm.value.username === '') {
    showToastMsg('请输入您的账号')
  }
  else if (loginForm.value.password === '') {
    showToastMsg('请输入您的密码')
  }
  else if (loginForm.value.code === '' && captchaEnabled.value) {
    showToastMsg('请输入验证码')
  }
  else {
    await pwdLogin()
  }
};

async function pwdLogin() {
  try {
    // 调用登录接口
    uni.showLoading({
      title: '登录中...',
    })
    await tokenStore.login(loginForm.value)
    loginSuccess()
  }
  catch (error) {
    if (captchaEnabled.value) {
      getCode()
    }
  }
  finally {
    uni.hideLoading()
  }
}

function loginSuccess() {
  uni.showToast({
    title: '登录成功',
    icon: 'success',
  })
  let path = redirectUrl.value
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  const { path: _path, query } = parseUrlToObj(path)

  if (isPageTabbar(_path)) {
    // 经过我的测试 switchTab 不能带 query 参数, 不管是放到 url  还是放到 query ,
    // 最后跳转过去的时候都会丢失 query 信息
    uni.switchTab({
      url: path,
    })
  }
  else {
    // 自己决定是 redirectTo 还是 navigateBack
    uni.redirectTo({
      url: path,
    })
    // uni.navigateBack()
  }
}

// 获取图形验证码
function getCode() {
  loginForm.value.code = ''
  getCodeImg().then((res) => {
    console.log('getCode res====>', res)
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    //  captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = `data:image/gif;base64,${res.img}`
      loginForm.value.uuid = res.uuid
    }
  })
};

const showPassword = ref(false)
function changePassword() {
  showPassword.value = !showPassword.value
}

onLoad(() => {
  getCode()
})
</script>

<template>
  <view class="normal-login-container">
    <view class="title">
      <view>您好，欢迎登录！</view>
    </view>
    <view class="login-form-content">
      <view class="wy-form">
        <view name="username" class="wy-form-item">
          <view class="pre-icon i-carbon-user text-coolgray" />
          <input v-model="loginForm.username" class="form-input uni-input" placeholder="请输入账号">
          <view v-show="loginForm.username" class="pre-icon i-carbon-close text-coolgray" @click="loginForm.username = ''" />
        </view>
        <view name="password" class="wy-form-item">
          <view class="pre-icon i-carbon-password text-coolgray" />
          <input v-model="loginForm.password" :password="!showPassword" class="form-input uni-input" placeholder="请输入密码">
          <text v-show="loginForm.password" class="pre-icon uni-icon text-coolgray" :class="[showPassword ? 'i-carbon-view' : 'i-carbon-view-off']" @click="changePassword" />
        </view>
        <view class="flex gap-3">
          <view name="code" class="wy-form-item">
            <view class="pre-icon i-carbon-security text-coolgray" />
            <input v-model="loginForm.code" class="form-input uni-input" placeholder="请输入验证码">
          </view>
          <image :src="codeUrl" style="width: 280rpx; height: 70rpx;" @click="getCode" />
        </view>
      </view>
    </view>
    <view class="login-button">
      <view @click="handleLogin">
        登录
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-form-content {
  text-align: center;
  margin: 20px auto;
  margin-top: 15%;
  width: 80%;
  background-color: #ffffff;

  .wy-form {
    .wy-form-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 48rpx;
      border-radius: 9999px;
      padding: 0 28rpx;
      background-color: #f5f6f7;
      height: 80rpx;

      .form-input {
        width: 100%;
        height: 80rpx;
        text-align: left;
        line-height: 80rpx;
        padding: 0 20rpx;
        background: none;
      }
      // picker {
      //   width: 100%;
      //   padding: 0 20rpx;
      //   text-align: left;
      // }
      .form-picker-container {
        width: 100%;
        height: 80rpx;
        text-align: left;
        line-height: 80rpx;
        padding: 0 20rpx;
        background: none;
      }

      .pre-icon {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}

.normal-login-container {
  width: 100%;
  background-color: #ffffff;
  min-height: 100vh;

  .title {
    padding-top: 400rpx;
    background: url('/static/images/loginBg.png') no-repeat bottom center;
    background-size: 100%;

    view {
      padding-left: 64rpx;
      font-size: 44rpx;
      font-weight: 700;
      line-height: 1;
    }
  }

  .login-button {
    margin: 20px auto;
    margin-top: 15%;
    width: 80%;

    view {
      line-height: 96rpx;
      border-radius: 48rpx;
      text-align: center;
      font-size: 32rpx;
      background: linear-gradient(90deg, rgba(255, 222, 102, 1) 0%, rgba(202, 245, 253, 1) 100%);
    }
  }
}
</style>
