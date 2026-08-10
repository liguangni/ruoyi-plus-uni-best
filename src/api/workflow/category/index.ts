import request from '@/http/request'
import type { CategoryForm, CategoryTreeVO } from './types'

/**
 * 获取流程分类树列表
 * @see 后端 FlwCategoryController#categoryTree → R<List<FlowCategoryVo>>
 * GET /workflow/category/categoryTree（前端转换为 CategoryTreeVO 树）
 */
export function categoryTree(query?: CategoryForm) {
  return request.get<CategoryTreeVO[]>({
    url: '/workflow/category/categoryTree',
    query,
  })
}
