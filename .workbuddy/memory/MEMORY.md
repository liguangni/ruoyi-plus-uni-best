# 项目长期记忆：流程审批(workflow)模块

## 总体原则（用户明确要求）
1. 多端适配（H5 / 微信小程序 / App），界面大气美观、操作简单。
2. 页面展示与接口调用基本按 PC 端（`F:\workspace\Ruoyi-Vue-Plus\plus-ui`）重写，保持一致。参考 `F:\workspace\Ruoyi-Vue-Plus\bell-plus`（按钮放详情页）。

## 审批办理组件架构（2026-07-20 重构）
- 按钮操作栏 **`WorkflowActions.vue`** 留 `src/pages-workflow/task/components/`。
- 4 个办理**弹窗**在 `src/pages-workflow/task/components/actions/`：
  - `TaskVerifyDialog.vue`（props `mode:'pass'|'reject'` + `taskId`/`nodeCode`；completeTask / backProcess 按 mode 分支）
  - `TaskUserOpDialog.vue`（委托/转办/加签，mode 区分单多选；`taskId`）
  - `TaskSubSignDialog.vue`（减签；`taskId`/`nodeName`）
  - `TaskTerminationDialog.vue`（终止；`taskId`）
- 弹窗 props 已精简为 **taskId 透传**（+ 必要 nodeCode/nodeName），子组件自行按 taskId 拉详情。
- PC 字段按 `buttonObj` 显隐：file(附件)/copy(抄送)/pop(下一步审批人)；消息提醒站内信(1)固定、邮件(2)/短信(3)可勾选。接口：completeTask/backProcess/taskOperation/terminationTask。

## 公共能力 / 全局样式
- `src/pages-workflow/components/AttachmentUpload/AttachmentUpload.vue`：多端附件上传。「上传图片」`uni.chooseImage`；「文档/压缩包」H5/App `uni.chooseFile`、小程序 `wx.chooseMessageFile`。走 `uploadOss({filePath,name:'file'})`。回传逗号分隔 ossId。
  + **H5 待办**：`uni.uploadFile` 接收 blob URL 时 filename 变 `file-xxx`（无后缀）。用户已回退 `fetch+FormData` 方案，待其重新梳理。
  + 附件**回显**文件名：上传用原 `f.name`（带后缀）；reload 用 `listByIds` 的 `originalName`（后端 fileName 是 OSS key 无后缀）。
- **全局样式 `src/style/custom.scss`**（被 `index.scss`/`main.ts` 引入）：`.wf-dialog__footer`、`.wf-btn`（`--grow`/`--block`/`--more`/`--primary-filled`/`__icon.is-spinning`+`@keyframes wf-spin`）、`.wf-field__label`/`.wf-option`/`.wf-textarea`/`.wf-copy`/`.wf-msg-item`（透明底+边框，选中态绿色边框文字）。改动只改此处。
- **`WorkflowActions.vue` 的 `.wf-btn` 是列表页通用版（scoped，覆盖全局）**，多 `--right`/`--success`/`--warning`/`--danger`/`--primary` 变体。

