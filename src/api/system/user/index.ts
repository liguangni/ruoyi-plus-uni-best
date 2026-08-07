import request from '@/http/request'
import type { PageResult } from '@/http/types'
import type { DeptTreeVO } from '@/api/system/dept/types'
import type {
  UserProfile,
  UserProfileForm,
  UserQuery,
  UserVO,
} from './types'

/** 查询用户个人信息 */
export function getUserProfile() {
  return request.get<UserProfile>({
    url: '/system/user/profile',
  })
}

/** 用户密码重置 */
export function updateUserPwd(oldPassword: string, newPassword: string) {
  return request.put({
    url: '/system/user/profile/updatePwd',
    data: {
      oldPassword,
      newPassword,
    },
    custom: {
      isToken: true,
      isEncrypt: true,
    },
  })
}

/** 修改用户个人信息 */
export function updateUserProfile(data: UserProfileForm) {
  return request.put({
    url: '/system/user/profile',
    data,
  })
}

/** 用户列表查询 */
export function listUser(query: UserQuery) {
  return request.get<PageResult<UserVO>>({
    url: '/system/user/list',
    query,
  })
}

/** 部门树 */
export function deptTreeSelect() {
  return request.get<DeptTreeVO[]>({
    url: '/system/user/deptTree',
  })
}
