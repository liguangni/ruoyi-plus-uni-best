import { request } from '@/http/request'

// 上传OSS对象存储
export function uploadOss({ filePath, name }: { filePath: string, name?: string }) {
  return request.upload({
    url: '/resource/oss/upload',
    filePath,
    name,
  })
}
