<template>
  <view class="page-container">
    <view class="page-content">
      <view v-if="faq" class="detail-page">
        <text class="question-text">{{ faq.question }}</text>
        <view class="divider" />
        <rich-text class="answer-text" :nodes="faq.answer" />
      </view>
      <view v-else class="empty-state">
        <text class="empty-text">问题不存在</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FaqItem } from './help.config'
import { getFaqById } from './help.config'

definePage({
  style: {
    navigationBarTitleText: '问题详情',
  },
})

const faq = ref<FaqItem | undefined>()

onLoad((options) => {
  if (options?.id) {
    const id = Number(options.id)
    faq.value = getFaqById(id)
    if (!faq.value) {
      uni.showToast({
        title: '问题不存在',
        icon: 'none',
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.detail-page {
  background-color: #fff;
  padding: 30rpx;
}

.question-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.6;
}

.divider {
  height: 1rpx;
  background-color: #eee;
  margin: 30rpx 0;
}

.answer-text {
  font-size: 30rpx;
  color: #666;
  line-height: 1.8;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400rpx;

  .empty-text {
    font-size: 30rpx;
    color: #999;
  }
}
</style>
