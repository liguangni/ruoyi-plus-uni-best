import request from '@/http/request'
import type { OssUploadVO, OssVO } from './types'

/** 上传OSS对象存储 */
export function uploadOss({ filePath, name, ossExt }: { filePath: string, name?: string, ossExt?: Record<string, any> }) {
  return request.upload<OssUploadVO>({
    url: '/resource/oss/upload',
    filePath,
    name: name ?? 'file',
    data: { ossExt },
  })
}

/** 查询OSS对象基于id串 */
export function listByIds(ossId: string | number) {
  return request.get<OssVO[]>({
    url: `/resource/oss/listByIds/${ossId}`,
  })
}
