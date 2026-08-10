/** 任务列表查询条件（对应后端 FlowTaskBo 查询入参，继承通用分页参数） */

import type { PageQuery } from '@/http/types'

export interface TaskQuery extends PageQuery {
  /** 节点名称 */
  nodeName?: string
  /** 流程定义编码 */
  flowCode?: string
  /** 流程定义名称 */
  flowName?: string
  /** 申请人ID列表 */
  createByIds?: Array<string | number>
  /** 流程分类id */
  category?: string | number
}

/**
 * 流程任务视图对象（对应后端 FlowTaskVo）
 * 用于待办/已办/抄送/我发起详情页，携带按钮权限、抄送、业务扩展信息等。
 */
export interface FlowTaskVO {
  /** 任务ID */
  id: string | number
  /** 创建时间 */
  createTime?: Date
  /** 更新时间 */
  updateTime?: Date
  /** 租户ID */
  tenantId?: string
  /** 对应 flow_definition 表的 id */
  definitionId?: string
  /** 流程实例表 id */
  instanceId: string
  /** 流程定义名称 */
  flowName: string
  /** 业务id */
  businessId: string
  /** 节点编码 */
  nodeCode: string
  /** 节点名称 */
  nodeName: string
  /** 流程定义编码 */
  flowCode: string
  /** 流程状态 */
  flowStatus: string
  /** 审批表单是否自定义（Y是 N否） */
  formCustom: string
  /** 审批表单路径 */
  formPath: string
  /** 节点类型（0开始节点 1中间节点 2结束节点 3互斥网关 4并行网关） */
  nodeType: number
  /** 流程签署比例值（大于0为票签/会签） */
  nodeRatio: string | number
  /** 流程版本号 */
  version?: string
  /** 是否为申请人节点 */
  applyNode?: boolean
  /** 按钮权限列表 */
  buttonList?: ButtonPermissionVo[]
  /** 抄送对象列表 */
  copyList?: FlowCopyVo[]
  /** 自定义参数 Map（key=value 格式） */
  varList?: Map<string, string>
  /** 业务编码 */
  businessCode: string
  /** 业务标题 */
  businessTitle: string
}

/**
 * 发起流程请求对象（对应后端 StartProcessBo）
 * 前端发起时：先存业务表拿 businessId，再传 flowCode/variables/bizExt 创建流程实例。
 */
export interface StartProcessBo {
  /** 业务id（业务表主键） */
  businessId: string | number
  /** 流程定义编码（如 leave1~leave6） */
  flowCode: string
  /** 流程变量（如 { leaveDays }，供条件分支/会签使用） */
  variables?: Record<string, unknown>
  /** 业务扩展字段（如 { businessTitle, businessCode }） */
  bizExt?: Record<string, unknown>
}

/**
 * 任务按钮权限（对应后端 ButtonPermissionVo）
 * 由后端根据流程节点扩展属性中的按钮配置生成，决定前端展示哪些操作按钮。
 */
export interface ButtonPermissionVo {
  /** 按钮唯一编码（如 pass/reject/delegate 等） */
  code: string
  /** 选项值 */
  value?: string
  /** 是否显示 */
  show: boolean
}

/** 抄送对象（对应后端 FlowCopyVo，userList 中引用的抄送人） */
export interface FlowCopyVo {
  /** 用户id */
  userId: string | number
  /** 用户昵称 */
  nickName: string
}

/**
 * 任务操作业务对象（对应后端 TaskOperationBo）
 * 用于委托、转办、加签、减签等操作的请求参数。
 */
export interface TaskOperationBo {
  /** 委派/转办人的用户ID（必填，针对委派/转办操作） */
  userId?: string
  /** 加签/减签人的用户ID列表（必填，针对加签/减签操作） */
  userIds?: string[]
  /** 任务ID（必填） */
  taskId: string | number
  /** 消息类型 */
  messageType?: string[]
  /** 意见或备注信息（可选） */
  message?: string
}

/**
 * 流程节点（对应后端 getNextNodeList 返回的 FlowNode / getBackTaskNode 返回的 warm-flow Node 通用子集）
 * 描述下一节点或可驳回节点的配置及其候选办理人。
 */
export interface FlowNode {
  /** 节点ID */
  id?: string | number
  /** 节点编码 */
  nodeCode?: string
  /** 节点名称 */
  nodeName?: string
  /** 节点类型（0开始节点 1中间节点 2结束节点 3互斥网关 4并行网关） */
  nodeType?: number
  /** 权限标识 permissionFlag 的 list 形式 */
  permissionList?: string[]
  /** 节点办理人列表 */
  userList?: FlowNodeUser[]
}

/** 流程节点办理人（对应 warm-flow User） */
export interface FlowNodeUser {
  /** 用户记录ID（warm-flow 内部 id） */
  id?: string | number
  /** 用户ID */
  userId?: string | number
  /** 用户名称 */
  userName?: string
  /** 用户昵称 */
  nickName?: string
}

/**
 * 系统用户（对应后端 system 模块 UserDTO，用于 currentTaskAllUser 当前任务办理人）
 */
