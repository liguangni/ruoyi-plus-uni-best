<script lang="ts" setup>
definePage({
  // 使用 type: "home" 属性设置首页，其他页面不需要设置，默认为page
  type: 'home',
  style: {
    navigationBarTitleText: '首页',
  },
})

console.log('index/index 首页打印了')

onLoad(() => {
  console.log('测试 uni API 自动引入: onLoad')
})
</script>

<template>
  <view class="page-container pg-tabbar bg-white">
    <view class="page-content p-2">
      <view class="mt-10 block">
        <image src="/static/logo.svg" alt="" class="mx-auto block h-28 w-28" />
      </view>
      <view class="mt-4 text-center text-2xl text-[#d14328]">
        Ruoyi-Plus-Uni-Best
      </view>
      <view class="mb-8 mt-2 text-center text-2xl">
        最好用的 uniapp 开发模板
      </view>

      <view class="m-auto mb-2 max-w-100 text-center indent text-4">
        <p style="line-height: 2;">
          基于unibest构建
        </p>
        <p style="line-height: 2;">
          适配Ruoyi-Vue-Plus/Ruoyi-Cloud-Plus
        </p>
        <p style="line-height: 2;">
          支持工作流发起和审批
        </p>
      </view>
    </view>
  </view>
</template>
