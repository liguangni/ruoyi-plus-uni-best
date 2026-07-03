import type { CustomRequestOptions, IResponse, RequestUploadConfig } from '@/http/types'
import { useTokenStore } from '@/store/token'
import { getErrorMsg, showToastMsg } from '@/utils/common'
import { toLoginPage } from '@/utils/toLoginPage'
import { ResultEnum } from './tools/enum'

export function request<T>(config: CustomRequestOptions) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      // #ifdef MP-ALIPAY
      dataType: 'text',
      // #endif
      ...config,
      // 响应成功
      success: (response) => {
        // HTTP 状态码非 2xx → 直接 reject
        if (response.statusCode < 200 || response.statusCode >= 300) {
          if (response.statusCode === 401) {
            useTokenStore().logout().then(() => toLoginPage())
          }
          else if (!config.hideErrorToast) {
            showToastMsg(`请求错误(${response.statusCode})`)
          }
          reject(response)
          return
        }

        const responseData = response.data as IResponse<T>
        const { code } = responseData

        // 业务码非成功 → reject 并提示
        if (code !== ResultEnum.Success0 && code !== ResultEnum.Success200) {
          const msg = responseData.msg || responseData.message || getErrorMsg(code)
          if (!config.hideErrorToast) {
            showToastMsg(msg)
          }
          reject(new Error(msg))
          return
        }

        resolve(responseData.data)
      },
      // 响应失败
      fail: (error) => {
        reject(error)
      },
    })
  })
}

export function upload<T>(config: RequestUploadConfig) {
  return new Promise<T>((resolve, reject) => {
    uni.uploadFile({
      ...config,
      success: (response) => {
        try {
          const responseData
            = typeof response.data === 'string'
              ? JSON.parse(response.data) as IResponse<T>
              : (response.data as unknown as IResponse<T>)

          resolve(responseData.data)
        }
        catch (e) {
          // 防止后端返回非 JSON 格式导致前端崩溃
          console.error('Upload response parse error:', e)
          reject(new Error('响应数据解析失败'))
        }
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

/**
 * GET 请求
 * @param url 后台地址
 * @param query 请求query参数
 * @param header 请求头，默认为json格式
 * @returns
 */
export function httpGet<T>(options: CustomRequestOptions) {
  return request<T>({
    ...options,
    method: 'GET',
  })
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @param query 请求query参数，post请求也支持query，很多微信接口都需要
 * @param header 请求头，默认为json格式
 * @returns
 */
export function httpPost<T>(options: CustomRequestOptions) {
  return request<T>({
    ...options,
    method: 'POST',
  })
}

/**
 * PUT 请求
 */
export function httpPut<T>(options: CustomRequestOptions) {
  return request<T>({
    method: 'PUT',
    ...options,
  })
}

/**
 * DELETE 请求（无请求体，仅 query）
 */
export function httpDelete<T>(options: CustomRequestOptions) {
  return request<T>({
    ...options,
    method: 'DELETE',
  })
}

/**
 * UPLOAD 请求
 */
export function httpUpload<T>(config: RequestUploadConfig) {
  return upload<T>(config)
}

// 支持与 axios 类似的API调用
request.get = httpGet
request.post = httpPost
request.put = httpPut
request.delete = httpDelete
request.upload = httpUpload
