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
            >
          </view>
        </view>

        <view v-for="group in faqGroups" :key="group.title" class="section">
          <view class="section-header">
            <view class="section-icon" :style="{ backgroundColor: group.bgColor }">
              <view :class="group.icon" :style="{ color: group.iconColor }" />
            </view>
            <text class="section-title">{{ group.title }}</text>
          </view>
          <view class="faq-list">
            <view
              v-for="(faq, idx) in group.items"
              :key="idx"
              class="faq-item"
              @click="handleFaqClick(faq)"
            >
              <text class="faq-text">{{ faq.question }}</text>
              <view class="i-carbon-chevron-right text-gray-400" />
            </view>
          </view>
        </view>

        <view class="footer">
          <text class="footer-text">找不到答案？</text>
          <text class="footer-link" @click="handleContact">向我提问吧</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
definePage({
  style: {
    navigationBarTitleText: '帮助中心',
  },
})

const searchKey = ref('')

const faqGroups = [
  {
    title: '若依问题',
    icon: 'iconfont icon-github',
    bgColor: '#f0f4ff',
    iconColor: '#5b8cff',
    items: [
      { question: '若依开源吗？', answer: '开源' },
      { question: '若依可以商用吗？', answer: '可以' },
      { question: '若依官网地址多少？', answer: 'http://ruoyi.vip' },
      { question: '若依文档地址多少？', answer: 'http://doc.ruoyi.vip' },
    ],
  },
  {
    title: '其他问题',
    icon: 'iconfont icon-help',
    bgColor: '#fff4e6',
    iconColor: '#f5a623',
    items: [
      { question: '如何退出登录？', answer: '请点击[我的] - [应用设置] - [退出登录]即可退出登录' },
      { question: '如何修改用户头像？', answer: '请点击[我的] - [选择头像] - [点击提交]即可更换用户头像' },
      { question: '如何修改登录密码？', answer: '请点击[我的] - [应用设置] - [修改密码]即可修改登录密码' },
    ],
  },
]

function handleFaqClick(faq: { question: string, answer: string }) {
  uni.navigateTo({
    url: `/pages-core/common/textview/textview?title=${faq.question}&content=${faq.answer}`,
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
