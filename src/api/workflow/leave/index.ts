import request from '@/http/request'
import type { LeaveForm, LeaveVO } from './types'

/**
 * 查询请假详情（test_leave 业务表示例）
 * @see 后端 TestLeaveController#getInfo → R<TestLeaveVo>
 * GET /workflow/leave/{id}
 */
export function getLeave(id: string | number) {
  return request.get<LeaveVO>({
    url: `/workflow/leave/${id}`,
  })
}

/**
 * 新增请假（对应后端 TestLeaveController#add）
 * POST /workflow/leave → R<TestLeaveVo>
 */
export function addLeave(data: LeaveForm) {
  return request.post<LeaveVO>({ url: '/workflow/leave', data })
}

/**
 * 修改请假（对应后端 TestLeaveController#edit）
 * PUT /workflow/leave → R<TestLeaveVo>
 */
export function updateLeave(data: LeaveForm) {
  return request.put<LeaveVO>({ url: '/workflow/leave', data })
}

/**
 * 提交请假并发起流程（后端一体化发起）
 * POST /workflow/leave/submitAndFlowStart → R<TestLeaveVo>
 */
export function submitAndFlowStart(data: LeaveForm) {
  return request.post<LeaveVO>({ url: '/workflow/leave/submitAndFlowStart', data })
}
