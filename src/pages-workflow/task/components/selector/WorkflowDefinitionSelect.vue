<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { listDefinition } from '@/api/workflow/definition'
import type { FlowDefinitionVo } from '@/api/workflow/definition/types'
import WorkflowCategorySelect from './WorkflowCategorySelect.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    /** 单选/多选，默认单选 */
    mode?: 'single' | 'multiple'
    /** 已选回显数据（单选传单个，多选传数组） */
    defaultSelected?: FlowDefinitionVo | FlowDefinitionVo[]
  }>(),
  {
    modelValue: false,
    mode: 'single',
    defaultSelected: () => [] as FlowDefinitionVo[],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', defs: FlowDefinitionVo[]): void
}>()

const show = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const keyword = ref('')
const categoryId = ref<string | number | undefined>(undefined)

const list = ref<FlowDefinitionVo[]>([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)

const selectedDefs = ref<FlowDefinitionVo[]>([])

const selectedIds = computed(() => new Set(selectedDefs.value.map(d => d.id)))
/** 当前已加载流程是否全部被选中（用于全选按钮自适应状态） */
const allLoadedSelected = computed(() =>
  list.value.length > 0 && list.value.every(d => selectedIds.value.has(d.id)),
)

let timer: ReturnType<typeof setTimeout> | null = null

/** 分页加载流程定义列表，reset 为 true 时重置分页并从第一页重新加载 */
async function loadList(reset = false) {
  if (loading.value)
    return
  if (reset) {
    page.value = 1
    finished.value = false
    list.value = []
  }
  if (finished.value)
    return
  loading.value = true
  try {
    const resp = await listDefinition({
      pageNum: page.value,
      pageSize,
      flowName: keyword.value || undefined,
      category: categoryId.value,
      isPublish: 1,
    })
    const rows = resp.rows || []
    if (page.value === 1)
      list.value = rows
    else
      list.value.push(...rows)
    if (rows.length < pageSize)
      finished.value = true
    page.value++
  }
  catch {
    // ignore
  }
  finally {
    loading.value = false
  }
}

/** 输入防抖：停止输入 300ms 后重置并重新加载列表 */
function onSearchInput() {
  if (timer)
    clearTimeout(timer)
  timer = setTimeout(() => loadList(true), 300)
}

/** 分类选择确认：记录选中分类并重新加载列表 */
function onCategoryConfirm({ value }: { value: string | number }) {
  categoryId.value = value
  loadList(true)
}

/** 判断指定流程定义是否已被选中 */
function isSelected(def: FlowDefinitionVo): boolean {
  return selectedDefs.value.some(d => d.id === def.id)
}

/** 切换流程定义选中状态：单选模式再次点击可取消，多选模式可增删 */
function toggleDef(def: FlowDefinitionVo) {
  if (props.mode === 'single') {
    if (isSelected(def))
      selectedDefs.value = []
    else
      selectedDefs.value = [def]
    return
  }
  const idx = selectedDefs.value.findIndex(d => d.id === def.id)
  if (idx >= 0)
    selectedDefs.value.splice(idx, 1)
  else
    selectedDefs.value.push(def)
}

/** 全选/取消全选：依据当前已加载数据的选中态整体切换 */
function toggleSelectAll() {
  if (!list.value.length)
    return
  const map = new Map(selectedDefs.value.map(d => [d.id, d]))
  if (allLoadedSelected.value) {
    list.value.forEach(d => map.delete(d.id))
  }
  else {
    list.value.forEach((d) => {
      if (!map.has(d.id))
        map.set(d.id, d)
    })
  }
  selectedDefs.value = Array.from(map.values())
}

/** 清空当前已选的流程定义 */
function clearSelected() {
  selectedDefs.value = []
}

const showPreview = ref(false)

/** 从已选列表中移除指定流程定义（预览弹窗内使用） */
function removeSelected(def: FlowDefinitionVo) {
  const idx = selectedDefs.value.findIndex(d => d.id === def.id)
  if (idx >= 0)
    selectedDefs.value.splice(idx, 1)
}

/** 确认选择：回传已选结果并关闭面板 */
function onConfirm() {
  emit('confirm', [...selectedDefs.value])
  show.value = false
}

/** 关闭面板：丢弃未确认的选择 */
function onClose() {
  selectedDefs.value = []
  show.value = false
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const ds = props.defaultSelected
      selectedDefs.value = ds ? (Array.isArray(ds) ? [...ds] : [ds]) : []
      loadList(true)
    }
    else {
      selectedDefs.value = []
    }
  },
)

