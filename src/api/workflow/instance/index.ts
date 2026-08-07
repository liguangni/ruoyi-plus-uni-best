import request from '@/http/request'
import type { PageResult } from '@/http/types'
import type { FlowCancelBo, FlowHisTaskListResult, FlowInstanceQuery, FlowInstanceVO } from './types'

/**
 * 分页查询当前登录人发起的单据（我发起）
 * @see 后端 FlwInstanceController#selectCurrentInstanceList
 * GET /workflow/instance/pageByCurrent → R<PageResult<FlowInstanceVo>>
 */
export function pageByCurrent(query: FlowInstanceQuery) {
  return request.get<PageResult<FlowInstanceVO>>({
    url: '/workflow/instance/pageByCurrent',
    query,
  })
}

/**
 * 通过业务id获取历史流程图与审批记录
 * @see 后端 FlwInstanceController#flowHisTaskList，返回 Map<String,Object>
 * GET /workflow/instance/flowHisTaskList/{businessId}（带随机参数防缓存）
 * 前端收敛为 FlowHisTaskListResult：{ instanceId, list: FlowHisTaskVo[] }
 */
export function flowHisTaskList(businessId: string | number) {
  return request.get<FlowHisTaskListResult>({
    url: `/workflow/instance/flowHisTaskList/${businessId}?t=${Math.random()}`,
  })
}

/**
 * 撤销流程（我发起的可撤销单据）
 * @see 后端 FlwInstanceController#cancelProcessApply，入参 FlowCancelBo
 * PUT /workflow/instance/cancelProcessApply → R<Void>
 */
export function cancelProcessApply(data: FlowCancelBo) {
  return request.put({
    url: '/workflow/instance/cancelProcessApply',
    data,
    custom: {
      showLoading: true,
      loadingText: '撤销中...',
    },
  })
}

/**
 * 删除流程实例
 * @see 后端 FlwInstanceController#deleteByInstanceIds
 * DELETE /workflow/instance/deleteByInstanceIds/{instanceIds} → R<Void>
 */
export function deleteByInstanceIds(instanceIds: Array<string | number> | string | number) {
  return request.delete({ url: `/workflow/instance/deleteByInstanceIds/${instanceIds}` })
}

/**
 * 通过业务id获取流程实例详情
 * @see 后端 FlwInstanceController#getInfo → R<FlowInstanceVo>
 * GET /workflow/instance/getInfo/{businessId}
 */
export function getInstanceInfoByBusinessId(businessId: string | number) {
  return request.get<FlowInstanceVO>({
    url: `/workflow/instance/getInfo/${businessId}`,
  })
}
