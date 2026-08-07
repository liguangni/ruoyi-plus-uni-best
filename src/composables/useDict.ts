import { reactive, toRefs } from 'vue'
import type { Ref } from 'vue'
import { getDicts } from '@/api/system/dict/data'
import { useDictStore } from '@/store/dict'
import type { DictDataOption, DictDataVO } from '@/api/system/dict/data/types'

const pendingRequests = new Map<string, Promise<DictDataOption[]>>()

/**
 * 获取字典数据
 */
export function useDict(...args: string[]): { [key: string]: Ref<DictDataOption[]> } {
  const res = reactive<{ [key: string]: DictDataOption[] }>({})

  args.forEach(async (dictType) => {
    res[dictType] = []
    const dicts = useDictStore().getDict(dictType)
    if (dicts) {
      res[dictType] = dicts
    }
    else {
      if (!pendingRequests.has(dictType)) {
        const request = getDicts(dictType)
          .then((resp: any) => {
            // 兼容响应数据结构：{ rows: [...] } 或直接为数组
            const rows: DictDataVO[] = resp?.rows || resp || []
            const data = rows.map((p): DictDataOption => {
              const tagTypes = [
                'default',
                'primary',
                'success',
                'warning',
                'danger',
                'volcano',
                'lightblue',
                'cyan',
                'pink',
                'purple',
              ]
              const listClass = p.listClass || 'default'
              const isPresetType = tagTypes.includes(listClass)
              return {
                label: p.dictLabel,
                value: p.dictValue,
                // 预设类型直接用 listClass，否则降级为 default 并通过 tagClass 自定义样式
                tagType: isPresetType ? listClass : 'default',
                tagClass: !isPresetType ? listClass : p.cssClass || '',
                color: '',
                cssClass: p.cssClass,
                listClass: p.listClass,
              }
            })
            useDictStore().setDict(dictType, data)
            return data
          })
          .finally(() => pendingRequests.delete(dictType))
        pendingRequests.set(dictType, request)
      }
      res[dictType] = await pendingRequests.get(dictType)!
    }
  })

  // 转成 ref 返回，保证组件内解构后仍能响应式更新
  return toRefs(res)
}
