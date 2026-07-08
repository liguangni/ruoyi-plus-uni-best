import type { CustomRequestOptions } from '@/http/types'
import { useTokenStore } from '@/store'
import { getEnvBaseUrl } from '@/utils'
import { stringifyQuery } from './tools/queryString'
import { getErrorMsg, showToastMsg } from '@/utils/common'
import { toLoginPage } from '@/utils/toLoginPage'
import { decrypt, decryptBase64, decryptWithAes, encrypt, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/api-encrypt'
import { ResultEnum } from './tools/enum'

// 请求基准地址
const baseUrl = getEnvBaseUrl()
const defaultTimeout = 60000
const encryptHeader = 'encrypt-key'
const clientId = import.meta.env.VITE_APP_CLIENT_ID
const appEncrypt = Boolean(import.meta.env.VITE_APP_ENCRYPT)

const httpInterceptor = {
  invoke(options: CustomRequestOptions) {
    // 显示加载中
    if (options?.custom?.showLoading === true) {
      uni.showLoading({
        title: '加载中...',
      })
    }
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = stringifyQuery(options.query)
      options.url += options.url.includes('?') ? `&${queryStr}` : `?${queryStr}`
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      if (JSON.parse(import.meta.env.VITE_APP_PROXY_ENABLE)) {
        options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
      }
      else {
        options.url = baseUrl + options.url
      }
      // #endif
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
    }
    options.header = { ...options.header }
    // 添加 token 请求头标识
    if (options?.custom?.isToken !== false) {
      const tokenStore = useTokenStore()
      const token = tokenStore.updateNowTime().validToken
      options.header.Authorization = `Bearer ${token}`
      options.header.clientId = clientId
    }
    // 处理加密接口请求数据
    if (appEncrypt && options?.custom?.isEncrypt === true) {
      if (options.method === 'POST' || options.method === 'PUT') {
        const aesKey = generateAesKey()
        options.header[encryptHeader] = encrypt(encryptBase64(aesKey))
        options.data = typeof options.data === 'object' ? encryptWithAes(JSON.stringify(options.data), aesKey) : encryptWithAes(options.data, aesKey)
      }
    }
    return options
  },
  success(args) {
    // 解密接口响应数据
    const keyStr = args.header?.[encryptHeader] || ''
    if (keyStr) {
      const aesKey = decryptBase64(decrypt(keyStr).toString())
      args.data = JSON.parse(decryptWithAes(args.data as string, aesKey))
    }
    // 业务码
    const responseData = typeof args.data === 'string' ? JSON.parse(args.data) : args.data
    const { code } = responseData || {}
    if (args.statusCode === ResultEnum.Unauthorized || code === ResultEnum.Unauthorized) {
      useTokenStore().logout().then(() => toLoginPage())
      return Promise.reject(new Error('无效的会话，或者会话已过期，请重新登录。'))
    }
    if (code !== ResultEnum.Success200) {
      const msg = responseData?.message || responseData?.msg || getErrorMsg(code)
      if (!args.config?.hideErrorToast)
        showToastMsg(msg)
      return Promise.reject(new Error(msg))
    }
  },
  fail(err) {
    console.log('interceptor-fail', err)
  },
  complete(res) {
    console.log('interceptor-complete', res)
    // 隐藏加载中
    if (res.config?.custom?.showLoading === true) {
      uni.hideLoading()
    }
  },
}

export const requestInterceptor = {
  install() {
    uni.addInterceptor('request', httpInterceptor)
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