## 已知坑
- **Vue3 scoped 不向子组件 root 传 `data-v`**：父组件给子组件 root 挂 class 写的样式**不生效**。正确做法：父模板里包一个 wrapper `<view class="xxx">` 再写样式。教训：TaskStartDialog footer 按钮区域最终用父模板 `#footer` 内包 wrapper 解决（之前 `footer-class` 方案完全无效）。
- **WorkflowPopup 内置滚动+footer**（`src/pages-workflow/task/components/popup/WorkflowPopup.vue`，原地渲染、无 Teleport）：header/body[内置 scroll-view，scroll 默认 true]/footer 三块，footer 为具名 slot 在滚动区外、绝不被遮。关闭内置滚动传 `:scroll="false"`。detail.vue 的 scroll-view 用 `flex:1;min-height:0`，底部操作栏为 flex 子元素（非 fixed）。响应已被 `handleResponse` 解包为 `data`，接口结果直接取 `res` 不再取 `.res.data`。
- **微信小程序不支持 `<Teleport>`（编译期报 `not supported: Teleport`）**：uni-app 小程序编译器不支持 Vue `<Teleport>`。**最终方案：彻底不用 Teleport/传送门**——所有弹窗（WorkflowPopup / UserSelector / DeptSelector / WorkflowDefinitionSelect / WorkflowCategorySelect）移除 `<Teleport>` 与曾试过的 `AppTeleport` 跨端传送门组件，改为原地渲染；overlay `z-index:1100` 同处 `.page-container`（无 transform）的层叠上下文，正常盖过列表页 tabbar。
- **弹窗盖 tabbar 的层叠关系**：tabbar 是自定义组件 `WorkflowTabbar.vue`（`.wf-tabbar` `position:fixed`），与弹窗同为 `.page-container`（`position:fixed; overflow:hidden; 无 transform/filter`，故内部 `position:fixed` 弹窗不被裁剪）的直接子节点。`.page-container` 无 transform → popup 原地渲染不被裁剪、必然盖过 tabbar。**为彻底消除层级干扰，已将 `.wf-tabbar` 的 `z-index` 从 100 降到 1**（popup overlay 1100 仍高于它）。复用约定：页级弹窗/sheet 直接原地渲染即可，不要再引入 Teleport/传送门组件。
- **Token 滑动过期**：登录后 180min 有效，但 30min 未活跃即失效。`src/store/token.ts` 用 `lastActiveTime` 代理。`src/http/request.ts` 成功响应刷新 `setLastActiveTime()`，401→`toLoginPage()`（不带 redirect）。当前单 token 模式，无感续期未做。
- **微信小程序 `scroll-view` 内可点击项必须 catchtap 源头拦截（否则穿透遮罩关闭弹窗）**：`scroll-view` 是原生组件，它内部子节点的 `tap` 事件冒泡时会**跳过中间层 catchtap 直接穿透到 overlay 的 bindtap**。后果：点击列表项（如 DeptSelector 部门项）会触发遮罩 `@click="onClose"` 关闭弹窗，且 `onClose` 清空已选导致选择未返回。H5 端因普通 DOM 树 `stopPropagation` 可靠而正常。**修复范式**：在事件起源节点（列表项容器 `<view>`）加 `@click.stop`（编译为 catchtap），从源头拦住，不依赖中间 panel 的 catchtap。DeptSelector 已按此修复（`.dept-select__item` 加 `@click.stop`）。凡在 `scroll-view` 内放可点击项、外层又有遮罩关闭逻辑的弹窗（UserSelector / DeptSelector / WorkflowDefinitionSelect / WorkflowCategorySelect 等同构弹窗）都应遵循。

## 组件目录约定（2026-07-23 调整为扁平结构）
- 公共组件统一平铺在 `src/components/<ComponentName>/<ComponentName>.vue`（每个组件一个以**组件名**命名的文件夹，文件名即组件名），由 easycom + `vite-plugin-uni-components`(`deep:true`, `directoryAsNamespace:false`) 递归扫描自动导入，模板直接 `<ComponentName>`。
- 已落地：`UserAvatar`、`RyLoading`、`DeptSelector`、`UserSelector`、`DictTag`。旧的 `core/`、`system/` 子分组目录已移除——4 个嵌套组件（`core/avatar`→`UserAvatar/UserAvatar.vue` 顺带重命名、`core/RyLoading`、`system/DeptSelector`、`system/UserSelector`）均上移到此扁平结构。
- 改组件后 `src/types/components.d.ts` 由插件自动重生（带 `@ts-nocheck`，仅提供模板类型）。注意：文件监视器可能在编辑时回滚个别条目为旧路径，下次 `pnpm dev`/`build` 会按真实文件系统重新生成正确路径；该文件不影响编译（type-check 仍 PASS）。
- **原生 `<input type="file">` 在 uni-app 模板会触发 type 类型错误，H5 用 `document.createElement` 动态创建。**

