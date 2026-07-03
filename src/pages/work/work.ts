import { useAuth } from '@/composables/useAuth'
import type { MenuGroupItem, QuickEntranceItem } from '@/types/work/work.types'
import { useUserStore } from '@/store/user'

const { hasPermission, hasRole } = useAuth()

const backgroundColors = [
  'linear-gradient(135deg, #72aefe, #4896ff)',
  'linear-gradient(135deg, #5ff9d7, #39debd)',
  'linear-gradient(135deg, #ffd155, #ffbc04)',
  'linear-gradient(135deg, #ff808b, #ff6872)',
  'linear-gradient(135deg, #a88beb, #8a6cf0)',
  'linear-gradient(135deg, #6c7a96, #4a5a7a)',
  'linear-gradient(135deg, #4ecdc4, #2ab7a9)',
  'linear-gradient(135deg, #ffcc00, #ff9900)',
  'linear-gradient(135deg, #f8b500, #f57c00)',
]

const quickEntrances: QuickEntranceItem[] = [
  {
    name: '通知公告',
    subtitle: '动态 / 资讯',
    path: '',
    icon: 'i-carbon-notification',
    iconColor: '#6b7fd7',
  },
  {
    name: '流程审批',
    subtitle: '办事 / 审批',
    path: '',
    icon: 'i-carbon-follow-up-work-order',
    iconColor: '#e05252',
  },
]

const menuGroups: MenuGroupItem[] = [
  {
    name: '系统管理',
    key: 'system',
    children: [
      {
        name: '用户管理',
        key: 'user',
        icon: 'i-carbon-user-multiple',
        path: '',
        permission: 'system:user:list',
        roles: [],
        iconBg: backgroundColors[0],
      },
      {
        name: '角色管理',
        key: 'role',
        icon: 'i-carbon-security',
        path: '',
        permission: 'system:role:list',
        roles: [],
        iconBg: backgroundColors[1],
      },
      {
        name: '部门管理',
        key: 'dept',
        icon: 'i-carbon-load-balancer-application',
        path: '',
        permission: 'system:dept:list',
        roles: [],
        iconBg: backgroundColors[6],
      },
      {
        name: '岗位管理',
        key: 'post',
        icon: 'i-carbon-group-account',
        path: '',
        permission: 'system:post:list',
        roles: [],
        iconBg: backgroundColors[7],
      },
      {
        name: '菜单管理',
        key: 'menu',
        icon: 'i-carbon-menu',
        path: '',
        permission: 'system:menu:list',
        roles: [],
        iconBg: backgroundColors[2],
      },
      {
        name: '参数管理',
        key: 'param',
        icon: 'i-carbon-parameter',
        path: '',
        permission: 'system:param:list',
        roles: [],
        iconBg: backgroundColors[4],
      },
      {
        name: '字典管理',
        key: 'dict',
        icon: 'i-carbon-ibm-cloud-direct-link-1-dedicated-hosting',
        path: '',
        permission: 'system:dict:list',
        roles: [],
        iconBg: backgroundColors[3],
      },
      {
        name: '日志管理',
        key: 'log',
        icon: 'i-carbon-ibm-knowledge-catalog',
        path: '',
        permission: 'system:log:list',
        roles: [],
        iconBg: backgroundColors[5],
      },
    ],
  },
  {
    name: '系统监控',
    key: 'monitor',
    children: [
      {
        name: '在线用户',
        key: 'online',
        icon: 'i-carbon-user-online',
        path: '',
        permission: 'monitor:online:list',
        roles: [],
        iconBg: backgroundColors[2],
      },
      {
        name: '缓存监控',
        key: 'cache',
        icon: 'i-carbon-business-metrics',
        path: '',
        permission: 'monitor:cache:list',
        roles: [],
        iconBg: backgroundColors[3],
      },
    ],
  },
]

export function getQuickEntrances() {
  return quickEntrances
}

export function getMenuGroups() {
  const userStore = useUserStore()
  const userRoleSet = new Set(userStore.userInfo.roles)
  const userCodesSet = new Set(userStore.userInfo.permissions)
  return menuGroups
    .map((group) => {
      // 1. 过滤当前分组下的子菜单
      const filteredChildren = group.children.filter(item =>
        hasPermission(item.permission, userCodesSet) || hasRole(item.roles, userRoleSet),
      )

      // 2. 返回一个新的分组对象，更新其 children
      // 注意：不要直接修改原对象，返回新对象可以避免污染原始配置数据
      return {
        ...group,
        children: filteredChildren,
      }
    })
    // 3. 过滤掉 children 为空的分组
    .filter(group => group.children.length > 0)
}

export function getMenusByGroupKey(groupKey: string) {
  const children = menuGroups.find(item => item.key === groupKey)?.children || []
  if (!children.length) {
    return []
  }
  const userStore = useUserStore()
  const userRoleSet = new Set(userStore.userInfo.roles)
  const userCodesSet = new Set(userStore.userInfo.permissions)
  const filteredChildren = children.filter(item => hasPermission(item.permission, userCodesSet) || hasRole(item.roles, userRoleSet))
  return filteredChildren
}
