<script lang="ts" setup>
import { ref, watch } from 'vue'
import { listByIds, uploadOss } from '@/api/system/oss'
import type { OssUploadVO, OssVO } from '@/api/system/oss/types'

const props = withDefaults(
  defineProps<{
    /** v-model：逗号分隔的 ossId 字符串 */
    modelValue: string
    /** 允许的附件格式（小写扩展名，不含点） */
    fileType?: string[]
    /** 单个文件大小上限（MB） */
    fileSize?: number
  }>(),
  {
    fileType: () => ['png', 'jpg', 'jpeg', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx', 'txt', 'pdf', 'zip', 'rar'],
    fileSize: 20,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

interface AttachmentFile {
  uid?: string
  ossId: string
  fileName: string
  url: string
  uploading?: boolean
}

const fileList = ref<AttachmentFile[]>([])

/** 当 modelValue 被外部回填（如回显已上传附件）时，拉取文件信息 */
watch(
  () => props.modelValue,
  async (val) => {
    const ids = (val || '').split(',').filter(Boolean)
    if (ids.length === 0) {
      fileList.value = []
      return
    }
    const currentIds = fileList.value.map(f => String(f.ossId))
    if (ids.join(',') === currentIds.join(','))
      return
    try {
      const res = await listByIds(ids.join(','))
      const rows = (res || []) as OssVO[]
      fileList.value = rows.map(o => ({
        ossId: String(o.ossId),
        fileName: o.originalName || o.fileName,
        url: o.url,
      }))
    }
    catch {
      // 忽略加载失败
    }
  },
  { immediate: true },
)

function getExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

/** 从路径中取文件名（用于 uni.chooseImage 等未直接返回 name 的场景） */
function getBaseName(path: string): string {
  const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return i >= 0 ? path.slice(i + 1) : path
}

function validate(name: string, size: number): string | null {
  const ext = getExt(name)
  if (!props.fileType.includes(ext))
    return `不支持的文件格式：${ext || '未知'}`
  if (size > props.fileSize * 1024 * 1024)
    return `文件大小不能超过 ${props.fileSize}MB`
  return null
}

function updateModel() {
  emit('update:modelValue', fileList.value.map(f => f.ossId).join(','))
}

/** 上传图片 */
function chooseImage() {
  uni.chooseImage({
    count: 9,
    sizeType: ['original', 'compressed'],
    sourceType: ['album', 'camera'],
    success: (res: any) => {
      const paths: string[] = res.tempFilePaths || []
      const tempFiles: any[] = res.tempFiles || []
      const files = paths.map((p, i) => {
        const tf = tempFiles[i] || {}
        const rawName = tf.name || getBaseName(p)
        return { path: p, name: rawName, size: tf.size || 0 }
      })
      handleFiles(files)
    },
    fail: () => {
      // 用户取消选择，忽略
    },
  })
}

/** 上传文档/压缩包：H5/App 使用 uni.chooseFile，微信小程序使用 wx.chooseMessageFile（平台限制） */
function chooseDocument() {
  const count = 9
  // #ifdef MP-WEIXIN
  wx.chooseMessageFile({
    count,
    type: 'file',
    extension: props.fileType,
    success: (res: any) => {
      handleFiles((res.tempFiles || []).map((f: any) => ({ path: f.path, name: f.name, size: f.size })))
    },
    fail: () => {},
  })
  // #endif
  // #ifndef MP-WEIXIN
  const chooseFile = (uni as any).chooseFile
  if (typeof chooseFile !== 'function') {
    uni.showToast({ title: '当前平台不支持选择文件', icon: 'none' })
    return
  }
  chooseFile({
    count,
    type: 'all',
    extension: props.fileType,
    success: (res: any) => {
      handleFiles((res.tempFiles || []).map((f: any) => ({ path: f.path, name: f.name, size: f.size })))
    },
    fail: () => {},
  })
  // #endif
}

async function handleFiles(files: { path: string, name: string, size: number }[]) {
  if (!files.length)
    return
  uni.showLoading({ title: '上传中...', mask: true })
  // 循环内可能连续多个 toast；loading 只需关闭一次，否则多次 hideLoading 也会触发配对警告
  let loadingClosed = false
  const closeLoading = () => {
    if (!loadingClosed) {
      loadingClosed = true
      uni.hideLoading()
    }
  }
  try {
    for (const f of files) {
      const err = validate(f.name, f.size)
      if (err) {
        closeLoading()
        uni.showToast({ title: err, icon: 'none' })
        continue
      }
      // 用 uid 标记，便于从 reactive 数组中找回代理对象再做响应式更新
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      fileList.value.push({ uid, ossId: '', fileName: f.name, url: f.path, uploading: true })
      try {
        const res = (await uploadOss({ filePath: f.path, name: 'file' })) as OssUploadVO
        const target = fileList.value.find(x => x.uid === uid)
        if (target) {
          target.ossId = String(res.ossId)
          target.url = res.url
          // 后端上传响应里的 fileName 是存储 key（无后缀），用原始文件名 f.name 回显才带后缀
          target.fileName = f.name || res.fileName
          target.uploading = false
        }
      }
      catch {
        fileList.value = fileList.value.filter(x => x.uid !== uid)
        // uploadOss 失败由 request 拦截器统一弹错误 toast（已顶掉 loading）；
        // 仅标记 loading 已关闭，不在此 uni.hideLoading，否则触发"showLoading 与 hideLoading 必须配对"警告
        loadingClosed = true
        uni.showToast({ title: `上传失败：${f.name}`, icon: 'none' })
      }
    }
    updateModel()
  }
  finally {
    closeLoading()
  }
}

function removeFile(item: AttachmentFile) {
  fileList.value = fileList.value.filter(x => x !== item)
  updateModel()
}

function preview(item: AttachmentFile) {
  if (item.uploading)
    return
  const ext = getExt(item.fileName)
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
  if (imageExts.includes(ext)) {
    uni.previewImage({ urls: [item.url], current: item.url })
    return
  }
  // #ifdef H5
  window.open(item.url)
  // #endif
  // #ifndef H5
  uni.openDocument({
    filePath: item.url,
    fileType: ext,
    fail: () => uni.showToast({ title: '无法打开该文件', icon: 'none' }),
  })
  // #endif
}
</script>

<template>
  <view class="wf-attach">
    <view class="wf-attach__actions">
      <view class="wf-attach__btn" @click="chooseImage">
        <text class="i-carbon-image wf-attach__btn-icon" />
        <text>上传图片</text>
      </view>
      <view class="wf-attach__btn" @click="chooseDocument">
        <text class="i-carbon-document wf-attach__btn-icon" />
        <text>上传文档/压缩包</text>
      </view>
    </view>

    <view
      v-for="(item, idx) in fileList"
      :key="item.uid ?? idx"
      class="wf-attach__item"
      @click="preview(item)"
    >
      <text class="i-carbon-document wf-attach__icon" />
      <view class="wf-attach__info">
        <text class="wf-attach__name">{{ item.fileName }}</text>
        <text v-if="item.uploading" class="wf-attach__status">上传中...</text>
      </view>
      <view class="wf-attach__del" @click.stop="removeFile(item)">
        <text class="i-carbon-close" />
      </view>
    </view>

    <view class="wf-attach__tip">
      支持 {{ fileType.join('/') }}，单文件 ≤{{ fileSize }}MB
    </view>
  </view>
</template>

<style lang="scss" scoped>
.wf-attach {
  margin-bottom: 16rpx;
  .wf-attach__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  .wf-attach__btn {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 28rpx;
    border: 2rpx dashed #cfd8d6;
    border-radius: 12rpx;
    color: #018d71;
    font-size: 26rpx;
    background: rgba(1, 141, 113, 0.04);
  }
  .wf-attach__btn-icon {
    font-size: 30rpx;
  }
  .wf-attach__item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-radius: 12rpx;
    background: #f8f9fa;
    margin-top: 16rpx;
  }
  .wf-attach__icon {
    font-size: 36rpx;
    color: #018d71;
    flex-shrink: 0;
  }
  .wf-attach__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }
  .wf-attach__name {
    font-size: 26rpx;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .wf-attach__status {
    font-size: 22rpx;
    color: #999;
  }
  .wf-attach__del {
    font-size: 32rpx;
    color: #e05252;
    padding: 8rpx;
    flex-shrink: 0;
  }
  .wf-attach__tip {
    font-size: 22rpx;
    color: #e05252;
    margin-top: 16rpx;
  }
}
.wf-attach__btn:active {
  opacity: 0.7;
}
</style>
