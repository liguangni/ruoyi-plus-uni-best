import type { PageQuery } from '@/http/types'

/**
 * 审批tabbar类型
 * 同时作为详情页的来源标识，直接驱动操作栏显隐、按钮类型与返回跳转。
 */
export type ApprovalTabbarType = 'waiting' | 'finish' | 'copy' | 'document'

/** 合法的 tab 来源白名单 */
export const APPROVAL_TAB_KEYS: ApprovalTabbarType[] = ['waiting', 'finish', 'copy', 'document']

/** 类型守卫：判断值是否为合法的 ApprovalTabbarType */
export function isApprovalTabbarType(v: unknown): v is ApprovalTabbarType {
  return typeof v === 'string' && APPROVAL_TAB_KEYS.includes(v as ApprovalTabbarType)
}

/**
 * 流程任务/实例列表通用查询条件（TaskQuery 与 FlowInstanceQuery 字段集一致，可统一）。
 * - 空字符串 / 空数组 统一视为"未筛选"，请求字段不传。
 */
export interface WfListQuery extends PageQuery {
  /** 节点名称（模糊匹配） */
  // nodeName?: string
  /** 流程定义名称（模糊匹配） */
  // flowName?: string
  /** 流程定义编码 */
  flowCode?: string
  /** 流程分类 id */
  // category?: string | number
  /** 申请人 ID 列表（空数组视为未筛选，不传请求字段） */
  createByIds?: Array<string | number>
}

/**
 * 详情页 + 列表行 统一任务/实例视图对象
 */
export interface FlowTaskItemInfo {
  /** 主键ID：任务级 = FlowTaskVO.id（弹窗 taskId 传参），实例级 = FlowInstanceVO.id（删除 deleteByInstanceIds） */
  id?: string | number
  /** 业务ID（撤销、删除、跳转详情、详情页审批历史面板、表单渲染回填、列表编号显示） */
  businessId?: string | number
  /** 业务编码（列表卡片「业务编码」列，详情页不用） */
  businessCode?: string
  /** 业务标题（详情页顶部标题，列表卡片如果后端也给就显示，否则用 flowName） */
  businessTitle?: string
  /** 流程定义名称（列表卡片标题 + 详情页兜底标题） */
  flowName?: string
  /** 流程状态（列表 DictTag + showFooter 判定 + 详情页 DictTag + 撤销/编辑显隐） */
  flowStatus?: string
  /** 已办列表独有：节点处理状态（区别于全局 flowStatus），DictTag=wf_task_status 字典 */
  flowTaskStatus?: string
  /** 审批表单路径（详情 FlowFormRenderer 渲染 + 编辑时 resolveFlowTypeByFormPath 回跳；列表行一般没有） */
  formPath?: string
  /** 节点编码（审批/驳回弹窗 node-code 传参；列表卡片一般没有） */
  nodeCode?: string
  /** 节点名称（减签弹窗 + 列表卡片「当前任务」列） */
  nodeName?: string
  /** 节点比率（加签/减签显示阈值；列表一般没返回） */
  nodeRatio?: string | number
  /** 申请人昵称（后端 Translation 后直接展示，列表/详情共用） */
  createByName?: string
  /** 创建时间（申请时间展示；卡片用 number/string 都兼容，详情 Date 也行） */
  createTime?: string | number | Date
}

/**
 *  URL 构建：统一处理 query 序列化 + encodeURIComponent
 */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
  if (!params)
    return path
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return qs ? `${path}?${qs}` : path
}

const WORKFLOW_INDEX = '/pages-workflow/task/index'
const WORKFLOW_DETAIL = '/pages-workflow/task/detail'
const WORKFLOW_START = '/pages-workflow/task/start'

/** 跳转审批列表页 */
export function jumpToApprovalList(type: ApprovalTabbarType) {
  uni.redirectTo({
    url: buildUrl(WORKFLOW_INDEX, { tab: type }),
  })
}

/** 打开流程详情页 */
export function navigateToDetail(payload: {
  taskId: string | number
  businessId: string | number
  from: ApprovalTabbarType
}) {
  uni.navigateTo({
    url: buildUrl(WORKFLOW_DETAIL, {
      taskId: payload.taskId,
      businessId: payload.businessId,
      from: payload.from,
    }),
  })
}

/** 打开流程发起/编辑页 */
export function navigateToStart(type: string, editId?: string | number) {
  uni.navigateTo({
    url: buildUrl(WORKFLOW_START, { type, id: editId }),
  })
}
