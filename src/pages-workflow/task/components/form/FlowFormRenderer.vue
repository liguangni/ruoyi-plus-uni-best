<script lang="ts" setup>
import { computed, ref } from 'vue'
import LeaveForm from '@/pages-workflow/task/components/form/leave/LeaveForm.vue'
import { resolveFlowTypeByFormPath } from '@/pages-workflow/task/utils/start-registry'

const props = withDefaults(
  defineProps<{
    /** 流程类型（注册表 key），如 leave。与 formPath 二选一，type 优先 */
    type?: string
    /** 后端返回的表单路径（task.formPath），未传 type 时用于反解流程类型（详情页预览用） */
    formPath?: string
    businessId?: string | number
    /** 是否为预览（只读）模式：审批详情用，发起/编辑用 false */
    readonly?: boolean
  }>(),
  { type: '', formPath: '', businessId: '', readonly: false },
)

const emit = defineEmits<{
  (e: 'submit', payload: {
    form: Record<string, any>
    flowCode: string
    variables: Record<string, unknown>
    /** 业务扩展字段（可选，不含 businessCode；该编号由主组件存业务后补填）；子组件不传时主组件兜底为空对象 */
    bizExt?: Record<string, unknown>
  }): void
  (e: 'saveDraft', payload: {
    form: Record<string, any>
    flowCode: string
    variables: Record<string, unknown>
    /** 业务扩展字段（可选，不含 businessCode；该编号由主组件存业务后补填）；子组件不传时主组件兜底为空对象 */
    bizExt?: Record<string, unknown>
  }): void
}>()

// 解析实际流程类型：type 优先；否则按 formPath 在注册表中反解（详情页后端只给 formPath）
const resolvedType = computed(() => {
  if (props.type)
    return props.type
  return resolveFlowTypeByFormPath(props.formPath)
})

const innerRef = ref<any>(null)

defineExpose({
  onSubmit: () => innerRef.value?.onSubmit?.(),
  onSaveDraft: () => innerRef.value?.onSaveDraft?.(),
})
</script>

<template>
  <!-- 按 type 显式渲染对应表单组件（微信小程序不支持 <component :is> 动态组件，故用静态标签 + v-if） -->
  <!-- 新增审批类型：在此加一个 v-else-if 分支即可，无需改动宿主页（start.vue / 详情页） -->
  <LeaveForm
    v-if="resolvedType === 'leave'"
    ref="innerRef"
    :business-id="businessId"
    :readonly="readonly"
    @submit="(p) => emit('submit', p)"
    @save-draft="(p) => emit('saveDraft', p)"
  />
  <!-- 未匹配到流程类型（如后端 formPath 无对应配置）时的空态 -->
  <view v-else class="ffr-empty">
    <text class="i-carbon-document-blank mb-4 text-6xl text-gray-300" />
    <text>暂无表单数据</text>
  </view>
</template>

<style lang="scss" scoped>
.ffr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  color: #bbb;
  font-size: 28rpx;
}
</style>
