/**
 * 显示消息提示框
 * @param content 提示的标题
 */
export function showToastMsg(content: string) {
  uni.showToast({
    icon: 'none',
    title: content,
  })
}

/**
 * 显示成功消息提示框
 * @param content 提示的标题
 */
export function showSuccesssMsg(content: string) {
  uni.showToast({
    title: content,
  })
}

/**
 * 打开遮罩层，需要手动关闭遮罩层
 * @param content 遮罩层内容
 */
export function showLoading(content: string): void {
  uni.showLoading({
    title: content,
  })
}

/**
 * 关闭遮罩层
 */
export function closeLoading(): void {
  uni.hideLoading()
}

/**
 * 显示模态弹窗
 * @param content 提示的标题
 */
export function showConfirm(content: string): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '提示',
      content,
      cancelText: '取消',
      confirmText: '确定',
      success(res) {
        resolve(res)
      },
    })
  })
}

/**
 * 显示确认弹窗
 * @param content 提示的标题
 */
export function showAlert(content: string): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '提示',
      content,
      showCancel: false,
      confirmText: '确定',
      success(res) {
        resolve(res)
      },
    })
  })
}

/**
 * 参数处理
 * @param params 参数
 */
export function tansParams(params: any) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = `${encodeURIComponent(propName)}=`
    if (value !== null && value !== '' && typeof (value) !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof (value[key]) !== 'undefined') {
            const params = `${propName}[${key}]`
            const subPart = `${encodeURIComponent(params)}=`
            result += `${subPart + encodeURIComponent(value[key])}&`
          }
        }
      }
      else {
        result += `${part + encodeURIComponent(value)}&`
      }
    }
  }
  return result
}

/**
 * 获取错误信息
 * @param error 错误对象
 */
export function getErrorMsg(code: any) {
  switch (code) {
    case 401:
      return '认证失败，无法访问系统资源'
    case 403:
      return '当前操作没有权限'
    case 404:
      return '访问资源不存在'
    default:
      return '系统未知错误，请反馈给管理员'
  }
}
