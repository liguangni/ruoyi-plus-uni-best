import type { IUserInfo } from '@/api/system/types/user'
import type { IUserInfoRes } from '@/api/auth/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserInfo,
} from '@/api/auth/login'

// 初始化状态
const defaultUserInfo: IUserInfo = {
  userId: -1,
  deptId: -1,
  deptName: '',
  userName: '',
  nickName: '',
  gender: '',
  userType: '',
  email: '',
  phoneNumber: '',
  avatar: '',
  avatarUrl: '',
}
const userInfoState: IUserInfoRes = {
  user: { ...defaultUserInfo },
  roles: [],
  permissions: [],
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoRes) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.user.avatarUrl) {
        val.user.avatarUrl = userInfoState.user.avatarUrl
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatarUrl: string) => {
      userInfo.value.user.avatarUrl = avatarUrl
      console.log('设置用户头像', avatarUrl)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const clearUserInfo = () => {
      userInfoState.user = { ...defaultUserInfo }
      userInfo.value = JSON.parse(JSON.stringify(userInfoState))
      uni.removeStorageSync('user')
    }

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
      const res = await getUserInfo()
      setUserInfo(res)
      return res
    }

    return {
      userInfo,
      clearUserInfo,
      fetchUserInfo,
      setUserInfo,
      setUserAvatar,
    }
  },
  {
    persist: true,
  },
)
