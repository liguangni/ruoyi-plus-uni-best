import type { CustomRequestOptions, IResponse } from '@/http/types'
import { ResultEnum } from './tools/enum'
import { getErrorMsg, showToastMsg } from '@/utils/common'

export function request<T>(config: CustomRequestOptions): Promise<T> & { requestTask: UniApp.RequestTask } {
  let requestTask: UniApp.RequestTask
  const promise = new Promise<T>((resolve, reject) => {
    requestTask = uni.request({
      // #ifdef MP-ALIPAY
      dataType: 'text',
      // #endif
      ...config,
      success: (response) => {
        const responseData = response.data as IResponse<T>
        const { code } = responseData

        if (code !== ResultEnum.Success200) {
          if (!config.hideErrorToast) {
            const msg = responseData?.msg || responseData?.message || getErrorMsg(code)
            showToastMsg(msg)
          }
          return reject(new Error(responseData?.msg || responseData?.message))
        }
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

          const { code } = responseData
          if (code !== ResultEnum.Success0 && code !== ResultEnum.Success200) {
            if (!config.hideErrorToast) {
              const msg = responseData?.msg || responseData?.message || getErrorMsg(code)
              showToastMsg(msg)
            }
            return reject(new Error(responseData?.msg || responseData?.message))
          }
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

export function download(config: CustomRequestOptions): Promise<UniApp.DownloadSuccessData> & { downloadTask: UniApp.DownloadTask } {
  let downloadTask: UniApp.DownloadTask
  const promise = new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
    downloadTask = uni.downloadFile({
      ...config,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res)
        }
        else {
          reject(new Error(`下载失败，状态码：${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
  return Object.assign(promise, { downloadTask })
}

request.get = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'GET' })
request.post = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'POST' })
request.put = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'PUT' })
request.delete = <T>(options: CustomRequestOptions) => request<T>({ ...options, method: 'DELETE' })
request.upload = upload
request.download = download

export default request
