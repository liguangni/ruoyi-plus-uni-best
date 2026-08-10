<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import type { LeaveForm } from '@/api/workflow/leave/types'
import { getLeave } from '@/api/workflow/leave'

// 编辑/预览共用：父页面（通用发起页 task/start 或审批详情 FlowFormRenderer）携带业务 id 进入时回填表单
const props = withDefaults(
  defineProps<{ businessId?: string | number, readonly?: boolean }>(),
  { businessId: '', readonly: false },
)

const emit = defineEmits<{
  (e: 'submit', payload: {
    /** 业务表单数据 */
    form: LeaveForm
    /** 流程定义编码 */
    flowCode: string
    /** 流程变量（由本表单按业务字段构建，如 { leaveDays, userList }） */
    variables: Record<string, unknown>
    /** 业务扩展字段（可选） */
    bizExt?: Record<string, unknown>
  }): void
  (e: 'saveDraft', payload: {
    /** 业务表单数据 */
    form: LeaveForm
    /** 流程定义编码 */
    flowCode: string
    /** 流程变量（由本表单按业务字段构建，如 { leaveDays, userList }） */
    variables: Record<string, unknown>
    /** 业务扩展字段（可选） */
    bizExt?: Record<string, unknown>
  }): void
}>()

const leaveTypeOptions = [
  { value: '1', label: '事假' },
  { value: '2', label: '调休' },
  { value: '3', label: '病假' },
  { value: '4', label: '婚假' },
]

const form = reactive<LeaveForm>({
  id: undefined,
  applyCode: undefined,
  leaveType: undefined,
  startDate: undefined,
  endDate: undefined,
  leaveDays: undefined,
  remark: undefined,
  status: undefined,
})

const startDate = ref('')
const endDate = ref('')
/** 只读（预览）模式下的加载态，避免用 uni.showLoading 遮挡整个页面 */
const loading = ref(false)

const leaveTypeIndex = computed(() => leaveTypeOptions.findIndex(o => o.value === form.leaveType))

// 流程定义：与 PC 端一致
const flowCodeOptions = [
  { value: 'leave1', label: '请假申请-普通' },
  { value: 'leave2', label: '请假申请-排他网关' },
  { value: 'leave3', label: '请假申请-并行网关' },
  { value: 'leave4', label: '请假申请-会签' },
  { value: 'leave5', label: '请假申请-并行会签网关' },
  { value: 'leave6', label: '请假申请-排他并行会签' },
]
// 流程定义：与 PC 端一致，默认 leave1
const flowCode = ref('leave1')
const flowCodeIndex = computed(() => flowCodeOptions.findIndex(o => o.value === flowCode.value))

function onLeaveTypeChange(e: any) {
  const idx = e.detail.value
  form.leaveType = leaveTypeOptions[idx]?.value
}
function onStartChange(e: any) {
  startDate.value = e.detail.value
  form.startDate = `${e.detail.value} 00:00:00`
  // 若已选结束时间且开始晚于结束，则清空结束时间并提示
  if (endDate.value && new Date(startDate.value).getTime() > new Date(endDate.value).getTime()) {
    uni.showToast({ title: '开始时间不能晚于结束时间', icon: 'none' })
    endDate.value = ''
    form.endDate = undefined
  }
  calcDays()
}
function onEndChange(e: any) {
  // 结束时间不得早于开始时间
  if (startDate.value && new Date(e.detail.value).getTime() < new Date(startDate.value).getTime()) {
    uni.showToast({ title: '结束时间不能早于开始时间', icon: 'none' })
    return
  }
  endDate.value = e.detail.value
  form.endDate = `${e.detail.value} 23:59:59`
  calcDays()
}
/** 根据起止日期自动计算请假天数（含首尾） */
function calcDays() {
  if (startDate.value && endDate.value) {
    const diff = new Date(endDate.value).getTime() - new Date(startDate.value).getTime()
    form.leaveDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
  }
}
function onFlowCodeChange(e: any) {
  const idx = e.detail.value
  flowCode.value = flowCodeOptions[idx]?.value
}

/** 只读（预览）模式下，把请假类型编码映射为文案 */
function mapLeaveType(code: string | undefined): string {
  const map = Object.fromEntries(leaveTypeOptions.map(o => [o.value, o.label]))
  return map[code || ''] || code || ''
}