## 流程发起链路（2026-07-22；架构：每种审批独立页面，跳转式）
用户选业务类型 → 跳独立发起页 → 填表单（先存业务拿 businessId）→ startWorkFlow 拿 taskId → TaskStartDialog（选审批人/抄送/附件/意见）→ completeTask 办首任务。
- 业务类型选择：`WorkflowStartPopup.vue`（items 带 url，选完即 `uni.navigateTo`，不再 emit `@select`）。发起宿主：`task/start.vue` 通用页，按 `?type` 读 `START_REGISTRY`（`src/pages-workflow/task/utils/start-registry.ts`）渲染对应表单。新增类型 = ①`WorkflowStartPopup.items` 加项(url→`/pages-workflow/task/start?type=<key>`) + ②`start-registry.ts` 加一条(`title`/`addApi`/`updateApi`/`formPath`/`mode`；`backend` 模式还需 `submitApi`) + ③表单组件放 `task/components/form/<type>/` 且 `FlowFormRenderer` 加 `v-else-if` 分支。
- **启动弹窗逻辑内联于 `task/start.vue`**：`showStartDialog`/`startTaskId` 两个 ref 与 `startWorkFlow` 调用均直接写在 `onSubmit` 内（前端发起分支调 `startWorkFlow` 拿 taskId 并弹 TaskStartDialog）；原 `composables/useFlowStart.ts` 因 start.vue 已成为**唯一**公共发起页、不再有任何复用需求，已于 2026-07-24 删除。
- 业务表单：`src/pages-workflow/task/components/form/leave/LeaveForm.vue`（`@submit({form, flowCode, variables, bizExt?})` / `@save-draft({form, flowCode, variables, bizExt?})`，**按钮已移出到发起页固定底部栏**，通过 `defineExpose({onSubmit,onSaveDraft})` 供父调；起止时间校验：结束不早于开始；只读预览态复用纯文本分支）。由 `FlowFormRenderer` 按 type 分发。
- **mode 与草稿语义（2026-07-24 调整）**：`FlowStartMode = 'backend' | 'frontend'`（替代原 boolean）。`frontend`=先存业务→`startWorkFlow`→弹 TaskStartDialog 选人/抄送/附件并 completeTask 首任务；`backend`=调各类型配置的 `submitApi` 一步「存业务+发起流程」，且后台模式**隐藏保存草稿按钮**（仅「提交申请」）。**草稿**=存业务 + 调 `startWorkFlow` 进入草稿态（手机端无业务列表，草稿必须建流程实例才能在「我发起」看到），但**不弹** TaskStartDialog（弹窗仅属于提交）。`WorkflowStartPopup` 点击时若 `mode==='backend'` 且未配置 `submitApi` 则 toast「未配置发起接口」并不跳转。
- **防重复发起**：TaskVerifyDialog(原 TaskStartDialog 已合并) emit 区分 `success`(点提交 completeTask 成功→跳「我发起」列表 `/pages-workflow/task/index?tab=document`) 与 `cancel`(取消/遮罩/X→同样跳「我发起」列表 `/pages-workflow/task/index?tab=document`；草稿实例已通过 `startWorkFlow` 建立，留在列表可编辑/删除，不再进草稿详情页)。`start.vue` 的 cancel 跳列表避免停留表单页重复提交。两个 UserSelector 置于 WorkflowPopup 之外平级（避免嵌套弹窗相互裁剪）。
- 接口：`leave/index.ts`(addLeave 返 LeaveVO)、`task/index.ts`(startWorkFlow 返 {taskId})、`task/types.ts`(StartProcessBo)。表单页 `from=document` 详情页底部自动显示 WorkflowActions。
- **底部按钮固定栏约定（2026-07-22 最终方案）**：发起页用 `page-container`(flex 列) + `scroll-view`(flex:1,min-height:0) 表单区 + 固定底部栏 `.leave-page__footer`(scoped，flex-shrink:0, 含「保存草稿」+「提交申请」，高度缩小如 min-height 72rpx)；表单区底部留白避免被遮挡。按钮 `@click` 调 `formRef.value.onSubmit()/.onSaveDraft()`。
- **流程类型反解约定（2026-07-27 新增 `resolveFlowTypeByFormPath`）**：`task.formPath`（后端审批表单路径）与 `START_REGISTRY` 每项的 `formPath` **严格相等**反解 type key，统一用于「详情预览(FlowFormRenderer)」与「编辑跳转(WorkflowActions.editInstance)」。新增审批类型在 `start-registry.ts` 登记 `formPath` + 在 `FlowFormRenderer` 加 `v-else-if` 分支后，编辑跳转自动支持，无需再硬编码 `flowCode.startsWith(...)`。
