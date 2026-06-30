import type { UserAvatarUpdateVo, UserProfile } from '@/types/system/user'
import { request } from '@/http/request'

export default {
  // 查询用户个人信息
  getUserProfile: () => request.get<UserProfile>({
    url: '/system/user/profile',
  }),

  // 用户密码重置
  updateUserPwd: (oldPassword: string, newPassword: string) => request.put({
    url: '/system/user/profile/updatePwd',
    data: {
      oldPassword,
      newPassword,
    },
  }),

  // 修改用户个人信息
  updateUserProfile: (data: any) => request.put({
    url: '/system/user/profile',
    data,
  }),

  // 用户头像上传
  uploadAvatar: (data: { name: string, filePath: string }) => request.upload<UserAvatarUpdateVo>({
    url: '/system/user/profile/avatar',
    name: data.name,
    filePath: data.filePath,
  }),
}
