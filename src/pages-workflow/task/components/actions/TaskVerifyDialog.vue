<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import type { UserVO } from '@/api/system/user/types'
import { backProcess, completeTask, getBackTaskNode, getNextNodeList, getTask } from '@/api/workflow/task'
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'
import AttachmentUpload from '@/pages-workflow/task/components/AttachmentUpload/AttachmentUpload.vue'

type VerifyMode = 'pass' | 'reject'
type CopyUser = UserVO

const props = defineProps<{
  visible: boolean
  /** pass=通过/办理，reject=驳回 */
  mode: VerifyMode
  taskId?: string | number
  /** 驳回时定位驳回节点所需 */
  nodeCode?: string
  buttonPermissions?: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
  /** 非成功提交的关闭（遮罩 / X / 取消按钮）：交由父组件处理，如发起页跳转草稿详情页 */
  (e: 'cancel'): void
}>()

const taskId = computed(() => props.taskId)
/**
 * 按钮权限
 */
const localButtonObj = ref<Record<string, boolean>>({})
const buttonPermissions = computed(() => {
  const p = props.buttonPermissions
  if (p && Object.keys(p).length > 0)
    return p
  return localButtonObj.value
})

const submitting = ref(false)
const isReject = computed(() => props.mode === 'reject')

// 驳回节点列表（仅 reject 模式）
const taskNodeList = ref<any[]>([])
// 下一步审批人节点列表（仅 pass 模式）
const nestNodeList = ref<any[]>([])

const form = reactive({
  message: '',
  messageType: ['1'] as string[],
  fileId: '' as string,
  // reject
  nodeCode: '',
  // pass
  copyList: [] as CopyUser[],
  assigneeMap: {} as Record<string, string>,
  assigneeNames: {} as Record<string, string>,
})

/**
 * 各办理区块的显隐条件
 * - file：附件上传区块
 * - copy：抄送人区块（仅「通过/办理」展示，驳回不展示）
 * - pop ：下一步审批人区块（仅「通过/办理」展示，驳回不展示）
 */
const showAttachment = computed(() => !!buttonPermissions.value.file)
const showCopyTo = computed(() => !isReject.value && !!buttonPermissions.value.copy)
const showNextApprover = computed(() => !isReject.value && !!buttonPermissions.value.pop)

// 驳回节点原生 picker 数据（仅 reject 模式）
const rejectNodeNames = computed(() => taskNodeList.value.map(n => n.nodeName))
const rejectNodeIndex = computed(() =>
  taskNodeList.value.findIndex(n => n.nodeCode === form.nodeCode),
)
function onRejectNodeChange(e: any) {
  const idx = e.detail?.value ?? e.detail.value
  const node = taskNodeList.value[idx]
  if (node)
    form.nodeCode = node.nodeCode
}

const copyVisible = ref(false)
const popUserVisible = ref(false)
const popNodeCode = ref('')
const popUserIds = ref('')

function close() {
  emit('update:visible', false)
}

/** 取消 / 遮罩 / X 关闭（非成功提交）：交由父组件处理（如发起页跳转草稿详情页） */
function onCancel() {
  emit('update:visible', false)
  emit('cancel')
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

/** 消息提醒 */
function onMsgChange(e: any) {
  const selected = (e.detail.value as string[]) || []
  if (!selected.includes('1'))
    selected.push('1')
  form.messageType = selected
}

/** 父组件是否未传入按钮权限（需弹窗自行拉取解析） */
const needsLocalPermissions = computed(() =>
  !props.buttonPermissions || Object.keys(props.buttonPermissions).length === 0,
)

/** 打开弹窗时重置全部表单与节点状态，避免上次办理残留 */
function resetDialogState() {
  form.message = ''
  form.messageType = ['1']
  form.fileId = ''
  form.nodeCode = ''
  form.copyList = []
  form.assigneeMap = {}
  form.assigneeNames = {}
  taskNodeList.value = []
  nestNodeList.value = []
  copyVisible.value = false
  popUserVisible.value = false
}

/** 自行拉取任务详情并解析按钮权限 */
async function fetchButtonPermissions() {
  if (!needsLocalPermissions.value)
    return
  const res = await getTask(taskId.value as string)
  const buttonList = res?.buttonList || []
  const obj: Record<string, boolean> = {}
  buttonList.forEach((e: any) => {
    obj[e.code] = e.show
  })
  localButtonObj.value = obj
}

/** 根据模式拉取目标节点：驳回 → 可回退节点；通过 → 下一步审批人节点 */
async function fetchTargetNodes() {
  if (isReject.value) {
    const res = await getBackTaskNode(taskId.value as string, props.nodeCode as string)
    taskNodeList.value = res || []
    form.nodeCode = taskNodeList.value[0]?.nodeCode || ''
  }
  else {
    const res = await getNextNodeList({ taskId: taskId.value, variables: {} })
    nestNodeList.value = res || []
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible)
      return
    // 打开时重置表单与节点状态
    resetDialogState()
    uni.showLoading({ title: '加载中', mask: true })
    // 并行拉取按钮权限与目标节点，结束后关闭 loading
    Promise.all([fetchButtonPermissions(), fetchTargetNodes()])
      .catch(() => {})
      .finally(() => uni.hideLoading())
  },
)

