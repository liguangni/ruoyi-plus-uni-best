import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DictDataOption } from '@/api/system/dict/data/types'

const pendingRequests = new Map<string, Promise<DictDataOption[]>>()

export const useDictStore = defineStore('dict', () => {
  const dict = ref<Map<string, DictDataOption[]>>(new Map())

  /**
   * 获取字典
   * @param key 字典类型
   */
  const getDict = (key: string): DictDataOption[] | null => {
    if (!key)
      return null
    return dict.value.get(key) || null
  }

  /**
   * 设置字典
   * @param key 字典类型
   * @param value 字典数据
   */
  const setDict = (key: string, value: DictDataOption[]) => {
    if (!key)
      return false
    try {
      dict.value.set(key, value)
      return true
    }
    catch (e) {
      console.error('Error in setDict:', e)
      return false
    }
  }

  /**
   * 删除字典
   * @param key 字典类型
   */
  const removeDict = (key: string): boolean => {
    if (!key)
      return false
    return dict.value.delete(key)
  }

  /**
   * 清空字典
   */
  const cleanDict = (): void => {
    dict.value.clear()
  }

  return {
    dict,
    getDict,
    setDict,
    removeDict,
    cleanDict,
  }
})
