export interface UserInfo {
  userId: number
  userName: string
  deptId: number
  nickName: string
  userType: string
  email: string
  phoneNumber: string
  gender: string
  avatar: string | null
  loginIp: string
  loginDate: string
  deptName: string
}

export interface UserProfile {
  user: UserInfo
  roleGroup: string
  postGroup: string
}

export interface UserProfileForm {
  nickName?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  avatar?: string | number;
}