<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { deptTreeSelect } from '@/api/system/user'
import type { DeptTreeVO } from '@/api/system/dept/types'

/** 部门项最小结构：回显与回传只需 id + label（点击选中时传完整节点也兼容） */
interface DeptItem {
  id: string | number
  label: string
}

const props = withDefaults(
  defineProps<{
    /** 是否显示弹窗（v-model） */
    modelValue: boolean
    /** 单选/多选，默认单选（选部门用于筛选时一般用单选） */
    mode?: 'single' | 'multiple'
    /** 已选部门回显数据（只需 id + label 即可回显） */
    defaultSelected?: DeptItem[]
    /** 是否默认展开所有部门节点（开启后弹窗打开即全展开，仍可手动逐层收起） */
    defaultExpandAll?: boolean
  }>(),
  {
    mode: 'single',
    defaultSelected: () => [],
    defaultExpandAll: true,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', depts: DeptItem[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const deptTree = ref<DeptTreeVO[]>([])
const deptLoading = ref(false)
const expandedDeptIds = ref<Set<string | number>>(new Set())
const selectedDepts = ref<DeptItem[]>([])
const showSelectedPreview = ref(false)

/** 部门名称搜索关键词（输入框即时值，参数名与 PC 端 deptName 保持一致；本地递归过滤无需防抖） */
const deptName = ref('')

/** 加载部门树 */
async function loadDeptTree() {
  deptLoading.value = true
  try {
    const data = await deptTreeSelect()
    deptTree.value = data || []
    // 默认展开所有节点：弹窗打开即全展开（后续仍可手动逐层收起）
    if (props.defaultExpandAll) {
      const ids = new Set<string | number>()
      const walk = (nodes: DeptTreeVO[]) => {
        for (const n of nodes) {
          ids.add(String(n.id))
          if (n.children?.length)
            walk(n.children)
        }
      }
      walk(deptTree.value)
      expandedDeptIds.value = ids
    }
  }
  catch {
    deptTree.value = []
  }
  finally {
    deptLoading.value = false
  }
}

/** 展开/收起部门树节点 */
function toggleExpand(node: DeptTreeVO) {
  const id = String(node.id)
  if (expandedDeptIds.value.has(id))
    expandedDeptIds.value.delete(id)
  else
    expandedDeptIds.value.add(id)
}

/** 判断部门树节点是否处于展开状态 */
function isExpanded(node: DeptTreeVO): boolean {
  return expandedDeptIds.value.has(String(node.id))
}

/** 判断指定部门是否已选中 */
function isSelected(node: DeptTreeVO): boolean {
  return selectedDepts.value.some(d => String(d.id) === String(node.id))
}

/** 点击部门：仅切换选中态，不立即提交；单选再点一次可取消，多选切换勾选；最终以"确认"按钮提交 */
function toggleDept(node: DeptTreeVO) {
  const idx = selectedDepts.value.findIndex(d => String(d.id) === String(node.id))
  if (props.mode === 'single') {
    // 单选：已选中则取消，否则设为唯一选中
    selectedDepts.value = idx >= 0 ? [] : [node]
  }
  else {
    if (idx >= 0)
      selectedDepts.value.splice(idx, 1)
    else
      selectedDepts.value.push(node)
  }
}

/** 从已选列表中移除指定部门（预览弹窗内使用） */
function removeSelected(dept: DeptItem) {
  const idx = selectedDepts.value.findIndex(d => String(d.id) === String(dept.id))
  if (idx >= 0)
    selectedDepts.value.splice(idx, 1)
}

/** 清空已选 */
function clearSelected() {
  if (!selectedDepts.value.length)
    return
  selectedDepts.value = []
}

/** 清空搜索关键词 */
function clearSearch() {
  deptName.value = ''
}

/** 确认选择：回传已选部门并关闭面板 */
function onConfirm() {
  emit('confirm', [...selectedDepts.value])
  selectedDepts.value = []
  showSelectedPreview.value = false
  visible.value = false
}

/** 关闭面板：丢弃未确认的选择 */
function onClose() {
  selectedDepts.value = []
  showSelectedPreview.value = false
  visible.value = false
}

watch(visible, (val) => {
  if (val) {
    // 回显已选部门
    selectedDepts.value = props.defaultSelected.length
      ? [...props.defaultSelected]
      : []
    expandedDeptIds.value = new Set()
    showSelectedPreview.value = false
    deptName.value = ''
    loadDeptTree()
  }
})

/**
 * 按部门名称过滤部门树
 */
function filterDeptTree(nodes: DeptTreeVO[], keyword: string): DeptTreeVO[] {
  const result: DeptTreeVO[] = []
  for (const node of nodes) {
    const children = node.children?.length ? filterDeptTree(node.children, keyword) : []
    const selfMatch = node.label.includes(keyword)
    if (selfMatch || children.length > 0) {
      result.push({ ...node, children })
    }
  }
  return result
}

/** 经搜索过滤后的部门树（无关键词时返回完整树） */
const filteredDeptTree = computed(() => {
  const kw = deptName.value
  if (!kw)
    return deptTree.value
  return filterDeptTree(deptTree.value, kw)
})

/** 当前是否处于搜索状态（用于空态文案与自动展开） */
const hasKeyword = computed(() => deptName.value.trim().length > 0)

/** 将部门树扁平化为带层级/展开/选中状态的列表，供弹窗渲染；搜索时自动展开全部命中分支 */
const flatDeptList = computed(() => {
  const searching = hasKeyword.value
  const result: Array<DeptTreeVO & { level: number, hasChildren: boolean, expanded: boolean, isActive: boolean }> = []
  function walk(nodes: DeptTreeVO[], level: number) {
    for (const node of nodes) {
      const hasChildren = !!(node.children && node.children.length > 0)
      const expanded = searching ? true : isExpanded(node)
      result.push({
        ...node,
        level,
        hasChildren,
        expanded,
        isActive: isSelected(node),
      })
      if (hasChildren && expanded)
        walk(node.children!, level + 1)
    }
  }
  walk(filteredDeptTree.value, 0)
  return result
})

/** 递归收集部门树全部节点（不依赖展开状态），用于"全选"计算作用域 */
function collectAllNodes(nodes: DeptTreeVO[], acc: DeptTreeVO[] = []): DeptTreeVO[] {
  for (const n of nodes) {
    acc.push(n)
    if (n.children?.length)
      collectAllNodes(n.children, acc)
  }
  return acc
}

/** 当前过滤树下的全部节点（全选作用域） */
const allDeptNodes = computed(() => collectAllNodes(filteredDeptTree.value))

/** 当前过滤树下的部门是否全部已选中（驱动全选按钮勾选态） */
const allVisibleSelected = computed(() =>
  allDeptNodes.value.length > 0 && allDeptNodes.value.every(n => isSelected(n)),
)

/** 全选/取消全选：在过滤树范围内切换所有部门的选中状态 */
function toggleSelectAll() {
  const nodes = allDeptNodes.value
  if (!nodes.length)
    return
  const map = new Map(selectedDepts.value.map(d => [String(d.id), d]))
  if (allVisibleSelected.value) {
    nodes.forEach(n => map.delete(String(n.id)))
  }
  else {
    nodes.forEach((n) => {
      if (!map.has(String(n.id)))
        map.set(String(n.id), n)
    })
  }
  selectedDepts.value = Array.from(map.values())
}
</script>

<template>
  <view v-if="visible" class="dept-select-overlay" @click.stop="onClose">
    <view class="dept-select" @click.stop>
      <!-- 顶部 -->
      <view class="dept-select__header">
        <text class="dept-select__title">选择部门</text>
        <view class="dept-select__close" @click="onClose">
          <text class="i-carbon-close" style="font-size: 36rpx" />
        </view>
      </view>

      <!-- 搜索栏：按部门名称过滤 -->
      <view class="dept-select__search">
        <view class="dept-select__search-wrap">
          <text class="i-carbon-search dept-select__search-icon" />
          <input
            class="dept-select__search-input"
            type="text"
            :value="deptName"
            placeholder="请输入部门名称"
            placeholder-class="dept-select__placeholder"
            confirm-type="search"
            @input="(e: any) => deptName = e.detail.value"
          >
          <text v-if="deptName" class="i-carbon-close dept-select__search-clear" @click="clearSearch" />
        </view>
      </view>

      <!-- 批量操作工具栏：展示已选数量 + 预览；多选模式额外显示全选 -->
      <view class="dept-select__toolbar">
        <view class="dept-select__toolbar-left">
          <text class="dept-select__count">已选 {{ selectedDepts.length }} 个部门</text>
          <view
            v-if="selectedDepts.length > 0"
            class="dept-select__preview-btn"
            @click="showSelectedPreview = true"
          >
            <text class="i-carbon-view dept-select__preview-icon" />
            <text>预览</text>
          </view>
        </view>
        <view
          v-if="mode === 'multiple'"
          class="dept-select__toolbar-btn"
          :class="{ 'is-disabled': !flatDeptList.length }"
          @click="toggleSelectAll"
        >
          <text :class="allVisibleSelected ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" class="dept-select__toolbar-icon" />
          <text>全选</text>
        </view>
      </view>

      <!-- 部门树列表 -->
      <scroll-view class="dept-select__body" scroll-y>
        <view
          v-for="item in flatDeptList"
          :key="item.id"
          class="dept-select__item"
          :class="{ 'is-selected': item.isActive }"
          :style="{ paddingLeft: `${24 + item.level * 32}rpx` }"
          @click.stop
        >
          <view
            v-if="item.hasChildren"
            class="dept-select__expand"
            @click.stop="toggleExpand(item)"
          >
            <text
              class="i-carbon-chevron-down dept-select__expand-icon"
              :class="{ 'is-expanded': item.expanded }"
            />
          </view>
          <view v-else class="dept-select__expand dept-select__expand--placeholder" />
          <view class="dept-select__item-content" @click="toggleDept(item)">
            <text class="dept-select__item-label">{{ item.label }}</text>
            <view v-if="mode === 'multiple'" class="dept-select__checkbox" :class="{ 'is-checked': item.isActive }">
              <text v-if="item.isActive" class="i-carbon-checkmark" />
            </view>
            <view v-else class="dept-select__radio" :class="{ 'is-checked': item.isActive }" />
          </view>
        </view>

        <view v-if="deptLoading" class="dept-select__loading">
          <RyLoading text="加载中..." size="28rpx" color="#999" />
        </view>

        <view v-if="!deptLoading && filteredDeptTree.length === 0" class="dept-select__empty">
          <view class="dept-select__empty-icon">
            <text class="i-carbon-building" />
          </view>
          <text class="dept-select__empty-text">{{ hasKeyword ? '未找到相关部门' : '暂无部门数据' }}</text>
        </view>
      </scroll-view>

      <!-- 底部（单选/多选均需点击"确定"才提交选择） -->
      <view class="dept-select__footer">
        <view class="dept-select__footer-left">
          <view
            v-if="selectedDepts.length > 0"
            class="dept-select__clear-btn"
            @click="clearSelected"
          >
            <text class="i-carbon-trash-can" />
            <text>清空</text>
          </view>
        </view>
        <view class="dept-select__footer-right">
          <view class="dept-select__confirm-btn" @click="onConfirm">
            确定
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 已选部门预览弹窗（多选模式） -->
  <view v-if="showSelectedPreview" class="dept-preview-overlay" @click.stop="showSelectedPreview = false">
    <view class="dept-preview" @click.stop>
      <view class="dept-preview__header">
        <text class="dept-preview__title">已选部门列表</text>
        <view class="dept-preview__close" @click="showSelectedPreview = false">
          关闭
        </view>
      </view>
      <scroll-view class="dept-preview__body" scroll-y>
        <view
          v-for="dept in selectedDepts"
          :key="dept.id"
          class="dept-preview__item"
        >
          <view class="dept-preview__item-info">
            <text class="dept-preview__item-name">{{ dept.label }}</text>
          </view>
          <text class="i-carbon-close dept-preview__remove" @click="removeSelected(dept)" />
        </view>
        <view v-if="selectedDepts.length === 0" class="dept-preview__empty">
          <text>暂无已选部门</text>
        </view>
      </scroll-view>
      <view class="dept-preview__toolbar">
        <text class="dept-preview__toolbar-count">已选 {{ selectedDepts.length }} 个部门</text>
        <view
          v-if="selectedDepts.length > 0"
          class="dept-preview__clear"
          @click="clearSelected"
        >
          <text class="i-carbon-trash-can" />
          <text>清空</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.dept-select-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.dept-select {
  width: 100%;
  height: 60vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease;

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28rpx 32rpx;
    position: relative;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }

  &__close {
    position: absolute;
    right: 32rpx;
    font-size: 26rpx;
    color: #999;
    padding: 8rpx;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
    flex-shrink: 0;
  }

  &__toolbar-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-width: 0;
  }

  &__count {
    font-size: 26rpx;
    color: #666;
  }

  &__preview-btn {
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 26rpx;
    color: #018d71;
    padding: 0 8rpx;
  }

  &__preview-icon {
    font-size: 24rpx;
  }

  &__search {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    align-items: center;
    flex-shrink: 0;
    border-bottom: 1rpx solid #f5f5f5;
  }

  &__search-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: #f5f7fa;
    border-radius: 12rpx;
  }

  &__search-input {
    flex: 1;
    min-width: 0;
    font-size: 26rpx;
    color: #333;
    height: 40rpx;
    line-height: 40rpx;
  }

  &__search-icon {
    color: #999;
    font-size: 26rpx;
    flex-shrink: 0;
  }

  &__search-clear {
    color: #bbb;
    font-size: 24rpx;
    flex-shrink: 0;
    padding: 4rpx;
  }

  &__placeholder {
    color: #bbb;
    font-size: 26rpx;
  }

  &__toolbar-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 4rpx;
    color: #018d71;
    font-size: 24rpx;

    &:active {
      opacity: 0.7;
    }

    &.is-disabled {
      opacity: 0.4;
    }
  }

  &__toolbar-icon {
    font-size: 24rpx;
  }

  &__body {
    flex: 1;
    min-height: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 4rpx 24rpx 4rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &.is-selected {
      background: rgba(1, 141, 113, 0.04);

      .dept-select__item-label {
        color: #018d71;
        font-weight: 500;
      }
    }
  }

  &__expand {
    width: 64rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--placeholder {
      visibility: hidden;
    }
  }

  &__expand-icon {
    font-size: 28rpx;
    color: #999;
    transition: transform 0.2s;

    &.is-expanded {
      transform: rotate(180deg);
    }
  }

  &__item-content {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    min-width: 0;
  }

  &__item-label {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__checkbox {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #fff;
    flex-shrink: 0;
    transition: all 0.2s;

    &.is-checked {
      background: #018d71;
      border-color: #018d71;
    }
  }

  &__radio {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s;

    &.is-checked {
      border-color: #018d71;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 18rpx;
        height: 18rpx;
        background: #018d71;
        border-radius: 50%;
      }
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    gap: 12rpx;
    color: #999;
    font-size: 24rpx;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    gap: 20rpx;
  }

  &__empty-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    color: #ccc;
  }

  &__empty-text {
    font-size: 26rpx;
    color: #bbb;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    background: #fff;
  }

  &__footer-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__footer-right {
    display: flex;
    align-items: center;
  }

  &__clear-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: #999;
    font-size: 24rpx;
  }

  &__confirm-btn {
    padding: 10rpx 32rpx;
    font-size: 26rpx;
    color: #fff;
    background: #018d71;
    border-radius: 8rpx;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.7;
    }
  }
}

.dept-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.dept-preview {
  width: 100%;
  height: 50vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }

  &__close {
    color: #999;
    font-size: 26rpx;
    padding: 8rpx;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f5f5f5;
    flex-shrink: 0;
    background: #fff;
  }

  &__toolbar-count {
    font-size: 26rpx;
    color: #666;
  }

  &__clear {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: #999;
    font-size: 24rpx;
  }

  &__body {
    flex: 1;
    min-height: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }

  &__item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
  }

  &__item-name {
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__remove {
    font-size: 28rpx;
    color: #999;
    padding: 8rpx;
    flex-shrink: 0;
  }

  &__empty {
    display: flex;
    justify-content: center;
    padding: 80rpx 0;
    color: #bbb;
    font-size: 26rpx;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
