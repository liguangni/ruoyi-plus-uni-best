import type { BaseEntity, PageQuery } from '@/http/types'

export interface UserProfile {
  user: UserVO
  roleGroup: string
  postGroup: string
}

/** 用户查询参数 */
export interface UserQuery extends PageQuery {
  userName?: string
  nickName?: string
  phoneNumber?: string
  status?: string
  deptId?: string | number
  roleId?: string | number
  userIds?: string | number | (string | number)[]
}

/** 用户返回对象 */
export interface UserVO extends BaseEntity {
  userId: string | number
  tenantId?: string
  deptId: number
  userName: string
  nickName: string
  userType: string
  email: string
  phoneNumber: string
  gender: string
  avatar?: string | number
  avatarUrl?: string
  status: string
  delFlag?: string
  loginIp: string
  loginDate: string
  remark: string
  deptName: string
  dept?: { deptName?: string }
  roles?: any[]
  roleIds?: any
  postIds?: any
  roleId?: any
  admin?: boolean
}
export interface UserProfileForm {
  nickName?: string
  phoneNumber?: string
  email?: string
  gender?: string
  avatar?: string | number
}

/** 用户表单类型 */
export interface UserForm {
  id?: string
  userId?: string
  deptId?: number
  userName?: string
  nickName?: string
  password?: string
  phoneNumber?: string
  email?: string
  gender?: string
  status?: string
  remark?: string
  avatar?: string | number
  postIds?: string[]
  roleIds?: string[]
}

export interface ResetPwdForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
