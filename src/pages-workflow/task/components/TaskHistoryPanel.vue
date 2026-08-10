<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { listByIds } from '@/api/system/oss'
import type { OssVO } from '@/api/system/oss/types'
import { useDict } from '@/composables/useDict'
import { getEnvBaseUrl } from '@/utils'
import { useTokenStore } from '@/store'
import WorkflowSteps from './WorkflowSteps.vue'
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'
import { flowHisTaskList } from '@/api/workflow/instance'

interface HistoryItem {
  nodeName?: string
  approverName?: string
  approveName?: string
  nickName?: string
  flowStatus?: string
  message?: string
  createTime?: string
  updateTime?: string
  runDuration?: string
  ext?: string
  attachmentList?: OssVO[]
}

const props = defineProps<{
  businessId: string
}>()

const { wf_task_status } = useDict('wf_task_status')
const history = ref<HistoryItem[]>([])
const loading = ref(false)
const previewVisible = ref(false)
const previewFiles = ref<OssVO[]>([])
const approverVisible = ref(false)
const approverNames = ref<string[]>([])
/** 审批历史返回的实例ID：流程图跳转用 */
const instanceId = ref<string>('')

onMounted(load)
watch(() => props.businessId, load)

/** 拉审批历史 */
async function fetchTaskList(): Promise<{ list: HistoryItem[], instanceId: string }> {
  if (!props.businessId)
    return { list: [], instanceId: '' }
  const result = await flowHisTaskList(props.businessId)
  instanceId.value = result?.instanceId || ''
  return { list: (result?.list || []) as HistoryItem[], instanceId: instanceId.value }
}

/** 加载审批流转记录 */
async function load() {
  if (!props.businessId)
    return

  loading.value = true
  try {
    const { list } = await fetchTaskList()

    // 并行拉取每个节点的附件信息
    await Promise.all(list.map(async (item) => {
      if (item.ext) {
        try {
          item.attachmentList = await listByIds(item.ext) || []
        }
        catch {
          item.attachmentList = []
        }
      }
      else {
        item.attachmentList = []
      }
    }))

    // 反转：审批记录按时间正序展示（最早的节点在顶部，最新的在底部）
    history.value = [...list].reverse()
  }
  catch (error) {
    console.error('加载审批记录失败:', error)
    uni.showToast({ title: '审批历史加载失败', icon: 'none' })
  }
  finally {
    loading.value = false
  }
}

/** 办理人 */
function approverName(item: HistoryItem) {
  return item.approverName || item.approveName || item.nickName || '—'
}

/** 办理人列表（按逗号拆分，兼容多人会签场景） */
function approverList(item: HistoryItem): string[] {
  return approverName(item).split(',').map(s => s.trim()).filter(Boolean)
}

/** 办理人数量 */
function approverCount(item: HistoryItem): number {
  return approverList(item).length
}

/** 办理人摘要：多人显示「某某某等N人」，单人直接显示 */
function approverSummary(item: HistoryItem): string {
  const list = approverList(item)
  if (list.length === 0)
    return '—'
  return list.length > 1 ? `${list[0]} 等${list.length}人` : list[0]
}

/** 当前进行到的步骤索引（无进行中节点时取最后一步） */
const activeIndex = computed(() => {
  const idx = history.value.findIndex(it => it.flowStatus === 'process' || it.flowStatus === 'waiting')
  return idx === -1 ? Math.max(history.value.length - 1, 0) : idx
})

/** 是否存在附件 */
function hasFiles(item: HistoryItem) {
  return !!(item.attachmentList && item.attachmentList.length)
}

/** 打开附件预览弹窗 */
function openPreview(list: OssVO[]) {
  previewFiles.value = list
  previewVisible.value = true
}

/** 下载附件 */
function downloadAttachment(file: OssVO) {
  const baseUrl = getEnvBaseUrl()
  const token = useTokenStore().updateNowTime().validToken
  const clientId = import.meta.env.VITE_APP_CLIENT_ID
  const url = /^https?:\/\//.test(file.url) ? file.url : `${baseUrl}${file.url}`

  uni.showLoading({ title: '下载中...' })
  uni.downloadFile({
    url,
    header: { Authorization: `Bearer ${token}`, clientId },
    success: (res) => {
      uni.hideLoading()
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          fail: () => uni.showToast({ title: '该文件暂不支持预览', icon: 'none' }),
        })
      }
      else {
        uni.showToast({ title: '下载失败', icon: 'none' })
      }
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '下载失败', icon: 'none' })
    },
  })
}

/** 打开审批人列表弹窗 */
function openApprovers(item: HistoryItem) {
  approverNames.value = approverList(item)
  approverVisible.value = true
}

/** 跳转流程图 webview */
function openFlowChart() {
  if (!instanceId.value) {
    uni.showToast({ title: '实例ID未就绪', icon: 'none' })
    return
  }
  const base = getEnvBaseUrl()
  const token = useTokenStore().updateNowTime().validToken
  const clientId = import.meta.env.VITE_APP_CLIENT_ID
  const url = `${base}/warm-flow-ui/index.html?id=${instanceId.value}&type=FlowChart&t=${Date.now()}&Authorization=Bearer ${token}&clientid=${clientId}`
  uni.navigateTo({ url: `/pages-core/common/webview/webview?url=${encodeURIComponent(url)}&title=流程图` })
}
</script>

