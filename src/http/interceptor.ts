import type { CustomRequestOptions } from '@/http/types'
import { useTokenStore } from '@/store'
import { getEnvBaseUrl } from '@/utils'
import { stringifyQuery } from './tools/queryString'

// 请求基准地址
const baseUrl = getEnvBaseUrl()
const clientId = import.meta.env.VITE_APP_CLIENT_ID

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
    return options
  },
  success(args) {
    // 隐藏加载中
    if (args.config?.custom?.showLoading === true) {
      uni.hideLoading()
    }
  },
  fail(err) {
    console.log('响应拦截器---->fail', err)
    uni.showToast({
      title: '请求失败',
      duration: 2000,
      icon: 'error',
    })
  },
  complete(res) {
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