export interface UserDTO {
  /** 用户ID */
  userId?: string | number
  /** 部门ID */
  deptId?: string | number
  /** 用户账号 */
  userName?: string
  /** 用户昵称 */
  nickName?: string
  /** 用户类型（sys_user 系统用户） */
  userType?: string
  /** 用户邮箱 */
  email?: string
  /** 手机号码 */
  phoneNumber?: string
  /** 用户性别（0男 1女 2未知） */
  gender?: string
  /** 账号状态（0正常 1停用） */
  status?: string
  /** 创建时间 */
  createTime?: string
}

/** 抄送人（对应后端 CompleteTaskBo.flowCopyList 的 FlowCopyBo） */
export interface FlowCopyBo {
  /** 用户id */
  userId: string | number
  /** 用户昵称 */
  nickName?: string
}

/**
 * 办理（通过）任务请求对象（对应后端 CompleteTaskBo）
 */
export interface CompleteTaskBo {
  /** 任务id（必填） */
  taskId: string | number
  /** 附件id */
  fileId?: string
  /** 抄送人员 */
  flowCopyList?: FlowCopyBo[]
  /** 消息类型 */
  messageType?: string[]
  /** 办理意见 */
  message?: string
  /** 消息通知 */
  notice?: string
  /** 办理人（可不填，用于覆盖当前节点办理人） */
  handler?: string
  /** 流程变量 */
  variables?: Record<string, unknown>
  /** 弹窗选择的办理人（节点编码 -> 办理人） */
  assigneeMap?: Record<string, string>
  /** 扩展变量（逗号分隔的 ossId） */
  ext?: string
}

/**
 * 驳回任务请求对象（对应后端 BackProcessBo）
 */
export interface BackProcessBo {
  /** 任务ID（必填） */
  taskId: string | number
  /** 驳回的节点编码（目前未使用，直接驳回到申请人） */
  nodeCode: string
  /** 附件id */
  fileId?: string
  /** 消息类型 */
  messageType?: string[]
  /** 办理意见 */
  message?: string
  /** 通知 */
  notice?: string
  /** 流程变量 */
  variables?: Record<string, unknown>
}

/**
 * 终止任务请求对象（对应后端 FlowTerminationBo，record 类型）
 */
export interface FlowTerminationBo {
  /** 任务ID（必填） */
  taskId: string | number
  /** 终止意见 */
  comment: string
}

/**
 * 查询下一节点信息的请求对象（对应后端 FlowNextNodeBo）
 */
export interface FlowNextNodeBo {
  /** 任务id */
  taskId: string | number
  /** 流程变量 */
  variables?: Record<string, unknown>
}

/**
 * 历史任务视图（对应后端 FlowHisTaskVo）
 */
export interface FlowHisTaskVo {
  /** 历史任务主键 */
  id: string | number
  /** 创建时间（ISO 字符串） */
  createTime?: string
  /** 更新时间（ISO 字符串） */
  updateTime?: string
  /** 删除标记 */
  delFlag?: string
  /** 对应 flow_definition 表的 id */
  definitionId?: string | number
  /** 流程定义名称 */
  flowName?: string
  /** 流程实例表 id */
  instanceId?: string | number
  /** 任务表 id */
  taskId?: string | number
  /** 协作方式(1审批 2转办 3委派 4会签 5票签 6加签 7减签) */
  cooperateType?: number
  /** 协作方式名称 */
  cooperateTypeName?: string
  /** 业务 id */
  businessId?: string
  /** 开始节点编码 */
  nodeCode?: string
  /** 开始节点名称 */
  nodeName?: string
  /** 开始节点类型（0开始节点 1中间节点 2结束节点 3互斥网关 4并行网关） */
  nodeType?: number
  /** 目标节点编码 */
  targetNodeCode?: string
  /** 结束节点名称 */
  targetNodeName?: string
  /** 审批者 */
  approver?: string
  /** 审批者名称 */
  approverName?: string
  /** 协作人(只有转办、会签、票签、委派) */
  collaborator?: string
  /** 权限标识 permissionFlag 的 list 形式 */
  permissionList?: string[]
  /** 跳转类型（PASS通过 REJECT退回 NONE无动作） */
  skipType?: string
  /** 流程状态 */
  flowStatus?: string
  /** 任务状态 */
  flowTaskStatus?: string
  /** 流程状态名称 */
  flowStatusName?: string
  /** 审批意见 */
  message?: string
  /** 业务详情（存业务类的 json） */
  ext?: string
  /** 创建者 */
  createBy?: string
  /** 申请人名称 */
  createByName?: string
  /** 流程分类 id */
  category?: string
  /** 流程分类名称 */
  categoryName?: string
  /** 审批表单是否自定义（Y是 N否） */
  formCustom?: string
  /** 审批表单路径 */
  formPath?: string
  /** 流程定义编码 */
  flowCode?: string
  /** 流程版本号 */
  version?: string
  /** 运行时长 */
  runDuration?: string
  /** 业务编码 */
  businessCode?: string
  /** 业务标题 */
  businessTitle?: string
}
