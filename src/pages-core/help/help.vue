<template>
  <view class="page-container">
    <view class="page-content">
      <view class="help-page">
        <view class="header">
          <view class="header-content">
            <text class="header-title">Hi，有什么可以帮您？</text>
            <text class="header-subtitle">点击下方问题快速获取答案</text>
          </view>
        </view>

        <view class="search-bar">
          <view class="search-input">
            <view class="i-carbon-search mr-2 text-gray-400" />
            <input
              v-model="searchKey"
              placeholder="请输入您遇到的问题"
              placeholder-class="placeholder"
              confirm-type="search"
              @input="handleSearch"
            >
          </view>
        </view>

        <template v-if="isSearching">
          <view class="section">
            <view class="section-header">
              <text class="section-title">搜索结果</text>
              <text class="search-count">找到 {{ searchResults.length }} 个相关问题</text>
            </view>
            <view class="faq-list">
              <view
                v-for="faq in searchResults"
                :key="faq.id"
                class="faq-item"
                @click="handleFaqClick(faq)"
              >
                <text class="faq-text">{{ faq.question }}</text>
                <view class="i-carbon-chevron-right text-gray-400" />
              </view>
              <view v-if="searchResults.length === 0" class="empty-result">
                <text class="empty-text">未找到相关问题</text>
              </view>
            </view>
          </view>
        </template>

        <template v-else>
          <view v-for="group in faqGroups" :key="group.title" class="section">
            <view class="section-header">
              <view class="section-icon" :style="{ backgroundColor: group.bgColor }">
                <view :class="group.icon" :style="{ color: group.iconColor }" />
              </view>
              <text class="section-title">{{ group.title }}</text>
            </view>
            <view class="faq-list">
              <view
                v-for="faq in group.items"
                :key="faq.id"
                class="faq-item"
                @click="handleFaqClick(faq)"
              >
                <text class="faq-text">{{ faq.question }}</text>
                <view class="i-carbon-chevron-right text-gray-400" />
              </view>
            </view>
          </view>
        </template>

        <view class="footer">
          <text class="footer-text">找不到答案？</text>
          <text class="footer-link" @click="handleContact">向我提问吧</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { FaqItem } from './help.config'
import { faqGroups, searchFaq } from './help.config'

definePage({
  style: {
    navigationBarTitleText: '帮助中心',
  },
})

const searchKey = ref('')
const searchResults = ref<FaqItem[]>([])
const isSearching = computed(() => searchKey.value.trim().length > 0)

function handleSearch() {
  if (searchKey.value.trim()) {
    searchResults.value = searchFaq(searchKey.value)
  }
  else {
    searchResults.value = []
  }
}

function handleFaqClick(faq: FaqItem) {
  uni.navigateTo({
    url: `/pages-core/help/detail?id=${faq.id}`,
  })
}

function handleContact() {
  uni.navigateTo({
    url: '/pages-core/about/about',
  })
}
</script>

<style lang="scss" scoped>
.help-page {
  min-height: 100%;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  padding: 60rpx 40rpx 80rpx;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;

  .header-content {
    display: flex;
    flex-direction: column;
  }

  .header-title {
    font-size: 38rpx;
    font-weight: bold;
    color: #fff;
  }

  .header-subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 12rpx;
  }
}

.search-bar {
  margin: -40rpx 30rpx 0;
  position: relative;
  z-index: 10;

  .search-input {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 40rpx;
    padding: 24rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

    input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .placeholder {
      color: #bbb;
    }
  }
}

.section {
  margin: 30rpx 30rpx 0;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .section-icon {
    width: 48rpx;
    height: 48rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 14rpx;
    font-size: 24rpx;
  }

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .search-count {
    margin-left: auto;
    font-size: 24rpx;
    color: #999;
  }
}

.faq-list {
  .faq-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .faq-text {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;
    }
  }

  .empty-result {
    padding: 60rpx 0;
    text-align: center;

    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0 80rpx;
  gap: 10rpx;

  .footer-text {
    font-size: 28rpx;
    color: #666;
  }

  .footer-link {
    font-size: 28rpx;
    color: #7c5cfc;
    font-weight: 500;
  }
}
</style>
