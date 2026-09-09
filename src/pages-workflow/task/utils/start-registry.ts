import { addLeave, submitAndFlowStart, updateLeave } from '@/api/workflow/leave'

/**
 * 流程发起配置：每种审批类型在此登记一项即可，通用发起页（task/start.vue）据此统一处理提交/草稿/跳转。
 *
 * 注意：表单组件（task/components/form/FlowFormRenderer.vue）中按 type 显式 v-if 渲染；
 * 详情页仅持后端返回的 task.formPath，由 FlowFormRenderer 内部查本注册表反解为 type。
 *
 * 新增一种审批 =
 * ①写 XxxForm 表单组件（defineExpose onSubmit / onSaveDraft；variables / bizExt 随 submit / saveDraft 事件抛出）,并在 FlowFormRenderer 内加一个 v-else-if 分支
 * ②在此加一条注册（填 name / icon / mode；后端直发起还需 submitAndFlowStartApi）。发起弹窗网格由本表自动派生，无需额外维护。
 */

/** 发起模式：对齐 PC 的 mode 标识，用字符串枚举更清晰 */
export type FlowStartMode = 'backend' | 'frontend'

export interface FlowStartConfig<BizForm = any, BizVO = any> {
  /** 网格/弹窗显示名（如「请假申请」），同时作为发起页导航栏标题 */
  name: string
  /** 网格图标类名（unocss，如「i-carbon-time」） */
  icon: string
  /** 业务数据新增接口 */
  addApi: (form: BizForm) => Promise<BizVO>
  /** 业务数据更新接口（编辑态调用） */
  updateApi: (form: BizForm) => Promise<BizVO>
  /** 表单路径：审批详情里后端返回的 task.formPath 包含该字符串即命中此流程（用于预览组件匹配） */
  formPath: string
  /**
   * 发起模式：
   * - 'frontend'：（默认）前端发起 (可选审批人, 选抄送人, 上传附件)。
   * - 'backend'：后端发起 (自行编写后端逻辑, 由后端发起流程)。
   */
  mode: FlowStartMode
  /**
   * 后端直发起接口（mode==='backend' 时必填）：不同业务的后端发起入口不同，
   * 由各类型自行提供（如请假为 submitAndFlowStart）。mode==='frontend' 时无需配置。
   */
  submitAndFlowStartApi?: (form: Record<string, any>) => Promise<any>
}

export const START_REGISTRY: Record<string, FlowStartConfig> = {
  leave: {
    name: '请假申请',
    icon: 'i-carbon-time',
    addApi: addLeave,
    updateApi: updateLeave,
    formPath: '/workflow/leaveEdit/index',
    // 默认前端发起（与 PC 的 :mode="false" 对齐）
    mode: 'frontend',
    submitAndFlowStartApi: submitAndFlowStart,
  },
}

/**
 * 根据后端返回的审批表单路径（task.formPath）反解流程类型（注册表 key）。
 * 详情预览（FlowFormRenderer）与编辑跳转（WorkflowActions.editInstance）等场景统一调用，
 * 保证「表单路径 -> 流程类型」的匹配逻辑单一来源、与 START_REGISTRY 同步。
 * 匹配方式与 FlowFormRenderer 保持一致：formPath 严格相等。
 */
export function resolveFlowTypeByFormPath(formPath: string): string {
  if (!formPath)
    return ''
  const entry = Object.entries(START_REGISTRY).find(([, cfg]) => formPath === cfg.formPath)
  return entry ? entry[0] : ''
}
