<script lang="ts" setup>
import { computed, ref } from 'vue'
import { cancelProcessApply, deleteByInstanceIds } from '@/api/workflow/instance'
import type { ApprovalTabbarType } from '../utils/workflow'
import { jumpToApprovalList, navigateToStart } from '../utils/workflow'
import TaskVerifyDialog from './actions/TaskVerifyDialog.vue'
import TaskUserOpDialog from './actions/TaskUserOpDialog.vue'
import TaskSubSignDialog from './actions/TaskSubSignDialog.vue'
import TaskTerminationDialog from './actions/TaskTerminationDialog.vue'
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'
import { resolveFlowTypeByFormPath } from '@/pages-workflow/task/utils/start-registry'
import type { FlowTaskItemInfo } from '@/pages-workflow/task/utils/workflow'

const props = defineProps<{
  task?: FlowTaskItemInfo | null
  buttonPermissions?: Record<string, boolean>
  /** 来源列表 tab */
  from?: ApprovalTabbarType
}>()

const buttonPermissions = computed(() => props.buttonPermissions ?? {})
const task = computed(() => props.task)

/** 操作成功后跳转回来源列表页（使用 from，缺省回落待办列表） */
function toFlowListPage() {
  const target: ApprovalTabbarType = props.from || 'waiting'
  jumpToApprovalList(target)
}

function confirmDialog(content: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title: '提示',
      content,
      success: res => resolve(res.confirm),
      fail: () => resolve(false),
    })
  })
}

function onOpSuccess() {
  toFlowListPage()
}

/** 仅“待审批(waiting)”节点才展示操作按钮 */
const isWaiting = computed(() => props.task?.flowStatus === 'waiting')

// ============ 每个按钮的显示判定 ============
const showBack = computed(() => isWaiting.value && !!buttonPermissions.value.back)
const showTermination = computed(() => isWaiting.value && !!buttonPermissions.value.termination)
const showTrust = computed(() => isWaiting.value && !!buttonPermissions.value.trust)
const showTransfer = computed(() => isWaiting.value && !!buttonPermissions.value.transfer)
const showAddSign = computed(() =>
  isWaiting.value && Number(props.task?.nodeRatio ?? 0) > 0 && !!buttonPermissions.value.addSign,
)
const showSubSign = computed(() =>
  isWaiting.value && Number(props.task?.nodeRatio ?? 0) > 0 && !!buttonPermissions.value.subSign,
)
const showMore = computed(() =>
  showTrust.value || showTransfer.value || showAddSign.value || showSubSign.value || showTermination.value,
)

// ============ myself 类型按钮（我的发起：document） ============
const revocable = computed(() =>
  props.from === 'document' && props.task?.flowStatus === 'waiting',
)
const editable = computed(() =>
  props.from === 'document' && ['back', 'cancel', 'draft'].includes(props.task?.flowStatus ?? ''),
)

// ============ 弹窗可见性 ============
const moreVisible = ref(false)
const approveVisible = ref(false)
const backVisible = ref(false)
const delegateVisible = ref(false)
const transferVisible = ref(false)
const addSignVisible = ref(false)
const subSignVisible = ref(false)
const terminationVisible = ref(false)

// ============ 我的发起：撤销 / 编辑 / 删除 ============
const submitting = ref(false)

async function revokeInstance() {
  const businessId = props.task?.businessId
  if (!businessId) {
    uni.showToast({ title: '缺少业务ID，无法撤销', icon: 'none' })
    return
  }
  const confirmed = await confirmDialog('是否确认撤销当前单据？')
  if (!confirmed)
    return
  if (submitting.value)
    return
  submitting.value = true
  try {
    await cancelProcessApply({ businessId, message: '申请人撤销流程！' })
    uni.showToast({ title: '操作成功', icon: 'success' })
    toFlowListPage()
  }
  finally {
    submitting.value = false
  }
}

