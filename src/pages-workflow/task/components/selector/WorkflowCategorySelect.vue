<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { categoryTree } from '@/api/workflow/category'
import type { CategoryTreeVO } from '@/api/workflow/category/types'

interface CatNode {
  value: string | number | undefined
  label: string
  children?: CatNode[]
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    title?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    title: '流程分类',
    placeholder: '请选择分类',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number | undefined): void
  (e: 'confirm', payload: { value: string | number | undefined, label: string }): void
}>()

const showPicker = ref(false)
const tree = ref<CatNode[]>([])
const loaded = ref(false)

const value = ref<string | number | undefined>(undefined)
const label = ref('')

const expandedIds = ref<Set<string>>(new Set())

const rootNodes = computed(() => tree.value)

function mapNode(node: CategoryTreeVO): CatNode {
  return {
    value: node.id,
    label: node.label,
    children: node.children && node.children.length ? node.children.map(mapNode) : undefined,
  }
}

async function ensureTree() {
  if (loaded.value)
    return
  try {
    const res = await categoryTree()
    tree.value = (res || []).map(mapNode)
  }
  catch {
    tree.value = []
  }
  loaded.value = true
}

function findLabel(target: string | number | undefined): string {
  let found = ''
  const walk = (nodes: CatNode[]) => {
    for (const n of nodes) {
      if (String(n.value) === String(target)) {
        found = n.label
        return
      }
      if (n.children)
        walk(n.children)
    }
  }
  walk(rootNodes.value)
  return found
}

function isExpanded(node: CatNode): boolean {
  return expandedIds.value.has(String(node.value))
}

function toggleExpand(node: CatNode) {
  const key = String(node.value)
  if (expandedIds.value.has(key))
    expandedIds.value.delete(key)
  else
    expandedIds.value.add(key)
}

const flatList = computed(() => {
  const result: Array<CatNode & { level: number, hasChildren: boolean, expanded: boolean, isActive: boolean }> = []
  const walk = (nodes: CatNode[], level: number) => {
    for (const node of nodes) {
      const hasChildren = !!(node.children && node.children.length > 0)
      result.push({
        ...node,
        level,
        hasChildren,
        expanded: isExpanded(node),
        isActive: String(node.value) === String(value.value),
      })
      if (hasChildren && isExpanded(node))
        walk(node.children!, level + 1)
    }
  }
  walk(rootNodes.value, 0)
  return result
})

function selectNode(node: CatNode) {
  value.value = node.value
}

function confirmAll() {
  label.value = findLabel(value.value)
  emit('update:modelValue', value.value)
  emit('confirm', { value: value.value, label: label.value })
  showPicker.value = false
}

function clearAll() {
  value.value = undefined
  label.value = ''
  emit('update:modelValue', undefined)
  emit('confirm', { value: undefined, label: '' })
  showPicker.value = false
}

watch(showPicker, async (val) => {
  if (val) {
    await ensureTree()
    value.value = (props.modelValue === '' || props.modelValue == null) ? undefined : (props.modelValue as string | number)
    label.value = findLabel(value.value)
  }
})
</script>

<template>
  <view class="cat-select" @click="showPicker = true">
    <text class="i-carbon-tree-view cat-select__icon" />
    <text class="cat-select__label" :class="{ 'cat-select__label--placeholder': !label }">{{ label || placeholder }}</text>
    <text v-if="label" class="i-carbon-close cat-select__clear" @click.stop="clearAll" />
  </view>

  <view v-if="showPicker" class="cat-popup-overlay" @click.stop="showPicker = false">
    <view class="cat-popup" @click.stop>
      <view class="cat-popup__header">
        <text class="i-carbon-close cat-popup__close" @click="showPicker = false">关闭</text>
        <text class="cat-popup__title">{{ title }}</text>
        <view class="cat-popup__confirm-btn" @click="confirmAll">
          确认
        </view>
      </view>

      <scroll-view class="cat-popup__body" scroll-y>
        <view
          v-for="item in flatList"
          :key="item.value ?? 'all'"
          class="cat-popup__item"
          :class="{ 'is-active': item.isActive }"
          :style="{ paddingLeft: `${24 + item.level * 32}rpx` }"
          @click="selectNode(item)"
        >
          <view
            v-if="item.hasChildren"
            class="cat-popup__expand"
            @click.stop="toggleExpand(item)"
          >
            <text
              class="i-carbon-chevron-down cat-popup__expand-icon"
              :class="{ 'is-expanded': item.expanded }"
            />
          </view>
          <view v-else class="cat-popup__expand cat-popup__expand--placeholder" />
          <text class="cat-popup__item-label">{{ item.label }}</text>
        </view>

        <view v-if="loaded && tree.length === 0" class="cat-popup__empty">
          暂无分类数据
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.cat-select {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666;
  max-width: 220rpx;
  .cat-select__icon {
    font-size: 24rpx;
    flex-shrink: 0;
  }
  .cat-select__label {
    font-size: 24rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140rpx;
  }
  .cat-select__clear {
    font-size: 20rpx;
    color: #999;
    flex-shrink: 0;
  }
}
.cat-popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.cat-popup {
  width: 100%;
  height: 60vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: catSlideUp 0.25s ease;
  .cat-popup__header {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }
  .cat-popup__title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  .cat-popup__close {
    font-size: 28rpx;
    color: #999;
    padding: 8rpx 12rpx;
  }
  .cat-popup__confirm-btn {
    padding: 10rpx 32rpx;
    font-size: 26rpx;
    color: #fff;
    background: #018d71;
    border-radius: 8rpx;
    transition: opacity 0.2s;
  }
  .cat-popup__body {
    flex: 1;
    min-height: 0;
  }
  .cat-popup__item {
    display: flex;
    align-items: center;
    height: 88rpx;
    padding-right: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  .cat-popup__expand {
    width: 64rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cat-popup__expand-icon {
    font-size: 28rpx;
    color: #999;
    transition: transform 0.2s;
  }
  .cat-popup__item-label {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cat-popup__empty {
    display: flex;
    justify-content: center;
    padding: 80rpx 0;
    color: #bbb;
    font-size: 26rpx;
  }
}
@keyframes catSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.cat-select:active {
  opacity: 0.7;
}
.cat-select__label--placeholder {
  color: #bbb;
}
.cat-popup__confirm-btn:active {
  opacity: 0.7;
}
.cat-popup__item:active {
  background: #f5f7fa;
}
.cat-popup__item.is-active {
  background: rgba(1, 141, 113, 0.04);
  .cat-popup__item-label {
    color: #018d71;
    font-weight: 500;
  }
}
.cat-popup__expand--placeholder {
  visibility: hidden;
}
.cat-popup__expand-icon.is-expanded {
  transform: rotate(180deg);
}
</style>
