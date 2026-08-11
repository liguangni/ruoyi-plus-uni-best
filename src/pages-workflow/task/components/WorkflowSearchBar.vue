<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import type { UserVO } from '@/api/system/user/types'
import type { FlowDefinitionVo } from '@/api/workflow/definition/types'
import type { ApprovalTabbarType, WfListQuery } from '../utils/workflow'
import WorkflowDefinitionSelect from './selector/WorkflowDefinitionSelect.vue'

const props = defineProps<{
  tabType: ApprovalTabbarType
}>()

const emit = defineEmits<{
  (e: 'search'): void
}>()

// 选中的流程定义
const selectedDef = ref<FlowDefinitionVo | null>(null)
// 选中的申请人
const selectedUsers = ref<UserVO[]>([])

const defOpen = ref(false)
const applicantShow = ref(false)

/**
 * 查询条件
 */
const paramsState = reactive<Partial<WfListQuery>>({
  flowCode: undefined,
  createByIds: undefined,
})

/** 对外暴露：获取当前查询条件 */
function getParams(): Partial<WfListQuery> {
  return { ...paramsState }
}
defineExpose({ getParams })

/** 「我发起(document)」页申请人恒为当前用户，该筛选无意义，禁用并灰显 */
const applicantDisabled = computed(() => props.tabType === 'document')

watch(
  applicantDisabled,
  (v) => {
    if (!v)
      return
    applicantShow.value = false
    selectedUsers.value = []
    paramsState.createByIds = undefined
  },
  { immediate: true },
)

const defTitle = computed(() => selectedDef.value?.flowName || '流程定义')
const applicantTitle = computed(() => {
  if (!selectedUsers.value.length)
    return '申请人'
  if (selectedUsers.value.length === 1)
    return selectedUsers.value[0].nickName || selectedUsers.value[0].userName
  return `已选 ${selectedUsers.value.length} 人`
})

/** 流程定义筛选确认 */
function onDefConfirm(defs: FlowDefinitionVo[]) {
  const def = defs.length ? defs[0] : null
  selectedDef.value = def
  const category = def?.category as unknown as string | number | undefined
  paramsState.flowCode = def?.flowCode || undefined
  emit('search')
}

/** 申请人筛选确认 */
function onApplicantConfirm(users: UserVO[]) {
  selectedUsers.value = users
  const ids = applicantDisabled.value ? [] : users.map(u => u.userId)
  paramsState.createByIds = ids.length > 0 ? ids : undefined
  emit('search')
}

/** 打开流程定义筛选器 */
function openDef() {
  if (applicantShow.value)
    applicantShow.value = false
  defOpen.value = !defOpen.value
}

/** 打开申请人筛选器 */
function openApplicant() {
  if (applicantDisabled.value)
    return
  if (defOpen.value)
    defOpen.value = false
  applicantShow.value = true
}
</script>

<template>
  <view class="search-bar">
    <view class="search-bar__tabs">
      <view class="search-bar__tab" :class="{ 'is-active': defOpen }" @click="openDef">
        <text class="search-bar__tab-text">{{ defTitle }}</text>
        <text class="i-carbon-chevron-down search-bar__tab-arrow" :class="{ 'is-up': defOpen }" />
      </view>
      <view
        class="search-bar__tab"
        :class="{ 'is-active': applicantShow, 'is-disabled': applicantDisabled }"
        @click="openApplicant"
      >
        <text class="search-bar__tab-text">{{ applicantTitle }}</text>
        <text class="i-carbon-chevron-down search-bar__tab-arrow" :class="{ 'is-up': applicantShow }" />
      </view>
    </view>

    <!-- 流程定义选择 -->
    <WorkflowDefinitionSelect
      v-model="defOpen"
      mode="single"
      :default-selected="selectedDef ? [selectedDef] : []"
      @confirm="onDefConfirm"
    />

    <!-- 申请人选择组件 -->
    <UserSelector v-model="applicantShow" mode="multiple" :default-selected="selectedUsers" @confirm="onApplicantConfirm" />
  </view>
</template>

<style lang="scss" scoped>
.search-bar {
  position: relative;
  z-index: 50;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;

  .search-bar__tabs {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: stretch;
  }

  .search-bar__tab {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    height: 80rpx;
    font-size: 28rpx;
    color: #333;

    .search-bar__tab-text {
      max-width: 280rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 箭头基础态置于 search-bar 下（与原始特异性一致），禁用态覆盖见下方扁平规则
  .search-bar__tab-arrow {
    font-size: 22rpx;
    color: #999;
    transition: transform 0.2s;
  }
}

// 同体/相邻关系，扁平避免后代误匹配（嵌套过深会使基类高于修饰符而失效）
.search-bar__tab + .search-bar__tab {
  border-left: 1rpx solid #f0f0f0;
}

.search-bar__tab:not(.is-disabled):active {
  background: #f5f7fa;
}

.search-bar__tab.is-active {
  color: #018d71;
}

.search-bar__tab.is-disabled {
  color: #bbb;
  background: none;
  pointer-events: none;

  .search-bar__tab-arrow {
    color: #bbb;
  }
}

.search-bar__tab-arrow.is-up {
  transform: rotate(180deg);
}
</style>
