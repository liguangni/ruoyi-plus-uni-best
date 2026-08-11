<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { listUser } from '@/api/system/user'
import type { UserVO } from '@/api/system/user/types'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    /** 单选/多选 */
    mode?: 'single' | 'multiple'
    /** 允许选择的人员ID（逗号分隔） */
    allowUserIds?: string
    /** 已选用户回显数据 */
    defaultSelected?: UserVO[]
  }>(),
  {
    mode: 'multiple',
    allowUserIds: '',
    defaultSelected: () => [],
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', users: UserVO[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const showDeptPopup = ref(false)
const showSelectedPreview = ref(false)

const activeDeptId = ref<string>('')
const activeDeptName = ref<string>('')

const users = ref<UserVO[]>([])
const userLoading = ref(false)
const userFinished = ref(false)
const userPage = ref(1)
const userNameKeyword = ref('')
const nickNameKeyword = ref('')

const selectedUsers = ref<UserVO[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null

/** 清除部门筛选：恢复加载全部人员 */
function clearDept() {
  activeDeptId.value = ''
  activeDeptName.value = ''
  userPage.value = 1
  userFinished.value = false
  users.value = []
  loadUsers()
}

/** 部门选择确认：回填部门筛选条件并重新加载人员 */
function onDeptConfirm(depts: Array<{ id: string | number, label: string }>) {
  const dept = depts[0]
  activeDeptId.value = dept ? String(dept.id) : ''
  activeDeptName.value = dept?.label || ''
  userPage.value = 1
  userFinished.value = false
  users.value = []
  loadUsers()
}

/** 分页加载人员列表，会叠加用户名/昵称/部门/白名单等筛选条件 */
async function loadUsers() {
  if (userLoading.value || userFinished.value)
    return
  userLoading.value = true
  try {
    const params: any = {
      pageNum: userPage.value,
      pageSize: 20,
    }
    if (userNameKeyword.value)
      params.userName = userNameKeyword.value
    if (nickNameKeyword.value)
      params.nickName = nickNameKeyword.value
    if (activeDeptId.value)
      params.deptId = activeDeptId.value
    if (props.allowUserIds)
      params.userIds = props.allowUserIds

    const res = await listUser(params)
    const rows = res?.rows || []
    if (userPage.value === 1)
      users.value = rows
    else
      users.value.push(...rows)
    if (rows.length < 20)
      userFinished.value = true
    userPage.value++
  }
  catch {
    // ignore
  }
  finally {
    userLoading.value = false
  }
}

/** 输入防抖：停止输入 300ms 后触发搜索 */
function onSearchInput() {
  if (searchTimer)
    clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    onSearch()
  }, 300)
}

/** 重置分页并重新加载人员列表 */
function onSearch() {
  userPage.value = 1
  userFinished.value = false
  users.value = []
  loadUsers()
}

/** 判断指定用户是否已选中 */
function isSelected(user: UserVO): boolean {
  return selectedUsers.value.some(u => String(u.userId) === String(user.userId))
}

/** 切换用户选中状态（单选模式直接替换，多选模式可增删） */
function toggleUser(user: UserVO) {
  if (props.mode === 'single') {
    selectedUsers.value = [user]
    return
  }
  const idx = selectedUsers.value.findIndex(u => String(u.userId) === String(user.userId))
  if (idx >= 0)
    selectedUsers.value.splice(idx, 1)
  else
    selectedUsers.value.push(user)
}

/** 从已选列表中移除指定用户（预览弹窗内使用） */
function removeSelected(user: UserVO) {
  const idx = selectedUsers.value.findIndex(u => String(u.userId) === String(user.userId))
  if (idx >= 0)
    selectedUsers.value.splice(idx, 1)
}

/** 当前已加载人员是否全部被选中（用于全选按钮自适应状态） */
const selectedUserIds = computed(() => new Set(selectedUsers.value.map(u => String(u.userId))))
const allLoadedSelected = computed(() =>
  users.value.length > 0 && users.value.every(u => selectedUserIds.value.has(String(u.userId))),
)