function editInstance() {
  const id = props.task?.businessId
  if (!id) {
    uni.showToast({ title: '缺少业务ID，无法编辑', icon: 'none' })
    return
  }
  // 根据后端返回的审批表单路径（task.formPath），在发起配置表 START_REGISTRY 中反解流程类型；
  // 命中即跳对应编辑页（/pages-workflow/task/start?type=<key>&id=<id>），未命中提示开发中。
  // 新增审批类型只需在注册表登记 formPath 并在 FlowFormRenderer 加渲染分支，此处自动支持。
  const type = resolveFlowTypeByFormPath(props.task?.formPath || '')
  if (type) {
    navigateToStart(type, id)
  }
  else {
    uni.showToast({ title: '该类型编辑功能开发中', icon: 'none' })
  }
}

async function deleteInstance() {
  const id = props.task?.id
  if (!id) {
    uni.showToast({ title: '缺少单据ID，无法删除', icon: 'none' })
    return
  }
  const confirmed = await confirmDialog('是否确认删除该申请？')
  if (!confirmed)
    return
  if (submitting.value)
    return
  submitting.value = true
  uni.showLoading({ title: '删除中', mask: true })
  try {
    await deleteByInstanceIds(id)
    uni.hideLoading()
    uni.showToast({ title: '删除成功', icon: 'success' })
    jumpToApprovalList(props.from || 'document')
  }
  catch {
    uni.hideLoading()
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="wf-actions">
    <!-- waiting: 我的待办 -->
    <template v-if="from === 'waiting'">
      <view class="wf-btn wf-btn--success wf-btn--grow" @click="approveVisible = true">
        <text class="i-carbon-checkmark wf-btn__icon" />
        <text class="wf-btn__label">通过</text>
      </view>
      <view v-if="showBack" class="wf-btn wf-btn--warning wf-btn--grow" @click="backVisible = true">
        <text class="i-carbon-undo wf-btn__icon" />
        <text class="wf-btn__label">驳回</text>
      </view>
      <view v-if="showMore" class="wf-btn wf-btn--more wf-btn--right" @click="moreVisible = true">
        <text class="i-carbon-menu wf-btn__icon" />
        <text class="wf-btn__label">其他</text>
      </view>
    </template>

    <!-- document: 我的发起 -->
    <template v-else-if="from === 'document'">
      <view v-if="revocable" class="wf-btn wf-btn--danger wf-btn--block" :class="{ 'is-disabled': submitting }" @click="revokeInstance">
        <text class="i-carbon-undo wf-btn__icon" />
        <text class="wf-btn__label">撤销申请</text>
      </view>
      <template v-if="editable">
        <view class="wf-btn wf-btn--primary wf-btn--grow" @click="editInstance">
          <text class="i-carbon-edit wf-btn__icon" />
          <text class="wf-btn__label">编辑</text>
        </view>
        <view class="wf-btn wf-btn--danger wf-btn--grow" :class="{ 'is-disabled': submitting }" @click="deleteInstance">
          <text class="i-carbon-trash-can wf-btn__icon" />
          <text class="wf-btn__label">删除</text>
        </view>
      </template>
    </template>
  </view>

  <!-- 更多操作弹窗 -->
  <WorkflowPopup v-model:visible="moreVisible" title="更多操作" max-height="70vh">
    <view class="wf-more-actions">
      <view v-if="showTrust" class="wf-more-actions__item" @click="moreVisible = false; delegateVisible = true">
        <view class="wf-more-actions__icon" style="background: #4a90e21a">
          <text class="i-carbon-user-follow" style="color: #4a90e2" />
        </view>
        <text class="wf-more-actions__label">委托</text>
      </view>
      <view v-if="showTransfer" class="wf-more-actions__item" @click="moreVisible = false; transferVisible = true">
        <view class="wf-more-actions__icon" style="background: #ff9f431a">
          <text class="i-carbon-arrows-horizontal" style="color: #ff9f43" />
        </view>
        <text class="wf-more-actions__label">转办</text>
      </view>
      <view v-if="showAddSign" class="wf-more-actions__item" @click="moreVisible = false; addSignVisible = true">
        <view class="wf-more-actions__icon" style="background: #018d711a">
          <text class="i-carbon-user-role" style="color: #018d71" />
        </view>
        <text class="wf-more-actions__label">加签</text>
      </view>
      <view v-if="showSubSign" class="wf-more-actions__item" @click="moreVisible = false; subSignVisible = true">
        <view class="wf-more-actions__icon" style="background: #e052521a">
          <text class="i-carbon-subtract" style="color: #e05252" />
        </view>
        <text class="wf-more-actions__label">减签</text>
      </view>
      <view v-if="showTermination" class="wf-more-actions__item" @click="moreVisible = false; terminationVisible = true">
        <view class="wf-more-actions__icon" style="background: #e052521a">
          <text class="i-carbon-stop" style="color: #e05252" />
        </view>
        <text class="wf-more-actions__label">终止</text>
      </view>
    </view>
    <template #footer>
      <view class="wf-dialog__footer">
        <view class="wf-btn wf-btn--more wf-btn--block" @click="moreVisible = false">
          取消
        </view>
      </view>
    </template>
  </WorkflowPopup>

  <!-- 通过 / 办理 -->
  <TaskVerifyDialog
    v-model:visible="approveVisible"
    mode="pass"
    :task-id="task?.id"
    :node-code="task?.nodeCode"
    :button-permissions="buttonPermissions"
    @success="onOpSuccess"
  />
  <!-- 驳回 -->
  <TaskVerifyDialog
    v-model:visible="backVisible"
    mode="reject"
    :task-id="task?.id"
    :node-code="task?.nodeCode"
    :button-permissions="buttonPermissions"
    @success="onOpSuccess"
  />
  <!-- 委托 -->
  <TaskUserOpDialog
    v-model:visible="delegateVisible"
    operation="delegateTask"
    title="委托"
    mode="single"
    :task-id="task?.id"
    @success="onOpSuccess"
  />
  <!-- 转办 -->
  <TaskUserOpDialog
    v-model:visible="transferVisible"
    operation="transferTask"
    title="转办"
    mode="single"
    :task-id="task?.id"
    @success="onOpSuccess"
  />
  <!-- 加签 -->
  <TaskUserOpDialog
    v-model:visible="addSignVisible"
    operation="addSignature"
    title="加签"
    mode="multiple"
    :task-id="task?.id"
    @success="onOpSuccess"
  />
  <!-- 减签 -->
  <TaskSubSignDialog v-model:visible="subSignVisible" :task-id="task?.id" :node-name="task?.nodeName" @success="onOpSuccess" />
  <!-- 终止 -->
  <TaskTerminationDialog v-model:visible="terminationVisible" :task-id="task?.id" @success="onOpSuccess" />
</template>

<style lang="scss" scoped>
.wf-actions {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
}

.wf-more-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  padding: 8rpx 0;

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 32rpx;
    border-radius: 16rpx;
    background: #f8f9fa;

    &:active {
      background: #eef0f3;
    }
  }

  &__icon {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
  }

  &__label {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
  }
}

.wf-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 28rpx;
  border-radius: 12rpx;
  border: 2rpx solid;
  font-size: 28rpx;
  font-weight: 500;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }

  &--block {
    flex: 1;
  }

  &--grow {
    flex: 1;
  }

  &--right {
    margin-left: auto;
    flex-shrink: 0;
  }

  &__icon {
    font-size: 32rpx;
  }

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__label {
    font-size: 28rpx;
  }

  &--success {
    border-color: #52c41a;
    color: #52c41a;
    background: rgba(82, 196, 26, 0.06);
  }

  &--warning {
    border-color: #ff9f43;
    color: #ff9f43;
    background: rgba(255, 159, 67, 0.06);
  }

  &--danger {
    border-color: #e05252;
    color: #e05252;
    background: rgba(224, 82, 82, 0.06);
  }

  &--primary {
    border-color: #4a90e2;
    color: #4a90e2;
    background: rgba(74, 144, 226, 0.06);
  }

  &--more {
    border-color: #d9d9d9;
    color: #666;
    background: #fafafa;
  }
}
</style>
