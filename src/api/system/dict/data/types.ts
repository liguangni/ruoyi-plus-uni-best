/** 字典数据查询参数 */

import type { PageQuery } from '@/http/types'

export interface DictDataQuery extends PageQuery {
  dictName?: string
  dictType?: string
  dictLabel?: string
}

/** 字典数据类型 */
export interface DictDataVO {
  dictCode: string | number
  dictLabel: string
  dictValue: string
  cssClass?: string
  listClass?: string
  dictSort: number
  remark?: string
  dictType: string
  status: string
  createTime?: string
  isDefault?: string
}

/** 字典数据表单 */
export interface DictDataForm {
  dictType?: string
  dictCode?: string | number
  dictLabel?: string
  dictValue?: string
  cssClass?: string
  listClass?: string
  dictSort?: number
  remark?: string
  status?: string
  isDefault?: string
}

/** 字典数据选项（用于下拉选择、标签展示等场景） */
export interface DictDataOption {
  label: string
  value: string
  tagType?: string
  tagClass?: string
  color?: string
  bgColor?: string
  cssClass?: string
  listClass?: string
}
