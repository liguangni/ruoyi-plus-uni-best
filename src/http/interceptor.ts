import type { CustomRequestOptions } from '@/http/types'
import { useTokenStore } from '@/store'
import { getEnvBaseUrl } from '@/utils'
import { stringifyQuery } from './tools/queryString'
import { getErrorMsg, showToastMsg } from '@/utils/common'
import { decrypt, decryptBase64, decryptWithAes, encrypt, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/api-encrypt'
import { ResultEnum } from './tools/enum'

// 请求基准地址
const baseUrl = getEnvBaseUrl()
const encryptHeader = 'encrypt-key'
const clientId = import.meta.env.VITE_APP_CLIENT_ID
const appEncrypt = Boolean(import.meta.env.VITE_APP_ENCRYPT)

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 如果您使用了alova，则请把下面的代码放开注释
    // alova 执行流程：alova beforeRequest --> 本拦截器 --> alova responded
    return options

    // 非 alova 请求，正常执行
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = stringifyQuery(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      }
      else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      if (JSON.parse(import.meta.env.VITE_APP_PROXY_ENABLE)) {
        // 自动拼接代理前缀
        options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
      }
      else {
        options.url = baseUrl + options.url
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }
    // 1. 请求超时
    options.timeout = 60000 // 60s
    // 2. （可选）添加小程序端请求头标识
    options.header = {
      ...options.header,
    }
    // 3. 添加 token 请求头标识
    const isNeedToken = options?.headers?.isToken || true
    if (isNeedToken) {
      const tokenStore = useTokenStore()
      const token = tokenStore.updateNowTime().validToken
      options.header.Authorization = `Bearer ${token}`
      options.header.clientId = clientId
    }

    // 是否需要加密
    let isNeedEncrypt = false
    if (appEncrypt) {
      isNeedEncrypt = options?.headers?.isEncrypt === true
    }
    console.log('options', options)
    console.log('isNeedEncrypt', isNeedEncrypt, appEncrypt, options?.headers?.isEncrypt === true, options?.headers?.isEncrypt)
    if (isNeedEncrypt) {
      // 当开启参数加密
      if (options.method === 'POST' || options.method === 'PUT') {
        // 生成一个 AES 密钥
        const aesKey = generateAesKey()
        options.header[encryptHeader] = encrypt(encryptBase64(aesKey))
        options.data = typeof options.data === 'object' ? encryptWithAes(JSON.stringify(options.data), aesKey) : encryptWithAes(options.data, aesKey)
      }
    }
    return options
  },
  success(args) {
    return
    const respHeader = { [encryptHeader]: '', ...(args.header ?? {}) }
    console.log('Interceptor success respHeader', respHeader)
    // 加密后的 AES 秘钥
    const keyStr = respHeader[encryptHeader] || ''
    // 加密
    if (keyStr !== '') {
      const data = args.data

      // 请求体 AES 解密
      const base64Str = decrypt(keyStr)
      // base64 解码 得到请求头的 AES 秘钥
      const aesKey = decryptBase64(base64Str.toString())
      // aesKey 解码 data
      const decryptData = decryptWithAes(data as string, aesKey)
      // 将结果 (得到的是 JSON 字符串) 转为 JSON
      args.data = JSON.parse(decryptData)
    }

    // 2. 业务状态码拦截
    const responseData = typeof args.data === 'string' ? JSON.parse(args.data) : args.data
    const { code } = responseData || {}

    if (code !== ResultEnum.Success0 && code !== ResultEnum.Success200) {
      const msg = responseData.msg || responseData.message || getErrorMsg(code)
      if (!args.config.hideErrorToast) {
        showToastMsg(msg)
      }
    }
  },
  fail(err) {
    // 网络级错误（断网、超时等）
    showToastMsg('网络错误，换个网络试试')
    console.log('interceptor-fail', err)
  },
  complete(res) {
    console.log('interceptor-complete', res)
  },
}

export const requestInterceptor = {
  install() {
    // // 拦截 request 请求
    // uni.addInterceptor('request', httpInterceptor)
    // // 拦截 uploadFile 文件上传
    // uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
