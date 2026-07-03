import type { UserProfile, UserProfileForm } from '@/types/system/user.types'
import request from '@/http/luch-request'

// 查询用户个人信息
export function getUserProfile() {
  return request.get<UserProfile>({
    url: '/system/user/profile',
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword: string, newPassword: string) {
  return request.put({
    url: '/system/user/profile/updatePwd',
    data: {
      oldPassword,
      newPassword,
    },
  })
}

// 修改用户个人信息
export function updateUserProfile(data: UserProfileForm) {
  return request.put({
    url: '/system/user/profile',
    data,
  })
}