/** 只读（预览）模式下，日期格式化为 YYYY-MM-DD */
function formatDateTime(val: string | undefined): string {
  if (!val)
    return ''
  try {
    const date = new Date(val.replace(/-/g, '/'))
    const p = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
  }
  catch {
    return val
  }
}

/** 把 YYYY-MM-DD HH:mm:ss / YYYY-MM-DD 统一裁剪为 YYYY-MM-DD（picker mode=date 要求格式） */
function toDatePart(val: string | undefined): string {
  if (!val)
    return ''
  // 无空格已是纯日期，直接返回；否则取空格前部分
  const idx = val.indexOf(' ')
  return idx >= 0 ? val.substring(0, idx) : val.substring(0, 10)
}

/** 编辑/预览回填：拉取业务详情写入表单 */
async function loadForEdit() {
  if (!props.businessId)
    return
  // 只读（预览）模式不弹全屏 loading，改用组件内 loading 态
  if (props.readonly)
    loading.value = true
  else
    uni.showLoading({ title: '加载中...', mask: true })
  try {
    const res = await getLeave(props.businessId)
    form.id = res.id
    form.applyCode = res.applyCode
    form.leaveType = res.leaveType
    form.startDate = res.startDate
    form.endDate = res.endDate
    form.leaveDays = res.leaveDays
    form.remark = res.remark
    form.status = res.status
    // picker mode="date" 只接受 YYYY-MM-DD，后端返回带时间时需裁剪掉时间部分
    startDate.value = toDatePart(res.startDate)
    endDate.value = toDatePart(res.endDate)
  }
  finally {
    if (props.readonly)
      loading.value = false
    else
      uni.hideLoading()
  }
}
onMounted(loadForEdit)

/** 公共校验：失败时在表单内 toast 并返回 false */
function validate(): boolean {
  if (!form.leaveType) {
    uni.showToast({ title: '请选择请假类型', icon: 'none' })
    return false
  }
  if (!startDate.value || !endDate.value) {
    uni.showToast({ title: '请选择请假时间', icon: 'none' })
    return false
  }
  if (!form.leaveDays || form.leaveDays <= 0) {
    uni.showToast({ title: '请假天数不正确', icon: 'none' })
    return false
  }
  if (!form.remark) {
    uni.showToast({ title: '请输入请假原因', icon: 'none' })
    return false
  }
  if (!flowCode.value) {
    uni.showToast({ title: '请选择流程定义', icon: 'none' })
    return false
  }
  return true
}

/** 组装 submit / saveDraft 共用的抛出载荷（variables / bizExt 随 emit 一并抛出） */
function buildPayload() {
  return {
    form: { ...form },
    flowCode: flowCode.value,
    variables: { leaveDays: form.leaveDays, userList: ['1', '3', '4'] },
    bizExt: { businessTitle: '请假申请' },
  }
}

function onSubmit() {
  if (!validate())
    return
  emit('submit', buildPayload())
}

/** 保存草稿：校验基础数据后，把表单数据 / 流程变量 / 业务扩展一并抛出；start.vue 负责存业务 + 调 startWorkFlow（不弹窗） */
function onSaveDraft() {
  if (!validate())
    return
  emit('saveDraft', buildPayload())
}

// 暴露方法供父页面底部按钮调用
defineExpose({ onSubmit, onSaveDraft })
</script>

