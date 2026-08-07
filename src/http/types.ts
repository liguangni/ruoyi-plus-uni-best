/**
 * 在 uniapp 的 RequestOptions 和 IUniUploadFileOptions 基础上，添加自定义参数
 */
// 添加uni.uploadFile参数类型
export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
  custom?: {
    /** 是否在请求头中添加token 默认是 */
    isToken?: boolean
    /** 请求是否需要加密 默认否 */
    isEncrypt?: boolean
    /** 是否隐藏错误提示 */
    hideErrorToast?: boolean
    /** 是否显示加载中 */
    showLoading?: boolean
    /** 加载中提示 */
    loadingText?: string
  }
  baseUrl?: string
} & IUniUploadFileOptions

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

/**
 * 分页查询参数
 */
export interface PageQuery {
  pageNum: number
  pageSize: number
}

// 分页响应数据
export interface PageResult<T> {
  total: number
  rows: T[]
  page: number
  pageSize: number
}

/**
 * 基础实体（审计字段：createBy/createTime 等）
 */
export interface BaseEntity {
  createBy?: any
  createDept?: any
  createTime?: string
  updateBy?: any
  updateTime?: any
}
