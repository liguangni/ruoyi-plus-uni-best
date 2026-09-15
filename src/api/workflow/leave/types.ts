/**
 * 请假视图对象（对应后端 TestLeaveVo，test_leave 业务表）
 */

import type { BaseEntity, PageQuery } from '@/http/types'

export interface LeaveVO {
  /** 主键 */
  id: string | number
  /** 申请编号 */
  applyCode?: string
  /** 请假类型 */
  leaveType: string
  /** 开始时间 */
  startDate: string
  /** 结束时间 */
  endDate: string
  /** 请假天数 */
  leaveDays: number
  /** 请假原因 */
  remark: string
  /** 状态 */
  status?: string
}

/** 请假表单（对应后端 TestLeaveBo） */
export interface LeaveForm extends BaseEntity {
  /** 主键 */
  id?: string | number
  /** 申请编号 */
  applyCode?: string
  /** 请假类型 */
  leaveType?: string
  /** 开始时间 */
  startDate?: string
  /** 结束时间 */
  endDate?: string
  /** 请假天数 */
  leaveDays?: number
  /** 请假原因 */
  remark?: string
  /** 状态 */
  status?: string
}

/** 请假查询条件（对应后端 TestLeaveBo 查询入参，继承通用分页参数） */
export interface LeaveQuery extends PageQuery {
  /** 请假天数下限 */
  startLeaveDays?: number
  /** 请假天数上限 */
  endLeaveDays?: number
}
