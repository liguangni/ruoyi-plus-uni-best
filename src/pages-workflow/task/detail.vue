<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onBackPress, onLoad } from '@dcloudio/uni-app'
import type { ButtonPermissionVo } from '@/api/workflow/task/types'
import { getTask } from '@/api/workflow/task'
import { getInstanceInfoByBusinessId } from '@/api/workflow/instance'
import { useDict } from '@/composables/useDict'
import WorkflowActions from './components/WorkflowActions.vue'
import FlowFormRenderer from './components/form/FlowFormRenderer.vue'
import TaskHistoryPanel from './components/TaskHistoryPanel.vue'
import { isApprovalTabbarType, jumpToApprovalList } from '@/pages-workflow/task/utils/workflow'
import type { ApprovalTabbarType, FlowTaskItemInfo } from '@/pages-workflow/task/utils/workflow'

const { wf_business_status } = useDict('wf_business_status')

definePage({
  style: {
    navigationBarTitleText: '流程详情',
  },
})

// 路由参数
const businessId = ref('')
const taskId = ref('')
/** 来源列表 tab：直接驱动底部操作栏显隐、按钮类型与返回跳转 */
const from = ref<ApprovalTabbarType>('waiting')

// 数据状态
const loading = ref(false)
/**
 * 详情页统一视图模型
 */
const taskInfo = ref<FlowTaskItemInfo | null>(null)
/** 按钮权限：只有 waiting 源有，其他源为空数组（WorkflowActions 按空权限隐藏审批操作） */
const buttonList = ref<ButtonPermissionVo[]>([])

// UI 状态
const activeTab = ref(0)
const tabs = ['流程详情', '审批信息']

const headerTitle = computed(() => taskInfo.value?.businessTitle || taskInfo.value?.flowName || '流程详情')

/** 校验必要参数是否齐全 */
function validateParams(): boolean {
  if (from.value === 'waiting' && !taskId.value) {
    uni.showToast({ title: '缺少任务ID', icon: 'none' })
    return false
  }
  if (from.value !== 'waiting' && !businessId.value) {
    uni.showToast({ title: '缺少业务ID', icon: 'none' })
    return false
  }
  return true
}

onLoad((q) => {
  businessId.value = String(q?.businessId || '')
  taskId.value = String(q?.taskId || '')
  const rawFrom = String(q?.from || '')
  from.value = isApprovalTabbarType(rawFrom) ? rawFrom : 'waiting'
  if (validateParams())
    load()
})

/**
 * 加载详情页数据
 */
