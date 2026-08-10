<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { pageByTaskCopy, pageByTaskFinish, pageByTaskWait } from '@/api/workflow/task'
import { pageByCurrent } from '@/api/workflow/instance'
import { APPROVAL_TAB_KEYS } from './utils/workflow'
import type { ApprovalTabbarType } from './utils/workflow'
import WorkflowStartPopup from './components/WorkflowStartPopup.vue'
import WorkflowTabbar from './components/WorkflowTabbar.vue'
import WorkflowList from './components/WorkflowList.vue'

definePage({
  style: {
    navigationBarTitleText: '流程审批',
  },
})

const tabbar = ref<ApprovalTabbarType>('waiting')

/** 通过 url 参数 tab 指定初始切换的 tab，例如 ?tab=waiting 切换到我的待办 */
onLoad((options) => {
  const key = options?.tab
  if (key && APPROVAL_TAB_KEYS.includes(key as ApprovalTabbarType)) {
    tabbar.value = key as ApprovalTabbarType
  }
})

/** 发起申请弹窗 */
const showPopup = ref(false)
</script>

<template>
  <view class="page-container pg-tabbar bg-white">
    <view class="page-content">
      <!-- 我的待办 -->
      <WorkflowList
        v-if="tabbar === 'waiting'"
        tab-type="waiting"
        :api-fn="pageByTaskWait"
      />
      <!-- 我的已办 -->
      <WorkflowList
        v-else-if="tabbar === 'finish'"
        tab-type="finish"
        :api-fn="pageByTaskFinish"
      />
      <!-- 我的抄送 -->
      <WorkflowList
        v-else-if="tabbar === 'copy'"
        tab-type="copy"
        :api-fn="pageByTaskCopy"
      />
      <!-- 我的发起 -->
      <WorkflowList
        v-else-if="tabbar === 'document'"
        tab-type="document"
        :api-fn="pageByCurrent"
      />
    </view>

    <WorkflowTabbar v-model="tabbar" @toggle-popup="showPopup = true" />

    <!-- 发起申请弹窗 -->
    <WorkflowStartPopup v-model="showPopup" />
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  background-color: #f5f7fa;
}

.page-content {
  flex: 1;
  overflow: hidden;
}
</style>
