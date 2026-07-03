import request from '@/http/luch-request'
import type { SysOssUploadVo } from '@/types/system/oss.types'

// 上传OSS对象存储
export function uploadOss({ filePath, name }: { filePath: string, name?: string }) {
  return request.upload<SysOssUploadVo>({
    url: '/resource/oss/upload',
    filePath,
    name,
    custom: {
      isEcrypt: true,
    },
  })
}