async function load() {
  loading.value = true
  try {
    if (from.value === 'waiting') {
      const taskItem = await getTask(taskId.value)
      if (taskItem?.businessId) {
        businessId.value = String(taskItem.businessId)
      }
      buttonList.value = taskItem?.buttonList ?? []
      taskInfo.value = { ...taskItem }
    }
    else {
      const instanceItem = await getInstanceInfoByBusinessId(businessId.value)
      businessId.value = String(instanceItem?.businessId || '')
      buttonList.value = []
      taskInfo.value = { ...instanceItem }
    }
  }
  catch {
    uni.showToast({ title: '详情加载失败，请稍后再试', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
  finally {
    loading.value = false
  }
}

/** 返回列表页：重定向到来源列表，携带 tab 参数 */
function backToList() {
  jumpToApprovalList(from.value)
}

/** 拦截系统返回（导航栏返回键 / 手势），统一回到来源列表 */
onBackPress(() => {
  backToList()
  return true
})

/**
 * 是否显示底部操作栏
 */
const showFooter = computed(() => {
  if (!taskInfo.value)
    return false
  if (!(from.value === 'waiting' || from.value === 'document'))
    return false
  const flowStatus = taskInfo.value.flowStatus
  if (!flowStatus)
    return false
  if (['finish', 'invalid'].includes(flowStatus))
    return false
  return true
})

/** 后端按钮权限字典  */
const buttonPermissions = computed(() => {
  const record: Record<string, boolean> = {}
  if (!buttonList.value || buttonList.value.length === 0)
    return record
  buttonList.value.forEach((item) => {
    record[item.code] = !!item.show
  })
  return record
})
</script>

<template>
  <view class="page-container bg-light">
    <view v-if="loading" class="detail-loading">
      <RyLoading />
    </view>

    <template v-else>
      <!-- 顶部信息 -->
      <view class="detail-header pb-0">
        <view class="detail-header__top">
          <view class="detail-header__title-wrap">
            <text class="detail-header__title">{{ headerTitle }}</text>
          </view>
          <DictTag
            v-if="taskInfo?.flowStatus"
            :options="wf_business_status"
            :value="taskInfo.flowStatus"
          />
        </view>

        <view class="detail-header__info">
          <view v-if="taskInfo?.businessId" class="detail-header__info-item">
            <text class="detail-header__info-label">编号：</text>
            <text class="detail-header__info-value">{{ taskInfo.id }}</text>
          </view>
          <view class="detail-header__info-item">
            <text class="detail-header__info-label">申请人：</text>
            <text class="detail-header__info-value">{{ taskInfo?.createByName || '--' }}</text>
          </view>
          <view class="detail-header__info-item">
            <text class="detail-header__info-label">申请时间：</text>
            <text class="detail-header__info-value">{{ taskInfo?.createTime || '--' }}</text>
          </view>
        </view>
      </view>

      <!-- Tab 切换 -->
      <view class="detail-tabs">
        <view
          v-for="(tab, idx) in tabs"
          :key="idx"
          :title="tab"
          class="detail-tabs__item"
          :class="{ 'is-active': activeTab === idx }"
          @click="activeTab = idx"
        >
          <text>{{ tab }}</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <scroll-view class="detail-body py-1" scroll-y>
        <view v-show="activeTab === 0" class="detail-panel">
          <view class="task-form-panel__form">
            <FlowFormRenderer :form-path="taskInfo?.formPath || ''" :business-id="businessId" readonly />
          </view>
        </view>

        <view v-show="activeTab === 1" class="detail-panel">
          <TaskHistoryPanel :business-id="businessId" />
        </view>
      </scroll-view>

      <!-- 底部操作栏 -->
      <view v-if="showFooter" class="detail-footer">
        <WorkflowActions :task="taskInfo" :button-permissions="buttonPermissions" :from="from" />
      </view>
    </template>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .detail-loading {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.detail-header {
  background: #fff;
  padding: 32rpx;

  .detail-header__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .detail-header__title-wrap {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      flex: 1;
      min-width: 0;

      .detail-header__title {
        font-size: 34rpx;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.4;
      }
    }
  }

  .detail-header__code {
    font-size: 24rpx;
    color: #999;
  }

  .detail-header__info {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f5f5f5;

    .detail-header__info-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      min-width: 0;
      font-size: 24rpx;

      .detail-header__info-label {
        color: #999;
        flex-shrink: 0;
      }

      .detail-header__info-value {
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.detail-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;

  .detail-tabs__item {
    flex: 1;
    padding: 28rpx 0;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    transition: color 0.2s;
  }
}

.detail-body {
  flex: 1;
  min-height: 0;
  //padding: 24rpx;
  box-sizing: border-box;

  .detail-panel {
    min-height: 100%;
    box-sizing: border-box;
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx;

    .task-form-panel__form {
      padding: 0 28rpx 32rpx;
    }
  }
}

.detail-footer {
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

// 同体修饰符 + 伪元素，保持扁平避免后代误匹配（否则会被 .detail-tabs .detail-tabs__item 的特异性盖过）
.detail-tabs__item.is-active {
  color: #018d71;
  font-weight: 600;
}

.detail-tabs__item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  background: #018d71;
  border-radius: 3rpx;
}
</style>