function onCopyConfirm(users: CopyUser[]) {
  form.copyList = [...users]
}

function choosePeople(node: any) {
  if (!node.permissionFlag) {
    uni.showToast({ title: '没有可选择的人员，请联系管理员！', icon: 'none' })
    return
  }
  popUserIds.value = node.permissionFlag
  popNodeCode.value = node.nodeCode
  popUserVisible.value = true
}

function onPopUser(users: CopyUser[]) {
  form.assigneeMap[popNodeCode.value] = users.map(u => String(u.userId)).join(',')
  form.assigneeNames[popNodeCode.value] = users.map(u => u.nickName).join(',')
}

async function submit() {
  if (isReject.value) {
    if (!form.nodeCode) {
      uni.showToast({ title: '请选择驳回节点', icon: 'none' })
      return
    }
    const confirmed = await confirmDialog('是否确认驳回？')
    if (!confirmed)
      return
    submitting.value = true
    try {
      await backProcess({
        taskId: taskId.value,
        nodeCode: form.nodeCode,
        message: form.message.trim(),
        messageType: form.messageType,
        fileId: form.fileId,
      })
      close()
      uni.showToast({ title: '操作成功', icon: 'success' })
      emit('success')
    }
    finally {
      submitting.value = false
    }
    return
  }

  // pass
  if (showNextApprover.value && nestNodeList.value.length) {
    const missing = nestNodeList.value.some(node => !form.assigneeMap[node.nodeCode])
    if (missing) {
      uni.showToast({ title: '请选择审批人！', icon: 'none' })
      return
    }
  }
  const confirmed = await confirmDialog('是否确认提交？')
  if (!confirmed)
    return
  submitting.value = true
  try {
    await completeTask({
      taskId: taskId.value,
      message: form.message.trim(),
      messageType: form.messageType,
      assigneeMap: showNextApprover.value && nestNodeList.value.length ? form.assigneeMap : {},
      variables: {},
      fileId: form.fileId,
      flowCopyList: form.copyList.map(u => ({ userId: u.userId, nickName: u.nickName })),
    })
    close()
    uni.showToast({ title: '操作成功', icon: 'success' })
    emit('success')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <WorkflowPopup
    :visible="visible"
    :title="isReject ? '驳回' : '提交审批'"
    max-height="85vh"
    @close="onCancel"
  >
    <!-- 驳回节点（仅驳回） -->
    <template v-if="isReject">
      <view class="wf-field__label">
        驳回节点
      </view>
      <picker mode="selector" :range="rejectNodeNames" :value="rejectNodeIndex" @change="onRejectNodeChange">
        <view class="wf-reject-picker">
          <text class="wf-reject-picker__text">
            {{ taskNodeList.find(n => n.nodeCode === form.nodeCode)?.nodeName || '请选择驳回节点' }}
          </text>
          <text class="i-carbon-chevron-down wf-reject-picker__arrow" />
        </view>
      </picker>
    </template>

    <!-- 消息提醒 -->
    <view class="wf-field__label">
      消息提醒
    </view>
    <checkbox-group class="wf-msg" @change="onMsgChange">
      <label class="wf-msg-item">
        <checkbox value="1" :checked="form.messageType.includes('1')" disabled color="#018d71" />
        <text>站内信</text>
      </label>
      <label class="wf-msg-item" :class="{ 'is-active': form.messageType.includes('2') }">
        <checkbox value="2" :checked="form.messageType.includes('2')" color="#018d71" />
        <text>邮件</text>
      </label>
      <label class="wf-msg-item" :class="{ 'is-active': form.messageType.includes('3') }">
        <checkbox value="3" :checked="form.messageType.includes('3')" color="#018d71" />
        <text>短信</text>
      </label>
    </checkbox-group>

    <!-- 抄送（仅通过） -->
    <template v-if="showCopyTo">
      <view class="wf-field__label">
        抄送
      </view>
      <view class="wf-copy">
        <view v-for="user in form.copyList" :key="String(user.userId)" class="wf-copy__tag">
          <text>{{ user.nickName }}</text>
          <text class="wf-copy__close i-carbon-close" @click="form.copyList = form.copyList.filter(u => u !== user)" />
        </view>
        <view class="wf-copy__add" @click="copyVisible = true">
          <text class="i-carbon-user-follow" />
          <text>选择抄送人</text>
        </view>
      </view>
    </template>

    <!-- 下一步审批人（仅通过） -->
    <template v-if="showNextApprover && nestNodeList.length">
      <view class="wf-field__label">
        下一步审批人
      </view>
      <view
        v-for="node in nestNodeList"
        :key="node.nodeCode"
        class="wf-option"
        :class="{ 'is-active': !!form.assigneeMap[node.nodeCode] }"
        @click="choosePeople(node)"
      >
        <view class="wf-option__main">
          <text class="wf-option__name">{{ node.nodeName }}</text>
          <text class="wf-option__sub">{{ form.assigneeNames[node.nodeCode] || '请选择审批人' }}</text>
        </view>
        <text class="i-carbon-chevron-right wf-option__arrow" />
      </view>
    </template>

    <!-- 审批意见 -->
    <view class="wf-field__label">
      审批意见
    </view>
    <textarea
      v-model="form.message"
      class="wf-textarea"
      placeholder="请输入审批意见" auto-height
      :maxlength="200"
    />
    <view class="wf-textarea__count">
      {{ form.message.length }}/200
    </view>

    <!-- 附件 -->
    <view v-if="showAttachment" class="mb-10">
      <view class="wf-field__label">
        附件
      </view>
      <AttachmentUpload v-model="form.fileId" />
    </view>
    <template #footer>
      <!-- 底部操作栏：固定在滚动区之外（WorkflowPopup 内置滚动，footer 结构在外） -->
      <view class="wf-dialog__footer">
        <view class="wf-btn wf-btn--more wf-btn--grow" @click="onCancel">
          取消
        </view>
        <view class="wf-btn wf-btn--primary-filled wf-btn--grow" @click="submit">
          <text v-if="submitting" class="i-carbon-circle-dash wf-btn__icon is-spinning" />
          <text class="wf-btn__label">{{ submitting ? '提交中...' : (isReject ? '确认' : '提交') }}</text>
        </view>
      </view>
    </template>

    <!-- 抄送选人（仅通过） -->
    <UserSelector
      v-if="!isReject"
      v-model="copyVisible"
      mode="multiple"
      :default-selected="form.copyList"
      @confirm="onCopyConfirm"
    />
    <!-- 下一步审批人选人（仅通过） -->
    <UserSelector
      v-if="!isReject"
      v-model="popUserVisible"
      mode="multiple"
      :allow-user-ids="popUserIds"
      @confirm="onPopUser"
    />
  </WorkflowPopup>
</template>

<style lang="scss" scoped>
// 以下为组件独有样式；公共的 .wf-field__label / .wf-textarea / .wf-copy / .wf-option 已抽到全局 custom.scss；滚动容器由 WorkflowPopup 内置
.wf-msg {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  :deep(checkbox) {
    transform: scale(0.75);
  }
  .wf-msg-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 14rpx 24rpx;
    border-radius: 28rpx;
    background: transparent;
    font-size: 26rpx;
    color: #333;
  }
}
.wf-reject-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
  background: #f7f8fa;
  border-radius: 12rpx;
  min-height: 88rpx;
  box-sizing: border-box;
  .wf-reject-picker__text {
    font-size: 28rpx;
    color: #333;
  }
  .wf-reject-picker__arrow {
    font-size: 24rpx;
    color: #999;
  }
}
.wf-msg-item.is-active {
  color: #018d71;
  background: transparent;
}
</style>