<template>
  <view v-if="loading" class="panel-loading">
    <RyLoading />
  </view>
  <view v-else-if="history.length" class="wf-history">
    <view class="wf-history__header">
      <view class="wf-history__title">
        <view class="wf-history__bar" />
        <text class="wf-history__text">审批记录</text>
      </view>
      <view v-if="instanceId" class="wf-history__link" @click="openFlowChart">
        查看流程图
      </view>
    </view>
    <WorkflowSteps :current="activeIndex" :items="history">
      <template #item="{ item }">
        <view class="approve-title">
          <text class="approve-name">{{ item.nodeName || '—' }}</text>
          <DictTag size="small" :options="wf_task_status" :value="item.flowStatus" />
        </view>
        <view class="approve-body">
          <view class="approve-time flex justify-between">
            <view class="approve-approver">
              <text class="approve-approver__text">{{ approverSummary(item) }}</text>
              <text v-if="approverCount(item) > 1" class="approve-approver__more ml-2" @click="openApprovers(item)">查看</text>
            </view>
            <text v-if="item.updateTime" class="approve-time__val">{{ item.updateTime }}</text>
          </view>

          <view v-if="item.message" class="approve-card approve-msg">
            <text class="approve-card__label hidden">审批意见：</text><text>{{ item.message }}</text>
          </view>

          <view v-if="hasFiles(item)" class="approve-card approve-attach" @click="openPreview(item.attachmentList!)">
            <text class="approve-attach__info">
              <text class="approve-card__label">附件：</text>{{ item.attachmentList!.length }} 个
            </text>
            <view class="approve-attach__btn">
              <text>查看</text>
            </view>
          </view>
        </view>
      </template>
    </WorkflowSteps>

    <!-- 附件预览弹窗 -->
    <WorkflowPopup v-model:visible="previewVisible" title="附件列表" max-height="70vh" :scroll="false">
      <scroll-view scroll-y class="wf-attach-body wf-scroll-fill">
        <view
          v-for="file in previewFiles"
          :key="file.ossId"
          class="attach-row"
        >
          <text class="i-carbon-document attach-row__icon" />
          <view class="attach-row__main">
            <text class="attach-row__name">{{ file.originalName }}</text>
            <text v-if="file.fileSuffix" class="attach-row__sub">{{ file.fileSuffix }}</text>
          </view>
          <view class="attach-row__dl" @click="downloadAttachment(file)">
            <text class="i-carbon-download" />
          </view>
        </view>
      </scroll-view>
    </WorkflowPopup>

    <!-- 审批人列表弹窗 -->
    <WorkflowPopup v-model:visible="approverVisible" :title="`审批人（${approverNames.length}）`" :show-close="false" max-height="70vh" :scroll="false">
      <scroll-view scroll-y class="wf-approver-body wf-scroll-fill">
        <view
          v-for="name in approverNames"
          :key="name"
          class="wf-approver-item"
        >
          {{ name }}
        </view>
      </scroll-view>
    </WorkflowPopup>
  </view>
  <view v-else class="detail-empty">
    <text class="i-carbon-time mb-4 text-6xl text-gray-300" />
    <text>暂无审批记录</text>
  </view>
</template>

<style lang="scss" scoped>
.wf-history {
  padding: 16rpx 8rpx;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0rpx 0rpx 50rpx;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__bar {
    width: 6rpx;
    height: 32rpx;
    border-radius: 3rpx;
    background: #4a90e2;
  }

  &__text {
    font-size: 34rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  &__link {
    font-size: 26rpx;
    color: #4a90e2;

    &:active {
      opacity: 0.6;
    }
  }
}

.approve-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.approve-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.approve-body {
  margin-top: 12rpx;
}

.approve-time {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.approve-duration {
  margin-left: 8rpx;
  color: #bbb;
}

.approve-approver {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;

  &__text {
    color: #999;
  }

  &__more {
    color: #4a90e2;
    flex-shrink: 0;

    &:active {
      opacity: 0.6;
    }
  }
}

.approve-time__val {
  color: #999;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.approve-card {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #555;
  padding: 16rpx 20rpx;
  background: #f7f8fa;
  border-radius: 10rpx;
  line-height: 1.6;

  &__label {
    color: #999;
  }
}

.approve-msg {
  word-break: break-all;
}

.approve-attach {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__info {
    color: #555;
  }

  &__btn {
    color: #4a90e2;
    padding: 4rpx;
    flex-shrink: 0;
    margin-left: 12rpx;

    &:active {
      opacity: 0.6;
    }
  }
}

.wf-attach-body {
  max-height: 62vh;
  box-sizing: border-box;
}

.wf-approver-body {
  padding: 0;
  max-height: 62vh;
  box-sizing: border-box;
}

.wf-approver-item {
  font-size: 28rpx;
  color: #333;
  padding: 24rpx;
  text-align: center;

  & + & {
    border-top: 1rpx solid #f2f3f5;
  }
}

.attach-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 20rpx;
  border-radius: 12rpx;

  & + & {
    border-top: 1rpx solid #f2f3f5;
  }

  &:active {
    background: #f7f8fa;
  }

  &__icon {
    font-size: 40rpx;
    color: #4a90e2;
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__name {
    font-size: 28rpx;
    color: #1a1a1a;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__sub {
    font-size: 22rpx;
    color: #bbb;
  }

  &__dl {
    flex-shrink: 0;
    margin-left: 12rpx;
    padding: 12rpx 16rpx 12rpx 12rpx;
    font-size: 36rpx;
    color: #4a90e2;

    &:active {
      opacity: 0.6;
    }
  }
}

.detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  color: #bbb;
  font-size: 28rpx;
}
</style>
