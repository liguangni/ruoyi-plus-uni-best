import request from '@/http/request'
import type { PageResult } from '@/http/types'
import type {
  BackProcessBo,
  CompleteTaskBo,
  FlowHisTaskVo,
  FlowNextNodeBo,
  FlowNode,
  FlowTaskVO,
  FlowTerminationBo,
  StartProcessBo,
  TaskOperationBo,
  TaskQuery,
  UserDTO,
} from './types'

/**
 * 查询待办任务列表
 * @see 后端 FlwTaskController#pageByTaskWait
 * GET /workflow/task/pageByTaskWait → R<PageResult<FlowTaskVo>>
 */
export function pageByTaskWait(query: TaskQuery) {
  return request.get<PageResult<FlowTaskVO>>({
    url: '/workflow/task/pageByTaskWait',
    query,
  })
}

/**
 * 查询已办任务列表
 * @see 后端 FlwTaskController#pageByTaskFinish
 * GET /workflow/task/pageByTaskFinish → R<PageResult<FlowHisTaskVo>>
 */
export function pageByTaskFinish(query: TaskQuery) {
  return request.get<PageResult<FlowHisTaskVo>>({
    url: '/workflow/task/pageByTaskFinish',
    query,
  })
}

/**
 * 查询抄送我的任务列表
 * @see 后端 FlwTaskController#pageByTaskCopy
 * GET /workflow/task/pageByTaskCopy → R<PageResult<FlowTaskVo>>
 */
export function pageByTaskCopy(query: TaskQuery) {
  return request.get<PageResult<FlowTaskVO>>({
    url: '/workflow/task/pageByTaskCopy',
    query,
  })
}

/**
 * 办理（通过）任务
 * @see 后端 FlwTaskController#completeTask，入参 CompleteTaskBo
 * POST /workflow/task/completeTask → R<Void>
 */
export function completeTask(data: CompleteTaskBo) {
  return request.post({ url: '/workflow/task/completeTask', data })
}

/**
 * 驳回任务
 * @see 后端 FlwTaskController#backProcess，入参 BackProcessBo
 * POST /workflow/task/backProcess → R<Void>
 */
export function backProcess(data: BackProcessBo) {
  return request.post({ url: '/workflow/task/backProcess', data })
}

/**
 * 获取任务详情
 * @see 后端 FlwTaskController#getTask
 * GET /workflow/task/getTask/{taskId}，带 ?t 防缓存 → R<FlowTaskVo>
 */
export function getTask(taskId: string | number) {
  return request.get<FlowTaskVO>({
    url: `/workflow/task/getTask/${taskId}?t=${new Date().getTime()}`,
  })
}

/**
 * 终止任务
 * @see 后端 FlwTaskController#terminationTask，入参 FlowTerminationBo
 * POST /workflow/task/terminationTask → R<Boolean>
 */
export function terminationTask(data: FlowTerminationBo) {
  return request.post<boolean>({ url: '/workflow/task/terminationTask', data })
}

/**
 * 获取可驳回的任务节点列表
 * @see 后端 FlwTaskController#getBackTaskNode
 * GET /workflow/task/getBackTaskNode/{taskId}/{nowNodeCode} → R<List<Node>>（warm-flow Node）
 */
export function getBackTaskNode(taskId: string | number, nodeCode: string) {
  return request.get<FlowNode[]>({
    url: `/workflow/task/getBackTaskNode/${taskId}/${nodeCode}`,
  })
}

/**
 * 任务操作：委派 delegateTask / 转办 transferTask / 加签 addSignature / 减签 reductionSignature
 * @see 后端 FlwTaskController#taskOperation，入参 TaskOperationBo
 * POST /workflow/task/taskOperation/{operation} → R<Void>
 * @param operation 操作类型，拼接到路径：taskOperation/{operation}
 */
export function taskOperation(data: TaskOperationBo, operation: string) {
  return request.post({ url: `/workflow/task/taskOperation/${operation}`, data })
}

/**
 * 获取当前任务所有办理人
 * @see 后端 FlwTaskController#currentTaskAllUser
 * GET /workflow/task/currentTaskAllUser/{taskId} → R<List<UserDTO>>
 */
export function currentTaskAllUser(taskId: string | number) {
  return request.get<UserDTO[]>({
    url: `/workflow/task/currentTaskAllUser/${taskId}`,
  })
}

/**
 * 获取下一节点列表
 * @see 后端 FlwTaskController#getNextNodeList，入参 FlowNextNodeBo
 * POST /workflow/task/getNextNodeList → R<List<FlowNode>>
 */
export function getNextNodeList(data: FlowNextNodeBo) {
  return request.post<FlowNode[]>({ url: '/workflow/task/getNextNodeList', data })
}

/**
 * 发起流程（前端发起：先存业务表拿 businessId，再调此接口创建流程实例并生成首个任务）
 * @see 后端 FlwTaskController#startWorkFlow，入参 StartProcessBo
 * POST /workflow/task/startWorkFlow → R<{ taskId, ... }>
 */
export function startWorkFlow(data: StartProcessBo) {
  return request.post<{ taskId: string | number }>({ url: '/workflow/task/startWorkFlow', data })
}
