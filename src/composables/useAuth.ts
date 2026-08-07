import { useUserStore } from '@/store/user'

/**
 * 权限控制 组合函数
 * @description 提供基于角色和权限码的权限判断方法
 */
export function useAuth() {
  const userStore = useUserStore()
  /**
   * 基于角色判断是否有权限
   * @param roles 需要判断的角色列表
   */
  function hasRole(roles: string[], userRoleSet: Set<string> = new Set()): boolean {
    if (!userRoleSet.size)
      return false
    if (userRoleSet.has('superadmin'))
      return true
    return roles.some(role => userRoleSet.has(role)) // 使用 some 性能更好
  }

  /**
   * 基于权限码判断是否有权限
   * @param permission 需要判断的权限码
   */
  function hasPermission(permission: string, userCodesSet: Set<string> = new Set()): boolean {
    if (!userCodesSet.size)
      return false
    if (userCodesSet.has('*.*.*'))
      return true
    return userCodesSet.has(permission)
  }

  return {
    hasPermission,
    hasRole,
  }
}
