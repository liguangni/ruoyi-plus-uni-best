<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { terminationTask } from '@/api/workflow/task'
import WorkflowPopup from '@/pages-workflow/task/components/popup/WorkflowPopup.vue'

const props = defineProps<{
  visible: boolean
  taskId?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const taskId = computed(() => props.taskId)
const submitting = ref(false)
const comment = ref('')

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
    if (val)
      comment.value = ''
  },
)

async function submit() {
  const confirmed = await confirmDialog('是否确认终止？')
  if (!confirmed)
    return
  submitting.value = true
  try {
    await terminationTask({ taskId: taskId.value, comment: comment.value.trim() })
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
  <WorkflowPopup :visible="visible" title="终止" max-height="80vh" @update:visible="emit('update:visible', $event)">
    <view class="wf-field__label">
      终止原因
    </view>
    <textarea
      v-model="comment"
      class="wf-textarea"
      placeholder="请输入终止原因"
      placeholder-class="wf-textarea__placeholder"
      :maxlength="200"
    />
    <view class="wf-textarea__count">
      {{ comment.length }}/200
    </view>
    <template #footer>
      <view class="wf-dialog__footer">
        <view class="wf-btn wf-btn--more wf-btn--grow" @click="close">
          取消
        </view>
        <view class="wf-btn wf-btn--primary-filled wf-btn--grow" @click="submit">
          <text v-if="submitting" class="i-carbon-circle-dash wf-btn__icon is-spinning" />
          <text class="wf-btn__label">{{ submitting ? '提交中...' : '确认终止' }}</text>
        </view>
      </view>
    </template>
  </WorkflowPopup>
</template>

<style lang="scss" scoped>
</style>