/** 全选/取消全选：根据当前已加载人员的选中状态切换 */
function toggleSelectAll() {
  if (!users.value.length)
    return
  const map = new Map(selectedUsers.value.map(u => [String(u.userId), u]))
  if (allLoadedSelected.value) {
    users.value.forEach(u => map.delete(String(u.userId)))
  }
  else {
    users.value.forEach((u) => {
      if (!map.has(String(u.userId)))
        map.set(String(u.userId), u)
    })
  }
  selectedUsers.value = Array.from(map.values())
}

/** 清空已选：清空当前工作选中的人员列表 */
function clearSelected() {
  if (!selectedUsers.value.length)
    return
  selectedUsers.value = []
}

/** 确认选择：回传已选用户并关闭面板 */
function onConfirm() {
  emit('confirm', [...selectedUsers.value])
  selectedUsers.value = []
  visible.value = false
}

/** 关闭面板：丢弃未确认的选择 */
function onClose() {
  selectedUsers.value = []
  visible.value = false
}

watch(visible, (val) => {
  if (val) {
    // 回显已选用户（优先使用 defaultSelected，其次从 allowUserIds 解析）
    selectedUsers.value = props.defaultSelected.length
      ? [...props.defaultSelected]
      : []
    userNameKeyword.value = ''
    nickNameKeyword.value = ''
    activeDeptId.value = ''
    activeDeptName.value = ''
    userPage.value = 1
    userFinished.value = false
    users.value = []
    showDeptPopup.value = false
    showSelectedPreview.value = false
    loadUsers()
  }
})
</script>

