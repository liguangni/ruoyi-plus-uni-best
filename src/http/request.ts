import type { CustomRequestOptions, IResponse } from '@/http/types'
import { ResultEnum } from './tools/enum'
import { getErrorMsg, showToastMsg } from '@/utils/common'
import { useTokenStore } from '@/store'
import { toLoginPage } from '@/utils/toLoginPage'
import { decrypt, decryptBase64, decryptWithAes, encrypt, encryptBase64, encryptWithAes, generateAesKey } from '@/utils/api-encrypt'

const defaultTimeout = 60000
const encryptHeader = 'encrypt-key'
const appEncrypt = Boolean(import.meta.env.VITE_APP_ENCRYPT)

export function request<T>(config: CustomRequestOptions): Promise<T> & { requestTask: UniApp.RequestTask } {
  let requestTask: UniApp.RequestTask
  const opts = { ...config }
  encryptRequest(opts)
  const promise = new Promise<T>((resolve, reject) => {
    requestTask = uni.request({
      timeout: defaultTimeout,
      // #ifdef MP-ALIPAY
      dataType: 'text',
      // #endif
      ...opts,
      success: (response) => {
        try {
          decryptResponse(response)
          const responseData = response.data as IResponse<T>
          const data = handleResponse<T>(responseData, config)
          resolve(data)
        }
        catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
  return Object.assign(promise, { requestTask })
}

export function upload<T>(config: CustomRequestOptions): Promise<T> & { uploadTask: UniApp.UploadTask } {
  let uploadTask: UniApp.UploadTask
  const opts = { ...config }
  const promise = new Promise<T>((resolve, reject) => {
    uploadTask = uni.uploadFile({
      ...opts,
      success: (response) => {
        try {
          const responseData
            = typeof response.data === 'string'
              ? JSON.parse(response.data) as IResponse<T>
              : (response.data as unknown as IResponse<T>)

          const data = handleResponse<T>(responseData, config)
          resolve(data)
        }
        catch (e) {
          const msg = e instanceof Error ? e.message : '响应数据解析失败'
          reject(new Error(msg))
        }
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
  return Object.assign(promise, { uploadTask })
}

function handleResponse<T>(responseData: IResponse<T>, config: CustomRequestOptions): T {
  const { code } = responseData

  if (code === ResultEnum.Unauthorized) {
    useTokenStore().logout().then(() => toLoginPage())
    throw new Error('无效的会话，或者会话已过期，请重新登录。')
  }

  if (code !== ResultEnum.Success200) {
    const msg = responseData?.message || responseData?.msg || getErrorMsg(code)
    if (!config.hideErrorToast) {
      showToastMsg(msg)
    }
    throw new Error(msg)
  }

  return responseData.data
}

function encryptRequest(options: CustomRequestOptions) {
  if (!appEncrypt || options?.custom?.isEncrypt !== true)
    return
  if (options.method !== 'POST' && options.method !== 'PUT')
    return

  options.header = { ...options.header }
  const aesKey = generateAesKey()
  options.header[encryptHeader] = encrypt(encryptBase64(aesKey))
  options.data = typeof options.data === 'object' ? encryptWithAes(JSON.stringify(options.data), aesKey) : encryptWithAes(options.data, aesKey)
}

function decryptResponse(response: UniApp.RequestSuccessCallbackResult) {
  const respHeader = response.header || {}
  const keyStr = respHeader[encryptHeader] || ''
  if (!keyStr)
    return

  const aesKey = decryptBase64(decrypt(keyStr).toString())
  response.data = JSON.parse(decryptWithAes(response.data as string, aesKey))
}

request.get = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'GET' })
request.post = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'POST' })
request.put = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'PUT' })
request.delete = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'DELETE' })
request.upload = upload

export default request
