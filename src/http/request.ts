import type { CustomRequestOptions, IResponse } from '@/http/types'

const defaultTimeout = 60000

export function request<T>(config: CustomRequestOptions): Promise<T> & { requestTask: UniApp.RequestTask } {
  let requestTask: UniApp.RequestTask
  const promise = new Promise<T>((resolve, reject) => {
    requestTask = uni.request({
      timeout: defaultTimeout,
      // #ifdef MP-ALIPAY
      dataType: 'text',
      // #endif
      ...config,
      success: (response) => {
        const responseData = response.data as IResponse<T>
        resolve(responseData.data)
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
  const promise = new Promise<T>((resolve, reject) => {
    uploadTask = uni.uploadFile({
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
          console.error('Upload response parse error:', e)
          reject(new Error('响应数据解析失败'))
        }
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
  return Object.assign(promise, { uploadTask })
}

request.get = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'GET' })
request.post = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'POST' })
request.put = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'PUT' })
request.delete = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'DELETE' })
request.upload = upload

export default request
