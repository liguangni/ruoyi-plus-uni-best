import request from '@/http/request'
import type { PageResult } from '@/http/types'
import type { FlowDefinitionQuery, FlowDefinitionVo } from './types'

/**
 * 获取流程定义列表（移动端仅用于发起流程时选择流程）
 * @see 后端 FlwDefinitionController#list → R<PageResult<FlowDefinitionVo>>
 * GET /workflow/definition/list
 */
export function listDefinition(query: FlowDefinitionQuery) {
  return request.get<PageResult<FlowDefinitionVo>>({
    url: '/workflow/definition/list',
    query,
  })
}