/** 组件卸载时清理未执行的搜索防抖 timer，避免回调写入已卸载组件的 ref */
onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<template>
  <view v-if="show" class="def-sheet">
    <view class="def-sheet__mask" @click.stop="onClose" />
    <view class="def-sheet__panel" @click.stop>
      <view class="def-sheet__header">
        <text class="def-sheet__title">选择流程定义</text>
        <view class="def-sheet__close" @click="onClose">
          <text class="i-carbon-close" style="font-size: 36rpx" />
        </view>
      </view>

      <view class="def-sheet__filter">
        <view class="def-sheet__search-wrap">
          <text class="i-carbon-search def-sheet__search-icon" />
          <input
            class="def-sheet__search-input"
            type="text"
            :value="keyword"
            placeholder="请输入流程定义名称"
            placeholder-class="def-sheet__placeholder"
            confirm-type="search"
            @input="(e: any) => { keyword = e.detail.value; onSearchInput() }"
          >
          <text v-if="keyword" class="i-carbon-close def-sheet__search-clear" @click="keyword = ''; loadList(true)" />
        </view>
      </view>

      <view class="def-sheet__toolbar">
        <view class="def-sheet__toolbar-left">
          <text class="def-sheet__count">已选 {{ selectedDefs.length }} 个</text>
          <view
            v-if="selectedDefs.length"
            class="def-sheet__preview-btn"
            @click="showPreview = true"
          >
            <text class="i-carbon-view def-sheet__preview-icon" />
            <text>预览</text>
          </view>
        </view>
        <view
          v-if="mode === 'multiple'"
          class="def-sheet__toolbar-btn"
          :class="{ 'is-disabled': !list.length }"
          @click="toggleSelectAll"
        >
          <text :class="allLoadedSelected ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" class="def-sheet__toolbar-icon" />
          <text>全选</text>
        </view>
      </view>

      <scroll-view class="def-sheet__list" scroll-y @scrolltolower="() => loadList()">
        <view
          v-for="def in list"
          :key="def.id"
          class="def-sheet__item"
          :class="{ 'is-selected': isSelected(def) }"
          @click="toggleDef(def)"
        >
          <view class="def-sheet__item-main">
            <text class="def-sheet__item-name">{{ def.flowName }}</text>
            <text class="def-sheet__item-meta">{{ def.flowCode }} · {{ def.categoryName || '未分类' }} · v{{ def.version }}</text>
          </view>
          <view class="def-sheet__item-right">
            <view
              v-if="mode === 'multiple'"
              class="def-sheet__checkbox"
              :class="{ 'is-checked': isSelected(def) }"
            >
              <text v-if="isSelected(def)" class="i-carbon-checkmark" />
            </view>
            <view
              v-else
              class="def-sheet__radio"
              :class="{ 'is-checked': isSelected(def) }"
            />
          </view>
        </view>

        <view v-if="loading" class="def-sheet__tip">
          <RyLoading text="加载中..." size="28rpx" color="#999" />
        </view>
        <view v-else-if="finished && list.length" class="def-sheet__tip">
          没有更多了
        </view>
        <view v-else-if="!loading && !list.length" class="def-sheet__empty">
          <text class="i-carbon-document-blank def-sheet__empty-icon" />
          <text class="def-sheet__empty-text">暂无流程定义</text>
        </view>
      </scroll-view>

      <view class="def-sheet__footer">
        <view class="def-sheet__footer-left">
          <WorkflowCategorySelect
            v-model="categoryId"
            placeholder="全部分类"
            @confirm="onCategoryConfirm"
          />
        </view>
        <view class="def-sheet__footer-right">
          <view class="def-sheet__confirm-btn" @click="onConfirm">
            确定
          </view>
        </view>
      </view>
    </view>

    <!-- 已选流程定义预览 -->
    <view v-if="showPreview" class="def-preview-overlay" @click.stop="showPreview = false">
      <view class="def-preview-popup" @click.stop>
        <view class="def-preview-popup__header">
          <text class="def-preview-popup__title">已选流程定义列表</text>
          <view class="def-preview-popup__close" @click="showPreview = false">
            关闭
          </view>
        </view>
        <scroll-view class="def-preview-popup__body" scroll-y>
          <view
            v-for="def in selectedDefs"
            :key="def.id"
            class="def-preview-popup__item"
          >
            <view class="def-preview-popup__item-main">
              <text class="def-preview-popup__item-name">{{ def.flowName }}</text>
              <text class="def-preview-popup__item-meta">{{ def.flowCode }} · {{ def.categoryName || '未分类' }} · v{{ def.version }}</text>
            </view>
            <text class="i-carbon-close def-preview-popup__remove" @click="removeSelected(def)" />
          </view>
          <view v-if="selectedDefs.length === 0" class="def-preview-popup__empty">
            暂无已选流程定义
          </view>
        </scroll-view>
        <view class="def-preview-popup__toolbar">
          <text class="def-preview-popup__toolbar-count">已选 {{ selectedDefs.length }} 个</text>
          <view
            v-if="selectedDefs.length"
            class="def-preview-popup__clear"
            @click="clearSelected"
          >
            <text class="i-carbon-trash-can" />
            <text>清空</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.def-sheet {
  position: fixed;
  inset: 0;
  z-index: 1000;
  .def-sheet__mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
  }
  .def-sheet__panel {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 75vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    overflow: hidden;
    animation: sheetUp 0.25s ease;
  }
  .def-sheet__header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }
  .def-sheet__title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  .def-sheet__close {
    position: absolute;
    right: 32rpx;
    padding: 8rpx;
    color: #999;
  }
  .def-sheet__filter {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }
  .def-sheet__search-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: #f5f7fa;
    border-radius: 10rpx;
  }
  .def-sheet__search-input {
    flex: 1;
    min-width: 0;
    font-size: 26rpx;
    color: #333;
    height: 40rpx;
    line-height: 40rpx;
  }
  .def-sheet__search-icon {
    font-size: 26rpx;
    color: #999;
    flex-shrink: 0;
  }
  .def-sheet__search-clear {
    color: #bbb;
    font-size: 24rpx;
    flex-shrink: 0;
    padding: 4rpx;
  }
  .def-sheet__placeholder {
    color: #bbb;
    font-size: 26rpx;
  }
  .def-sheet__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
    flex-shrink: 0;
  }
  .def-sheet__toolbar-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  .def-sheet__toolbar-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 4rpx;
    color: #018d71;
    font-size: 24rpx;
  }
  .def-sheet__toolbar-icon {
    font-size: 24rpx;
  }
  .def-sheet__list {
    flex: 1;
    min-height: 0;
  }
  .def-sheet__item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  .def-sheet__item-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
  }
  .def-sheet__item-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-sheet__item-meta {
    font-size: 22rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-sheet__item-right {
    flex-shrink: 0;
    margin-left: 16rpx;
  }
  .def-sheet__checkbox {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #fff;
    transition: all 0.2s;
  }
  .def-sheet__radio {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;
    position: relative;
    transition: all 0.2s;
  }
  .def-sheet__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    background: #fff;
  }
  .def-sheet__count {
    font-size: 26rpx;
    color: #666;
  }
  .def-sheet__footer-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  .def-sheet__footer-right {
    display: flex;
    align-items: center;
  }
  .def-sheet__confirm-btn {
    padding: 10rpx 32rpx;
    font-size: 26rpx;
    color: #fff;
    background: #018d71;
    border-radius: 8rpx;
    transition: opacity 0.2s;
  }
  .def-sheet__preview-btn {
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 26rpx;
    color: #018d71;
    padding: 0 8rpx;
  }
  .def-sheet__preview-icon {
    font-size: 24rpx;
  }
  .def-sheet__tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 30rpx 0;
    font-size: 24rpx;
    color: #999;
  }
  .def-sheet__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80rpx 0;
    gap: 16rpx;
  }
  .def-sheet__empty-icon {
    font-size: 64rpx;
    color: #ccc;
  }
  .def-sheet__empty-text {
    font-size: 26rpx;
    color: #bbb;
  }
}
.def-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.def-preview-popup {
  width: 100%;
  height: 50vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: defPreviewUp 0.25s ease;
  .def-preview-popup__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }
  .def-preview-popup__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }
  .def-preview-popup__close {
    font-size: 26rpx;
    color: #999;
    padding: 8rpx;
  }
  .def-preview-popup__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f5f5f5;
    flex-shrink: 0;
    background: #fff;
  }
  .def-preview-popup__toolbar-count {
    font-size: 26rpx;
    color: #666;
  }
  .def-preview-popup__clear {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: #999;
    font-size: 24rpx;
  }
  .def-preview-popup__body {
    flex: 1;
    min-height: 0;
  }
  .def-preview-popup__item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }
  .def-preview-popup__item-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
  }
  .def-preview-popup__item-name {
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-preview-popup__item-meta {
    font-size: 22rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-preview-popup__remove {
    font-size: 28rpx;
    color: #999;
    padding: 8rpx;
    flex-shrink: 0;
  }
  .def-preview-popup__empty {
    display: flex;
    justify-content: center;
    padding: 80rpx 0;
    color: #bbb;
    font-size: 26rpx;
  }
}
@keyframes defPreviewUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes sheetUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
@keyframes defSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.def-sheet__toolbar-btn:active {
  opacity: 0.7;
}
.def-sheet__toolbar-btn.is-disabled {
  opacity: 0.4;
}
.def-sheet__item:active {
  background: #f5f7fa;
}
.def-sheet__item.is-selected {
  background: rgba(1, 141, 113, 0.04);
}
.def-sheet__checkbox.is-checked {
  background: #018d71;
  border-color: #018d71;
}
.def-sheet__radio.is-checked::after {
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
.def-sheet__radio.is-checked {
  border-color: #018d71;
}
.def-sheet__confirm-btn:active {
  opacity: 0.7;
}
</style>
