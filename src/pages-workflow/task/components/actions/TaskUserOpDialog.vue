<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { UserVO } from '@/api/system/user/types'
import { taskOperation } from '@/api/workflow/task'
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'

const props = defineProps<{
  visible: boolean
  /** delegateTask 委托 / transferTask 转办 / addSignature 加签 */
  operation: 'delegateTask' | 'transferTask' | 'addSignature'
  title: string
  mode: 'single' | 'multiple'
  taskId?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const taskId = computed(() => props.taskId)
const submitting = ref(false)
const userVisible = ref(false)
const selectedUsers = ref<UserVO[]>([])
const message = ref('')

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
    if (val) {
      selectedUsers.value = []
      message.value = ''
      userVisible.value = false
    }
  },
)

function onConfirm(users: UserVO[]) {
  selectedUsers.value = [...users]
}

async function submit() {
  if (selectedUsers.value.length === 0) {
    uni.showToast({ title: '请选择用户！', icon: 'none' })
    return
  }
  const confirmed = await confirmDialog('是否确认提交？')
  if (!confirmed)
    return
  submitting.value = true
  try {
    const bo: Record<string, any> = {
      taskId: taskId.value,
      message: message.value,
      messageType: ['1'],
    }
    if (props.mode === 'single')
      bo.userId = String(selectedUsers.value[0].userId)
    else
      bo.userIds = selectedUsers.value.map(u => String(u.userId))
    await taskOperation(bo as any, props.operation)
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
  <WorkflowPopup :visible="visible" :title="title" max-height="85vh" @update:visible="emit('update:visible', $event)">
    <view class="wf-field__label">
      选择人员
    </view>
    <view class="wf-copy">
      <view v-for="user in selectedUsers" :key="String(user.userId)" class="wf-copy__tag">
        <text>{{ user.nickName }}</text>
        <text class="wf-copy__close i-carbon-close" @click="selectedUsers = selectedUsers.filter(u => u !== user)" />
      </view>
      <view class="wf-copy__add" @click="userVisible = true">
        <text class="i-carbon-user-follow" />
        <text>选择人员</text>
      </view>
    </view>

    <view class="wf-field__label">
      办理意见
    </view>
    <textarea
      v-model="message"
      class="wf-textarea"
      placeholder="请输入办理意见"
      placeholder-class="wf-textarea__placeholder"
      :maxlength="200"
    />
    <view class="wf-textarea__count">
      {{ message.length }}/200
    </view>
    <template #footer>
      <view class="wf-dialog__footer">
        <view class="wf-btn wf-btn--more wf-btn--grow" @click="close">
          取消
        </view>
        <view class="wf-btn wf-btn--primary-filled wf-btn--grow" @click="submit">
          <text v-if="submitting" class="i-carbon-circle-dash wf-btn__icon is-spinning" />
          <text class="wf-btn__label">{{ submitting ? '提交中...' : '提交' }}</text>
        </view>
      </view>
    </template>

    <UserSelector v-model="userVisible" :mode="mode" @confirm="onConfirm" />
  </WorkflowPopup>
</template>

<style lang="scss" scoped>
</style>
