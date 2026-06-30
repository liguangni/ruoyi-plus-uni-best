/**
 * 在 uniapp 的 RequestOptions 和 IUniUploadFileOptions 基础上，添加自定义参数
 */
export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
  headers?: {
    /** 是否在请求头中添加token 默认是 */
    isToken?: boolean
    /** 请求是否需要加密 默认否 */
    isEncrypt?: boolean
  }
  baseUrl?: string
} & IUniUploadFileOptions // 添加uni.uploadFile参数类型

/** 主要提供给 openapi-ts-request 生成的代码使用 */
export type CustomRequestOptions_ = Omit<CustomRequestOptions, 'url'>

export interface HttpRequestResult<T> {
  promise: Promise<T>
  requestTask: UniApp.RequestTask
}

// 通用响应格式（兼容 msg + message 字段）
export type IResponse<T = any> = {
  code: number
  data: T
  message: string
  [key: string]: any // 允许额外属性
} | {
  code: number
  data: T
  msg: string
  [key: string]: any // 允许额外属性
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
  [key: string]: any
}

// 分页响应数据
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

interface BaseRequestConfig {
  headers?: {
    /** 是否在请求头中添加token 默认是 */
    isToken: boolean
    /** 请求是否需要加密 默认否 */
    isEncrypt?: boolean
  }
  /** 请求头配置 */
  header?: any
  /** 接口路径 */
  url: string
  /** 请求参数 */
  params?: any
  /** 超时事件 */
  timeout?: number | undefined
}

export interface RequestUploadConfig extends BaseRequestConfig {
  /** 文件路径 */
  filePath: string
  /** 文件对应变量名 默认file */
  name?: string
  /** 其他表单参数 */
  formData?: any
}

export interface ResponseData<T> {
  /** 响应码 */
  code: number
  /** 响应数据 */
  data: any
  /** 响应信息 */
  msg: string
  /** 图片路径 */
  imgUrl: string
  /** 数据总数 */
  total: number
  /** 表格数据 */
  rows: Array<T>
}
