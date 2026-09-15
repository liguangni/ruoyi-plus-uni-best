<script lang="ts" setup>
import { ref } from 'vue'
import { useDict } from '@/composables/useDict'
import { navigateToDetail } from '../utils/workflow'
import type { ApprovalTabbarType, FlowTaskItemInfo, WfListQuery } from '../utils/workflow'
import WorkflowSearchBar from './WorkflowSearchBar.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'

const props = defineProps<{
  tabType: ApprovalTabbarType
  apiFn: (params: WfListQuery) => Promise<{ rows?: unknown[], total?: number }>
}>()

const { wf_business_status, wf_task_status } = useDict('wf_business_status', 'wf_task_status')

const searchBarRef = ref<InstanceType<typeof WorkflowSearchBar> | null>(null)
const pagingRef = ref<any>()
const dataList = ref<FlowTaskItemInfo[]>([])
const customLoading = ref(true)
const isRefreshing = ref(false)

/**
 * z-paging 驱动：首屏 / 下拉刷新 / 上拉加载，真实分页唯一入口。
 */
async function onQuery(pageNo: number, pageSize: number) {
  if (pageNo === 1 && isRefreshing.value) {
    pagingRef.value?.complete(false)
    return
  }
  if (pageNo === 1)
    isRefreshing.value = true

  try {
    const searchParams = searchBarRef.value?.getParams() ?? {}
    const res = await props.apiFn({
      ...searchParams,
      pageNum: pageNo,
      pageSize,
    })
    pagingRef.value?.completeByTotal(res?.rows || [], res?.total ?? 0)
  }
  catch {
    pagingRef.value?.complete(false)
  }
  finally {
    if (pageNo === 1)
      isRefreshing.value = false
    customLoading.value = false
  }
}

function onSearch() {
  customLoading.value = true
  pagingRef.value?.reload()
}

function handleRowClick(row: FlowTaskItemInfo) {
  const taskId = row.id || undefined
  const businessId = row.businessId || undefined
  navigateToDetail({
    taskId,
    businessId,
    from: props.tabType,
  })
}
</script>

<template>
  <view class="wf-list">
    <WorkflowSearchBar ref="searchBarRef" :tab-type="tabType" @search="onSearch" />

    <view class="wf-list__body">
      <z-paging
        ref="pagingRef"
        v-model="dataList"
        class="wf-list__paging"
        :fixed="false"
        :default-page-size="10"
        @query="onQuery"
      >
        <template #empty>
          <EmptyState icon="no-list" text="暂无数据" />
        </template>

        <view
          v-for="row in dataList"
          :key="row.id"
          class="wf-card"
          @click="handleRowClick(row)"
        >
          <view class="wf-card__head">
            <text class="wf-card__title">{{ row.flowName }}</text>
            <DictTag
              v-if="tabType === 'finish'"
              :options="wf_task_status"
              :value="row.flowTaskStatus"
            />
            <DictTag
              v-else
              :options="wf_business_status"
              :value="row.flowStatus"
            />
          </view>

          <view class="wf-card__rows">
            <view class="wf-card__row">
              <text class="wf-card__row-label">业务编码</text>
              <text class="wf-card__row-value">{{ row.businessCode || '-' }}</text>
            </view>
            <view class="wf-card__row">
              <text class="wf-card__row-label">申请人</text>
              <text class="wf-card__row-value">{{ row.createByName || '-' }}</text>
            </view>
            <view class="wf-card__row">
              <text class="wf-card__row-label">提交时间</text>
              <text class="wf-card__row-value">{{ row.createTime ? String(row.createTime) : '-' }}</text>
            </view>
            <view class="wf-card__row">
              <text class="wf-card__row-label">当前任务</text>
              <text class="wf-card__row-value">{{ row.nodeName || '-' }}</text>
            </view>
          </view>
        </view>
      </z-paging>

      <view v-if="customLoading" class="wf-list__overlay">
        <view class="wf-list__spinner" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.wf-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;

  &__body {
    position: relative;
    flex: 1;
    min-height: 0;
  }

  &__paging {
    height: 100%;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    display: flex;
    justify-content: center;
    padding-top: 40rpx;
    pointer-events: none;
  }

  &__spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #e5e7eb;
    border-top-color: #018d71;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

.wf-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 0;
  margin: 20rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

  &:active {
    background: #fafafa;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 28rpx 32rpx 24rpx;
    border-bottom: 1rpx solid #e5e5e5;
  }

  &__title {
    flex: 1;
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    padding: 24rpx 32rpx 28rpx;
  }

  &__row {
    display: flex;
    align-items: center;
    padding: 14rpx 0;
  }

  &__row-label {
    font-size: 26rpx;
    color: #999;
    width: 140rpx;
    flex-shrink: 0;
  }

  &__row-value {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
