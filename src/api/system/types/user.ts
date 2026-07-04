export interface IUserInfo {
  userId: number
  userName: string
  deptId: number
  nickName: string
  userType: string
  email: string
  phoneNumber: string
  gender: string
  avatar: string | null
  avatarUrl: string | null
  deptName: string
  loginIp?: string
  loginDate?: string
}

export interface UserProfile {
  user: IUserInfo
  roleGroup: string
  postGroup: string
}

export interface UserProfileForm {
  nickName?: string
  phoneNumber?: string
  email?: string
  gender?: string
  avatar?: string | number
}