<template>
  <view v-if="visible" class="user-select-overlay" @click.stop="onClose">
    <view class="user-select" @click.stop>
      <!-- 顶部 -->
      <view class="user-select__header">
        <text class="user-select__title">选择人员</text>
        <view class="user-select__close" @click="onClose">
          <text class="i-carbon-close" style="font-size: 36rpx" />
        </view>
      </view>

      <!-- 搜索栏 -->
      <view class="user-select__search">
        <view class="user-select__search-wrap">
          <text class="i-carbon-search user-select__search-icon" />
          <input
            class="user-select__search-input"
            type="text"
            :value="userNameKeyword"
            placeholder="请输入用户名称"
            placeholder-class="user-select__placeholder"
            confirm-type="search"
            @input="(e: any) => { userNameKeyword = e.detail.value; onSearchInput() }"
            @confirm="onSearch"
          >
          <text v-if="userNameKeyword" class="i-carbon-close user-select__search-clear" @click="userNameKeyword = ''; onSearch()" />
        </view>
        <view class="user-select__search-wrap">
          <text class="i-carbon-search user-select__search-icon" />
          <input
            class="user-select__search-input"
            type="text"
            :value="nickNameKeyword"
            placeholder="请输入用户昵称"
            placeholder-class="user-select__placeholder"
            confirm-type="search"
            @input="(e: any) => { nickNameKeyword = e.detail.value; onSearchInput() }"
            @confirm="onSearch"
          >
          <text v-if="nickNameKeyword" class="i-carbon-close user-select__search-clear" @click="nickNameKeyword = ''; onSearch()" />
        </view>
      </view>

      <!-- 批量操作工具栏 -->
      <view class="user-select__toolbar">
        <view class="user-select__toolbar-left">
          <text class="user-select__count">已选 {{ selectedUsers.length }} 人</text>
          <view
            v-if="selectedUsers.length > 0"
            class="user-select__preview-btn"
            @click="showSelectedPreview = true"
          >
            <text class="i-carbon-view user-select__preview-icon" />
            <text>预览</text>
          </view>
        </view>
        <view
          class="user-select__toolbar-btn"
          :class="{ 'is-disabled': !users.length }"
          @click="toggleSelectAll"
        >
          <text :class="allLoadedSelected ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" class="user-select__toolbar-icon" />
          <text>全选</text>
        </view>
      </view>

      <!-- 用户列表 -->
      <scroll-view
        class="user-select__body"
        scroll-y
        @scrolltolower="loadUsers"
      >
        <view
          v-for="user in users"
          :key="user.userId"
          class="user-select__item"
          :class="{ 'is-selected': isSelected(user) }"
          @click="toggleUser(user)"
        >
          <view class="user-select__item-avatar">
            <text class="i-carbon-user" />
          </view>
          <view class="user-select__item-info">
            <text class="user-select__item-name">{{ user.nickName }}</text>
            <text class="user-select__item-dept">{{ user.deptName || '' }}</text>
          </view>
          <view class="user-select__item-right">
            <view
              v-if="mode === 'multiple'"
              class="user-select__checkbox"
              :class="{ 'is-checked': isSelected(user) }"
            >
              <text v-if="isSelected(user)" class="i-carbon-checkmark" />
            </view>
            <view
              v-else
              class="user-select__radio"
              :class="{ 'is-checked': isSelected(user) }"
            />
          </view>
        </view>

        <view v-if="userLoading" class="user-select__loading">
          <RyLoading text="加载中..." size="28rpx" color="#999" />
        </view>

        <view v-if="userFinished && users.length > 0" class="user-select__finished">
          <text>没有更多了</text>
        </view>

        <view v-if="!userLoading && users.length === 0" class="user-select__empty">
          <view class="user-select__empty-icon">
            <text class="i-carbon-user-follow" />
          </view>
          <text class="user-select__empty-text">暂无数据</text>
        </view>
      </scroll-view>

      <!-- 底部 -->
      <view class="user-select__footer">
        <view class="user-select__footer-left">
          <view
            class="user-select__dept-btn"
            :class="{ 'is-active': !!activeDeptId }"
            @click="showDeptPopup = true"
          >
            <text class="i-carbon-building user-select__dept-icon" />
            <text class="user-select__dept-text">{{ activeDeptName || '选择部门' }}</text>
            <text v-if="activeDeptId" class="i-carbon-close user-select__dept-clear" @click.stop="clearDept" />
          </view>
        </view>
        <view class="user-select__footer-right">
          <view class="user-select__confirm-btn" @click="onConfirm">
            确定
          </view>
        </view>
      </view>
    </view>

    <!-- 部门选择（独立组件，替换原内嵌部门弹窗） -->
    <DeptSelector
      v-model="showDeptPopup"
      mode="single"
      :default-selected="activeDeptId ? [{ id: activeDeptId, label: activeDeptName }] : []"
      @confirm="onDeptConfirm"
    />

    <!-- 已选人员预览弹窗 -->
    <view v-if="showSelectedPreview" class="preview-overlay" @click.stop="showSelectedPreview = false">
      <view class="preview-popup" @click.stop>
        <view class="preview-popup__header">
          <text class="preview-popup__title">已选人员列表</text>
          <view class="preview-popup__close" @click="showSelectedPreview = false">
            关闭
          </view>
        </view>
        <scroll-view class="preview-popup__body" scroll-y>
          <view
            v-for="user in selectedUsers"
            :key="user.userId"
            class="preview-popup__item"
          >
            <view class="preview-popup__item-avatar">
              <text class="i-carbon-user" />
            </view>
            <view class="preview-popup__item-info">
              <text class="preview-popup__item-name">{{ user.nickName }}</text>
              <text class="preview-popup__item-dept">{{ user.deptName || '' }}</text>
            </view>
            <text class="i-carbon-close preview-popup__remove" @click="removeSelected(user)" />
          </view>
          <view v-if="selectedUsers.length === 0" class="preview-popup__empty">
            <text>暂无已选人员</text>
          </view>
        </scroll-view>
        <view class="preview-popup__toolbar">
          <text class="preview-popup__toolbar-count">已选 {{ selectedUsers.length }} 人</text>
          <view
            v-if="selectedUsers.length > 0"
            class="preview-popup__clear"
            @click="clearSelected"
          >
            <text class="i-carbon-trash-can" />
            <text>清空</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.user-select-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.user-select {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  height: 75vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;

  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  &__close {
    position: absolute;
    right: 32rpx;
    padding: 8rpx;
    color: #999;
  }

  &__search {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    align-items: center;
    flex-shrink: 0;
    border-bottom: 1rpx solid #f5f5f5;
  }

  &__search-wrap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    background: #f5f7fa;
    border-radius: 12rpx;
  }

  &__search-input {
    flex: 1;
    min-width: 0;
    font-size: 26rpx;
    color: #333;
    height: 40rpx;
    line-height: 40rpx;
  }

  &__search-icon {
    color: #999;
    font-size: 26rpx;
    flex-shrink: 0;
  }

  &__search-clear {
    color: #bbb;
    font-size: 24rpx;
    flex-shrink: 0;
    padding: 4rpx;
  }

  &__placeholder {
    color: #bbb;
    font-size: 26rpx;
  }

  &__dept-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    background: #f5f7fa;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: #666;
    max-width: 220rpx;

    &.is-active {
      background: rgba(1, 141, 113, 0.08);
      color: #018d71;
    }
  }

  &__dept-icon {
    font-size: 24rpx;
    flex-shrink: 0;
  }

  &__dept-text {
    font-size: 24rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140rpx;
  }

  &__dept-clear {
    font-size: 20rpx;
    flex-shrink: 0;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
    flex-shrink: 0;
  }

  &__toolbar-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-width: 0;
  }

  &__toolbar-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 4rpx;
    color: #018d71;
    font-size: 24rpx;

    &:active {
      opacity: 0.7;
    }

    &.is-disabled {
      opacity: 0.4;
    }
  }

  &__toolbar-icon {
    font-size: 24rpx;
  }

  &__toolbar-count {
    margin-left: auto;
    font-size: 24rpx;
    color: #999;
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &.is-selected {
      background: rgba(1, 141, 113, 0.04);
    }
  }

  &__item-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: #e8f5f2;
    color: #018d71;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    flex-shrink: 0;
    margin-right: 20rpx;
  }

  &__item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
  }

  &__item-name {
    font-size: 28rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-dept {
    font-size: 22rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-right {
    flex-shrink: 0;
    margin-left: 16rpx;
  }

  &__checkbox {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    color: #fff;
    transition: all 0.2s;

    &.is-checked {
      background: #018d71;
      border-color: #018d71;
    }
  }

  &__radio {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;
    position: relative;
    transition: all 0.2s;

    &.is-checked {
      border-color: #018d71;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 18rpx;
        height: 18rpx;
        background: #018d71;
        border-radius: 50%;
      }
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    gap: 12rpx;
    color: #999;
    font-size: 24rpx;
  }

  &__finished {
    display: flex;
    justify-content: center;
    padding: 30rpx 0;
    color: #bbb;
    font-size: 24rpx;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    gap: 20rpx;
  }

  &__empty-icon {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    color: #ccc;
  }

  &__empty-text {
    font-size: 26rpx;
    color: #bbb;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    background: #fff;
  }

  &__footer-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__footer-right {
    display: flex;
    align-items: center;
  }

  &__confirm-btn {
    padding: 10rpx 32rpx;
    font-size: 26rpx;
    color: #fff;
    background: #018d71;
    border-radius: 8rpx;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.7;
    }
  }

  &__count {
    font-size: 26rpx;
    color: #666;
  }

  &__preview-btn {
    display: flex;
    align-items: center;
    gap: 4rpx;
    font-size: 26rpx;
    color: #018d71;
    padding: 0 8rpx;
  }

  &__preview-icon {
    font-size: 24rpx;
  }
}

.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.preview-popup {
  width: 100%;
  height: 50vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
  }

  &__close {
    color: #999;
    font-size: 26rpx;
    padding: 8rpx;
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #f5f5f5;
    flex-shrink: 0;
    background: #fff;
  }

  &__toolbar-count {
    font-size: 26rpx;
    color: #666;
  }

  &__clear {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: #999;
    font-size: 24rpx;
  }

  &__body {
    flex: 1;
    min-height: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;
  }

  &__item-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: #e8f5f2;
    color: #018d71;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    flex-shrink: 0;
    margin-right: 20rpx;
  }

  &__item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
  }

  &__item-name {
    font-size: 28rpx;
    color: #333;
  }

  &__item-dept {
    font-size: 22rpx;
    color: #999;
  }

  &__remove {
    font-size: 28rpx;
    color: #999;
    padding: 8rpx;
    flex-shrink: 0;
  }

  &__empty {
    display: flex;
    justify-content: center;
    padding: 80rpx 0;
    color: #bbb;
    font-size: 26rpx;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
