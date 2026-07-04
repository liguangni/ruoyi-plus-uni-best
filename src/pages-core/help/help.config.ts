export interface FaqItem {
  id: number
  question: string
  answer: string
}

export interface FaqGroup {
  title: string
  icon: string
  bgColor: string
  iconColor: string
  items: FaqItem[]
}

export const faqGroups: FaqGroup[] = [
  {
    title: '项目问题',
    icon: 'i-carbon-ibm-knowledge-catalog',
    bgColor: '#f0f4ff',
    iconColor: '#5b8cff',
    items: [
      { id: 1, question: '项目开源吗？', answer: '<p>开源。开源地址为: https://gitee.com/liguangni/ruoyi-plus-uni-best</p>' },
      { id: 2, question: '项目可以商用吗？', answer: '可以' },
      { id: 3, question: '项目官网地址多少？', answer: 'https://gitee.com/liguangni/ruoyi-plus-uni-best' },
      {
        id: 4,
        question: '项目文档地址多少？',
        answer: `<p>项目相关问题,请参考项目文档：
            <ol>
                <li><a href="https://unibest.tech/" target="_blank">unibes文档地址</a></li>
                <li><a href="https://plus-doc.dromara.org/" target="_blank">plus文档地址</a></li>
                </ol>
            </p>`,
      },
    ],
  },
  {
    title: '其他问题',
    icon: 'i-carbon-ibm-knowledge-catalog',
    bgColor: '#fff4e6',
    iconColor: '#f5a623',
    items: [
      { id: 5, question: '如何退出登录？', answer: '<p>请点击以下路径退出登录：</p><p><strong>我的</strong> → <strong>应用设置</strong> → <strong>退出登录</strong></p>' },
      { id: 6, question: '如何修改用户头像？', answer: '<p>请按以下步骤操作：</p><ol><li>进入<strong>我的</strong>页面</li><li>点击头像区域</li><li>选择新头像并点击<strong>提交</strong></li></ol>' },
      {
        id: 7,
        question: '如何修改登录密码？',
        answer: '<p>请按以下路径修改密码：</p><p><strong>我的</strong> → <strong>应用设置</strong> → <strong>修改密码</strong></p><p>修改后请重新登录。</p>',
      },
    ],
  },
]

/**
 * 根据ID获取问题详情
 */
export function getFaqById(id: number): FaqItem | undefined {
  for (const group of faqGroups) {
    const faq = group.items.find(item => item.id === id)
    if (faq) {
      return faq
    }
  }
  return undefined
}

/**
 * 搜索问题（前端本地检索）
 * @param keyword 搜索关键词
 * @returns 匹配的问题列表
 */
export function searchFaq(keyword: string): FaqItem[] {
  if (!keyword || !keyword.trim()) {
    return []
  }
  const lowerKeyword = keyword.toLowerCase().trim()
  const results: FaqItem[] = []
  for (const group of faqGroups) {
    for (const item of group.items) {
      if (item.question.toLowerCase().includes(lowerKeyword)
        || item.answer.toLowerCase().includes(lowerKeyword)) {
        results.push(item)
      }
    }
  }
  return results
}

/**
 * 获取所有问题列表（扁平化）
 */
export function getAllFaqs(): FaqItem[] {
  const allFaqs: FaqItem[] = []
  for (const group of faqGroups) {
    allFaqs.push(...group.items)
  }
  return allFaqs
}
