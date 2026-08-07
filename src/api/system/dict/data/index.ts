import request from '@/http/request'
import type { DictDataVO } from './types'

/** 根据字典类型查询字典数据信息 */
export function getDicts(dictType: string) {
  return request.get<DictDataVO[]>({
    url: `/system/dict/data/type/${dictType}`,
  })
}
