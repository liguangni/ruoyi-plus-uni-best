import type { CustomRequestOptions, IResponse, RequestUploadConfig } from '@/http/types'
import { useTokenStore } from '@/store/token'
import { getErrorMsg, showToastMsg } from '@/utils/common'
import { toLoginPage } from '@/utils/toLoginPage'

export function request<T>(config: CustomRequestOptions) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      // #ifdef MP-ALIPAY
      dataType: 'text',
      // #endif
      ...config,
      // 响应成功
      success: (response) => {
        const responseData = response.data as IResponse<T>
        console.log('responseData', responseData)
        const { code } = responseData

        const msg: string = responseData?.msg || responseData?.message || getErrorMsg(code)
        if (code === 200) {
          resolve(responseData.data)
        }
        else if (code === 401) {
          useTokenStore().logout().then((res) => {
            toLoginPage()
          })

          reject(new Error('无效的会话，或者会话已过期，请重新登录。'))
        }
        else {
          showToastMsg(msg)
          reject(new Error(msg))
        }
      },
      // 响应失败
      fail: (error) => {
        showToastMsg('网络错误，换个网络试试')
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
      // const { code } = responseData
        console.log('response----->', response, response.data)
        const responseData = response.data as unknown as IResponse<T>
        const { code } = responseData
        if (code === 200) {
          resolve(responseData.data)
        }
        else if (code === 401) {
          useTokenStore().logout().then((res) => {
            toLoginPage()
          })

          reject(new Error('无效的会话，或者会话已过期，请重新登录。'))
        }
        else {
          const msg = responseData?.msg || responseData?.message || getErrorMsg(code)
          showToastMsg(msg)
          reject(new Error(msg))
        }
      },
      fail: (error) => {
        showToastMsg('网络错误，换个网络试试')
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
