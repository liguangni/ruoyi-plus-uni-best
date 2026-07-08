import type { UserProfile, UserProfileForm } from '@/api/system/types/user'
import request from '@/http/request'

// 查询用户个人信息
export function getUserProfile() {
  return request.get<UserProfile>({
    url: '/system/user/profile',
    custom: {
      showLoading: true,
    },
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
    custom: {
      isToken: true,
      isEncrypt: true,
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
