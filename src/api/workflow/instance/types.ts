import type { FlowHisTaskVo } from '@/api/workflow/task/types'
import type { PageQuery } from '@/http/types'

/*
* 流程实例列表查询条件
*/
export interface FlowInstanceQuery extends PageQuery {
  /** 流程分类id */
  category?: string | number
  /** 节点名称 */
  nodeName?: string
  /** 流程定义编码 */
  flowCode?: string
  /** 流程定义名称 */
  flowName?: string
  /** 申请人ID列表 */
  createByIds?: Array<string | number>
  /** 业务id */
  businessId?: string
}

/**
 * 流程实例视图对象
 */
export interface FlowInstanceVO {
  /** 流程实例ID */
  id: string | number
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 删除标记 */
  delFlag: string
  /** 对应 flow_definition 表的 id */
  definitionId: string | number
  /** 流程定义名称 */
  flowName: string
  /** 流程定义编码 */
  flowCode: string
  /** 业务id */
  businessId: string
  /** 节点类型（0开始节点 1中间节点 2结束节点 3互斥网关 4并行网关） */
  nodeType: number
  /** 流程节点编码（definitionId + nodeCode 唯一） */
  nodeCode: string
  /** 流程节点名称 */
  nodeName: string
  /** 流程变量（序列化字符串） */
  variable: string
  /** 流程状态 */
  flowStatus: string
  /** 流程状态名称（后端字典翻译值） */
  flowStatusName: string
  /** 流程激活状态（0挂起 1激活） */
  activityStatus: number
  /** 审批表单是否自定义（Y是 N否） */
  formCustom: string
  /** 审批表单路径 */
  formPath: string
  /** 扩展字段，预留给业务系统使用 */
  ext: string
  /** 流程定义版本 */
  version: string
  /** 创建者（用户ID） */
  createBy: string
  /** 申请人昵称（后端根据 createBy 自动翻译） */
  createByName: string
  /** 流程分类id */
  category: string
  /** 流程分类名称（后端根据 category 自动翻译） */
  categoryName: string
  /** 业务编码 */
  businessCode: string
  /** 业务标题 */
  businessTitle: string
}

/**
 * 撤销流程请求对象
 */
export interface FlowCancelBo {
  /** 业务ID（必填） */
  businessId?: string | number
  /** 撤销说明 */
  message?: string
}

/**
 * 流程历史任务与流程图返回
 */
export interface FlowHisTaskListResult {
  /** 流程实例ID */
  instanceId?: string
  /** 历史任务列表 */
  list?: FlowHisTaskVo[]
}
