/** 流程定义列表查询条件（对应后端 FlowDefinitionBo 查询入参，继承通用分页参数） */

import type { PageQuery } from '@/http/types'

export interface FlowDefinitionQuery extends PageQuery {
  /** 流程定义编码 */
  flowCode?: string
  /** 流程定义名称 */
  flowName?: string
  /** 流程分类id */
  category: string | number
  /** 是否发布（0未发布 1已发布 9失效） */
  isPublish?: number
}

/**
 * 流程定义视图对象（对应后端 FlowDefinitionVo）
 */
export interface FlowDefinitionVo {
  /** 流程定义主键 */
  id: string
  /** 流程定义名称 */
  flowName: string
  /** 流程定义编码 */
  flowCode: string
  /** 流程分类id */
  category?: string
  /** 流程分类名称 */
  categoryName?: string
  /** 审批表单路径 */
  formPath: string
  /** 流程版本 */
  version: string
  /** 是否发布（0未发布 1已发布 9失效） */
  isPublish: number
  /** 流程激活状态（0挂起 1激活） */
  activityStatus: number
  /** 创建时间 */
  createTime: Date
  /** 更新时间 */
  updateTime: Date
}
