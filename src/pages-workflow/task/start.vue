<script lang="ts" setup>
import { ref, shallowRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ComponentPublicInstance } from 'vue'
import TaskVerifyDialog from '@/pages-workflow/task/components/actions/TaskVerifyDialog.vue'
import FlowFormRenderer from '@/pages-workflow/task/components/form/FlowFormRenderer.vue'
import { startWorkFlow } from '@/api/workflow/task'
import { START_REGISTRY } from '@/pages-workflow/task/utils/start-registry'
import type { FlowStartConfig } from '@/pages-workflow/task/utils/start-registry'
import { jumpToApprovalList } from '@/pages-workflow/task/utils/workflow'

interface FlowFormExpose {
  onSubmit: () => void
  onSaveDraft: () => void
}

definePage({
  style: {
    navigationBarTitleText: '发起申请',
  },
})

// 启动确认弹窗状态
const showStartDialog = ref(false)
const startTaskId = ref<string | number>('')

// 路由参数
const type = ref('') // type 业务类型
const editId = ref<string | number>('') // 有即编辑，否则新增
const config = shallowRef<FlowStartConfig | null>(null)

onLoad((q) => {
  type.value = (q?.type as string) || ''
  editId.value = q?.id ? String(q.id) : ''
  const cfg = START_REGISTRY[type.value]
  if (!cfg) {
    uni.showToast({ title: '未知的流程类型', icon: 'none' })
    return
  }
  config.value = cfg
  // 导航栏标题直接展示业务名
  const baseName = cfg.name
  uni.setNavigationBarTitle({ title: baseName })
})

/** 动态表单组件 ref */
const formRef = ref<ComponentPublicInstance | null>(null)
function callFormSubmit() {
  (formRef.value as unknown as FlowFormExpose | null)?.onSubmit()
}
function callFormSaveDraft() {
  (formRef.value as unknown as FlowFormExpose | null)?.onSaveDraft()
}

type SubmitAction = 'submit' | 'draft'

interface FormSubmitPayload {
  form: Record<string, any>
  flowCode: string
  variables: Record<string, unknown>
  bizExt?: Record<string, unknown>
}

/** 表单提交/保存草稿 */
async function handleFormAction(action: SubmitAction, payload: FormSubmitPayload) {
  if (!config.value)
    return
  const cfg = config.value

  try {
    // 设置后端发起和不等于草稿状态 直接走流程发起
    if (action === 'submit' && cfg.mode === 'backend') {
      if (!cfg.submitApi) {
        uni.showToast({ title: '未配置发起接口', icon: 'none' })
        return
      }
      uni.showLoading({ title: '提交中...', mask: true })
      await cfg.submitApi(payload.form)
      uni.hideLoading()
      uni.showToast({ title: '发起成功', icon: 'success' })
      jumpToApprovalList('document')
    }
    else {
      uni.showLoading({ title: '提交中...', mask: true })

      let res
      if (payload.form.id) {
        res = await config.value.updateApi(payload.form)
      }
      else {
        res = await config.value.addApi(payload.form)
      }
      const bizExt = {
        ...(payload.bizExt ?? {}),
        businessCode: res.applyCode,
      }
      const startRes = await startWorkFlow({
        businessId: res.id,
        flowCode: payload.flowCode,
        variables: payload.variables,
        bizExt,
      })
      uni.hideLoading()
      if (action === 'submit') {
        startTaskId.value = startRes.taskId
        showStartDialog.value = true
      }
      else {
        uni.showToast({ title: '操作成功', icon: 'success' })
        jumpToApprovalList('document')
      }
    }
  }
  catch (error) {
    // 失败：request 拦截器已弹错误 toast 顶掉 loading，此处不再 hideLoading，否则多余关闭触发"必须配对"警告
    throw error
  }
}

/** 表单提交：按 config.mode 决定走「后端直发起」还是「前端发起」（后者弹 TaskVerifyDialog 办理第一个任务） */
async function onSubmit(payload: FormSubmitPayload) {
  await handleFormAction('submit', payload)
}

/** 启动确认完成（已 completeTask 第一个任务）：跳回流程审批页并定位「我发起」 */
function onStartConfirmed() {
  jumpToApprovalList('document')
}

/**
 * 弹窗以非提交方式关闭（取消 / 遮罩 / X）：流程草稿状态，直接跳回「我发起」列表。
 */
function onStartCancelled() {
  jumpToApprovalList('document')
}

/** 保存草稿：同前端发起链路，但不弹办理弹窗；成功后跳「我发起」。 */
async function onSaveDraft(payload: FormSubmitPayload) {
  await handleFormAction('draft', payload)
}
</script>

<template>
  <view class="page-container">
    <scroll-view scroll-y class="start-page__scroll">
      <view class="start-page__form">
        <FlowFormRenderer
          v-if="type"
          ref="formRef"
          :type="type"
          :business-id="editId"
          @submit="onSubmit"
          @save-draft="onSaveDraft"
        />
      </view>
    </scroll-view>

    <view class="start-page__footer">
      <view v-if="config?.mode !== 'backend'" class="wf-btn start-page__draft" @click="callFormSaveDraft">
        保存草稿
      </view>
      <view class="wf-btn wf-btn--primary-filled wf-btn--grow" @click="callFormSubmit">
        提交申请
      </view>
    </view>

    <TaskVerifyDialog
      v-model:visible="showStartDialog"
      mode="pass"
      :task-id="startTaskId"
      @success="onStartConfirmed"
      @cancel="onStartCancelled"
    />
  </view>
</template>

<style lang="scss" scoped>
.start-page__scroll {
  flex: 1;
  min-height: 0;
}

.start-page__form {
  padding: 0 28rpx 32rpx;
}

.start-page__footer {
  flex-shrink: 0;
  display: flex;
  gap: 20rpx;
  padding: 16rpx 32rpx;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.start-page__draft {
  flex: 1;
  border-color: #d9d9d9;
  color: #666;
  background: #f5f7fa;
}
</style>
