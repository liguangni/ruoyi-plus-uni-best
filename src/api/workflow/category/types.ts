/**
 * 流程分类树节点（对应后端 FlowCategoryVo 树形结构，前端转换为 id/label 树）
 */

import type { BaseEntity } from '@/http/types'

export interface CategoryTreeVO {
  /** 流程分类ID */
  id: number | string
  /** 分类名称（展示用） */
  label: string
  /** 父级分类id */
  parentId: number | string
  /** 显示顺序/权重 */
  weight: number
  /** 子分类 */
  children: CategoryTreeVO[]
}

/** 流程分类表单（对应后端 FlowCategoryBo） */
export interface CategoryForm extends BaseEntity {
  /** 分类ID */
  categoryId?: string | number
  /** 分类名称 */
  categoryName?: string
  /** 父级分类id */
  parentId?: string | number
  /** 显示顺序 */
  orderNum?: number
}