<template>
  <view class="leave-form">
    <view v-if="loading" class="leave-form__loading">
      <RyLoading />
    </view>

    <!-- 预览（只读）模式：纯文本展示已提交的表单数据 -->
    <view v-else-if="readonly" class="leave-form__preview">
      <view class="leave-form__field">
        <text class="leave-form__label">请假类型</text>
        <text class="leave-form__value">{{ mapLeaveType(form.leaveType) }}</text>
      </view>
      <view class="leave-form__field">
        <text class="leave-form__label">开始时间</text>
        <text class="leave-form__value">{{ formatDateTime(form.startDate) }}</text>
      </view>
      <view class="leave-form__field">
        <text class="leave-form__label">结束时间</text>
        <text class="leave-form__value">{{ formatDateTime(form.endDate) }}</text>
      </view>
      <view class="leave-form__field">
        <text class="leave-form__label">请假天数</text>
        <text class="leave-form__value">{{ form.leaveDays || 0 }}</text>
      </view>
      <view class="leave-form__field">
        <text class="leave-form__label">请假原因</text>
        <text class="leave-form__value leave-form__remark">{{ form.remark || '—' }}</text>
      </view>
    </view>

    <!-- 编辑模式：表单控件（新增/编辑共用） -->
    <view v-else class="leave-form__edit">
      <!-- 流程定义仅在新增态显示：编辑态隐藏（flowCode 不应变化，仿 PC v-if="type==='add'"） -->
      <view v-if="!businessId" class="leave-form__field">
        <text class="leave-form__label">流程定义</text>
        <picker
          class="leave-form__control"
          mode="selector"
          :range="flowCodeOptions"
          range-key="label"
          :value="flowCodeIndex"
          @change="onFlowCodeChange"
        >
          <view class="leave-form__picker">
            <text :class="flowCode ? 'is-filled' : 'is-placeholder'">
              {{ flowCodeOptions[flowCodeIndex]?.label || '请选择流程定义' }}
            </text>
            <text class="i-carbon-chevron-down leave-form__arrow" />
          </view>
        </picker>
      </view>

      <view class="leave-form__field">
        <text class="leave-form__label">请假类型</text>
        <picker
          class="leave-form__control"
          mode="selector"
          :range="leaveTypeOptions"
          range-key="label"
          :value="leaveTypeIndex"
          @change="onLeaveTypeChange"
        >
          <view class="leave-form__picker">
            <text :class="form.leaveType ? 'is-filled' : 'is-placeholder'">
              {{ leaveTypeOptions[leaveTypeIndex]?.label || '请选择请假类型' }}
            </text>
            <text class="i-carbon-chevron-down leave-form__arrow" />
          </view>
        </picker>
      </view>

      <view class="leave-form__field">
        <text class="leave-form__label">开始时间</text>
        <picker class="leave-form__control" mode="date" :value="startDate" @change="onStartChange">
          <view class="leave-form__picker">
            <text :class="startDate ? 'is-filled' : 'is-placeholder'">
              {{ startDate || '请选择开始时间' }}
            </text>
            <text class="i-carbon-chevron-down leave-form__arrow" />
          </view>
        </picker>
      </view>

      <view class="leave-form__field">
        <text class="leave-form__label">结束时间</text>
        <picker class="leave-form__control" mode="date" :value="endDate" @change="onEndChange">
          <view class="leave-form__picker">
            <text :class="endDate ? 'is-filled' : 'is-placeholder'">
              {{ endDate || '请选择结束时间' }}
            </text>
            <text class="i-carbon-chevron-down leave-form__arrow" />
          </view>
        </picker>
      </view>

      <view class="leave-form__field">
        <text class="leave-form__label">请假天数</text>
        <view class="leave-form__control leave-form__picker leave-form__picker--disabled">
          <text class="is-filled">{{ form.leaveDays || 0 }}</text>
        </view>
      </view>

      <view class="leave-form__field">
        <text class="leave-form__label">请假原因</text>
        <textarea
          v-model="form.remark"
          class="leave-form__textarea"
          placeholder="请输入请假原因"
          placeholder-class="leave-form__placeholder"
          :maxlength="200"
        />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.leave-form {
  &__field {
    display: flex;
    align-items: flex-start;
    padding: 18rpx 0;
  }

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80rpx 0;
  }

  &__value {
    flex: 1;
    min-width: 0;
    margin-left: 16rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 64rpx;
    word-break: break-all;
  }

  &__remark {
    font-size: 28rpx;
    line-height: 1.6;
  }

  &__label {
    flex-shrink: 0;
    width: 160rpx;
    font-size: 26rpx;
    color: #999;
    line-height: 64rpx;
  }

  &__control {
    flex: 1;
    min-width: 0;
    // margin-left: 16rpx;
  }

  &__picker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64rpx;
    padding: 10rpx 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    font-size: 28rpx;
    box-sizing: border-box;

    &--disabled {
      // background: #f0f1f3;
    }
  }

  &__arrow {
    font-size: 28rpx;
    color: #bbb;
    flex-shrink: 0;
  }

  &__textarea {
    flex: 1;
    min-width: 0;
    min-height: 130rpx;
    padding: 16rpx 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
  }

  &__placeholder {
    color: #bbb;
  }

  .is-placeholder {
    color: #bbb;
  }

  .is-filled {
    color: #333;
  }
}
</style>
