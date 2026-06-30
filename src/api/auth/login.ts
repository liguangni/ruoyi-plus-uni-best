import type { IAuthLoginRes, IDoubleTokenRes, ILoginForm, IUserInfoRes } from '@/types/auth/login'
import { request } from '@/http/request'

export interface IAuthLoginResp {
  access_token?: string // 访问令牌
  expire_in?: number // 有效期(秒)
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export function login(loginForm: ILoginForm) {
  loginForm.clientId = loginForm.clientId || import.meta.env.VITE_APP_CLIENT_ID
  loginForm.grantType = loginForm.grantType || 'password'

  return request.post<IAuthLoginResp>({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true,
    },
    data: loginForm,
  })
}

/**
 * 获取验证码图片
 */
export function getCodeImg() {
  return request.get<any>({
    url: '/auth/code',
    headers: {
      isToken: false,
    },
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get<IUserInfoRes>({
    url: '/system/user/getInfo',
  })
}

/**
 * 刷新token
 * @param refreshToken 刷新token
 */
export function refreshToken(refreshToken: string) {
  return request.post<IDoubleTokenRes>({
    url: '/auth/refreshToken',
    data: { refreshToken },
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request.post<void>({
    url: '/auth/logout',
  })
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export function getWxCode() {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: res => resolve(res),
      fail: err => reject(new Error(err)),
    })
  })
}

/**
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
export function wxLogin(params: { code: string }) {
  return request.post<IAuthLoginRes>({
    url: '/auth/wxLogin',
    data: params,
  })
}
