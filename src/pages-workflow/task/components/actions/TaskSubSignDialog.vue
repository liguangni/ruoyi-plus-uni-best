<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { currentTaskAllUser, taskOperation } from '@/api/workflow/task'
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'

const props = defineProps<{
  visible: boolean
  taskId?: string | number
  /** 减签列表项展示所属节点名称用 */
  nodeName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const taskId = computed(() => props.taskId)
const submitting = ref(false)
const deleteUserList = ref<any[]>([])

function close() {
  emit('update:visible', false)
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

watch(
  () => props.visible,
  (val) => {
    if (!val)
      return
    deleteUserList.value = []
    uni.showLoading({ title: '加载中', mask: true })
    currentTaskAllUser(taskId.value as string | number)
      .then((res) => {
        deleteUserList.value = (res || []).map((e: any) => ({
          ...e,
          nodeName: props.nodeName,
        }))
      })
      .catch(() => {})
      .finally(() => uni.hideLoading())
  },
)

async function remove(row: any) {
  const confirmed = await confirmDialog('是否确认提交？')
  if (!confirmed)
    return
  submitting.value = true
  try {
    await taskOperation(
      { userIds: [String(row.userId)], taskId: taskId.value, message: '', messageType: ['1'] },
      'reductionSignature',
    )
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
  <WorkflowPopup :visible="visible" title="减签人员" max-height="80vh" @update:visible="emit('update:visible', $event)">
    <view
      v-for="user in deleteUserList"
      :key="user.userId"
      class="wf-option"
    >
      <view class="wf-option__main">
        <text class="wf-option__name">{{ user.nickName }}</text>
        <text class="wf-option__sub">{{ user.nodeName }}</text>
      </view>
      <view class="wf-subsign__del" @click="remove(user)">
        <text class="i-carbon-trash-can" />
        <text>删除</text>
      </view>
    </view>
    <view v-if="deleteUserList.length === 0" class="wf-user-empty">
      暂无可减签人员
    </view>
    <template #footer>
      <view class="wf-dialog__footer">
        <view class="wf-btn wf-btn--more wf-btn--block" @click="close">
          关闭
        </view>
      </view>
    </template>
  </WorkflowPopup>
</template>

<style lang="scss" scoped>
.wf-subsign__del {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #e05252;
  background: rgba(224, 82, 82, 0.08);
}
.wf-user-empty {
  text-align: center;
  color: #bbb;
  font-size: 26rpx;
  padding: 80rpx 0;
}
.wf-subsign__del:active {
  background: rgba(224, 82, 82, 0.16);
}
</style>
