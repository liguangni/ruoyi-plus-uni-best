import request from '@/http/request'
import type { SysOssUploadVo } from '@/api/system/types/oss'

// 上传OSS对象存储
export function uploadOss({ filePath, name }: { filePath: string, name?: string }) {
  return request.upload<SysOssUploadVo>({
    url: '/resource/oss/upload',
    filePath,
    name,
    custom: {
      isEncrypt: true,
    },
  })
}
