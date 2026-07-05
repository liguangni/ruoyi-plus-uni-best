import Request from 'luch-request'
import { getEnvBaseUrl } from '@/utils'
import { getErrorMsg, showToastMsg } from '@/utils/common'
import { decrypt, decryptBase64, decryptWithAes, encrypt, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/api-encrypt'
import { ResultEnum } from './tools/enum'
import { useTokenStore } from '@/store'
import { toLoginPage } from '@/utils/toLoginPage'
import type { HttpRequestConfig } from 'luch-request'

const baseUrl = getEnvBaseUrl()
const encryptHeader = 'encrypt-key'
const clientId = import.meta.env.VITE_APP_CLIENT_ID
const appEncrypt = Boolean(import.meta.env.VITE_APP_ENCRYPT)

export type CustomRequestOptions = HttpRequestConfig & {
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
  custom?: {
    /** 是否在请求头中添加token 默认是 */
    isToken?: boolean
    /** 请求是否需要加密 默认否 */
    isEncrypt?: boolean
  }
  baseUrl?: string
}

const http = new Request({
//   baseURL: baseUrl,
  timeout: 60000,
  header: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求拦截器
http.interceptors.request.use((config) => {
  // 1. 处理 query 参数
//   if (config.params && Object.keys(config.params).length > 0) {
//     const queryStr = stringifyQuery(config.params)
//     if (config.url?.includes('?')) {
//       config.url += `&${queryStr}`
//     }
//     else {
//       config.url += `?${queryStr}`
//     }
//     // luch-request 中拼接后建议清空 params 防止重复拼接
//     config.params = undefined
//   }

  if (config.custom.loading) {
    uni.showLoading()
  }

  // 2. 非 http 开头需拼接地址
  if (!config.url.startsWith('http')) {
    // #ifdef H5
    if (JSON.parse(import.meta.env.VITE_APP_PROXY_ENABLE)) {
      // 自动拼接代理前缀
      config.url = import.meta.env.VITE_APP_PROXY_PREFIX + config.url
    }
    else {
      config.url = baseUrl + config.url
    }
    // #endif
    // 非H5正常拼接
    // #ifndef H5
    config.url = baseUrl + config.url
    // #endif
    // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
  }

  // 3. Token 注入 (推荐使用 Storage 兜底，避免 Store 未初始化的时序问题)
  const isNeedToken = config.custom?.isToken !== false // 默认需要 token
  if (isNeedToken) {
    const tokenStore = useTokenStore()
    const token = tokenStore.updateNowTime().validToken
    if (token) {
      config.header.Authorization = `Bearer ${token}`
      config.header.clientId = clientId
    }
  }

  // 4. 请求加密
  if (appEncrypt && config.custom?.isEncrypt) {
    if (config.method === 'POST' || config.method === 'PUT') {
      const aesKey = generateAesKey()
      config.header[encryptHeader] = encrypt(encryptBase64(aesKey)) as string
      // 使用 as any 解决 HttpData 类型不兼容的问题
      const encryptedData = typeof config.data === 'object'
        ? encryptWithAes(JSON.stringify(config.data), aesKey)
        : encryptWithAes(config.data, aesKey)

      config.data = encryptedData as any
    }
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// 响应拦截器
http.interceptors.response.use((response) => {
  const { data, config, statusCode } = response
  let respData = data

  // 1. 响应解密
  const respHeader = response.header || {}
  const keyStr = respHeader[encryptHeader] || ''
  if (keyStr !== '') {
    const base64Str = decrypt(keyStr)
    const aesKey = decryptBase64(base64Str.toString())
    const decryptData = decryptWithAes(respData as string, aesKey)
    respData = JSON.parse(decryptData)
    console.log('响应解密------------>respData:', respData)
  }

  // 2. 业务状态码拦截
  const { code, msg, message } = respData || {}
  if (code !== ResultEnum.Success200) {
    if (code === 401) {
      useTokenStore().logout().then(() => {
        toLoginPage()
      })
    }
    const errorMsg = msg || message || getErrorMsg(code)
    // 允许局部配置关闭错误提示
    if (!config.custom?.hideErrorToast) {
      showToastMsg(errorMsg)
    }
    return Promise.reject(new Error(errorMsg))
  }

  return Promise.resolve(respData)
}, (error) => {
  // 处理 HTTP 状态码错误
  const statusCode = error.statusCode
  if (statusCode === 401) {
    // Token 过期或无权限，清除缓存并跳转登录页
    useTokenStore().logout().then(() => {
      toLoginPage()
    })
  }
  else {
    uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
  }
  return Promise.reject(error)
})

// 导出封装好的工具类

/** 请求函数 */
async function createHttp<T = any, R extends 'data' | 'body' = 'data'>(config: HttpRequestConfig): Promise<T> {
  const res = await http.middleware<T>({
    ...config,
  })
  return res.data
}

// 导出兼容对象，支持 request.get({ url, data }) 写法
export const request = {
  get<T>(config: CustomRequestOptions) {
    return createHttp<T>({ ...config, method: 'GET' })
  },
  post<T>(config: CustomRequestOptions) {
    return createHttp<T>({ ...config, method: 'POST' })
  },
  put<T>(config: CustomRequestOptions) {
    return createHttp<T>({ ...config, method: 'PUT' })
  },
  delete<T>(config: CustomRequestOptions) {
    return createHttp<T>({ ...config, method: 'DELETE' })
  },
  upload<T>(config: CustomRequestOptions) {
    return createHttp<T>({ ...config, method: 'UPLOAD' })
  },
  download<T>(config: CustomRequestOptions) {
    return createHttp<T>({ ...config, method: 'DOWNLOAD' })
  },
}

export default request
