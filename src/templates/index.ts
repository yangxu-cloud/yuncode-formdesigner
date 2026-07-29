import type { CodeTemplate } from '@/types'
import type { FormilySchema } from '@/types'

/**
 * 代码模板列表
 */
export const codeTemplates: CodeTemplate[] = [
  // 验证代码模板
  {
    name: '必填验证',
    description: '验证字段是否为空',
    language: 'javascript',
    template: `if (!value) return '请输入内容'
return true`,
  },
  {
    name: '长度验证',
    description: '验证字符串长度范围',
    language: 'javascript',
    template: `if (!value) return '请输入内容'
if (value.length < 2) return '长度不能少于2个字符'
if (value.length > 50) return '长度不能超过50个字符'
return true`,
  },
  {
    name: '数字范围验证',
    description: '验证数字在指定范围内',
    language: 'javascript',
    template: `const num = Number(value)
if (isNaN(num)) return '请输入有效的数字'
if (num < 0) return '数字不能小于0'
if (num > 100) return '数字不能大于100'
return true`,
  },
  {
    name: '邮箱验证',
    description: '验证邮箱格式',
    language: 'javascript',
    template: `const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
if (!emailRegex.test(value)) return '请输入有效的邮箱地址'
return true`,
  },
  {
    name: '手机号验证',
    description: '验证手机号格式',
    language: 'javascript',
    template: `const phoneRegex = /^1[3-9]\\d{9}$/
if (!phoneRegex.test(value)) return '请输入有效的手机号码'
return true`,
  },
  {
    name: '自定义验证',
    description: '自定义验证逻辑模板',
    language: 'javascript',
    template: `// value: 当前字段值
// formData: 整个表单数据
// 返回 true 表示验证通过，返回字符串表示错误信息

if (!value) {
  return '请输入内容'
}

// 可以访问其他字段值
// if (value !== formData.confirmPassword) {
//   return '两次输入的密码不一致'
// }

return true`,
  },

  // 事件处理代码模板
  {
    name: '值变化处理',
    description: '处理字段值变化',
    language: 'javascript',
    template: `// event: 事件对象
// formData: 整个表单数据

console.log('值变化:', event.target.value)

// 联动其他字段
// formData.otherField = event.target.value`,
  },
  {
    name: '条件显示',
    description: '根据条件控制其他字段显示',
    language: 'javascript',
    template: `// 根据当前值控制其他字段的显示/隐藏
const visible = event.target.value === 'option1'

// 设置其他字段的可见性
// document.querySelector('[data-field="otherField"]').style.display = visible ? 'block' : 'none'`,
  },
  {
    name: '数据格式化',
    description: '格式化输入数据',
    language: 'javascript',
    template: `// 自动格式化输入
let value = event.target.value

// 去除空格
value = value.trim()

// 转换为大写
// value = value.toUpperCase()

// 限制长度
if (value.length > 10) {
  value = value.slice(0, 10)
}

// 更新值
event.target.value = value`,
  },

  // 数据转换代码模板
  {
    name: '去除空格',
    description: '去除字符串首尾空格',
    language: 'javascript',
    template: `return value?.trim() || ''`,
  },
  {
    name: '转换为数字',
    description: '将值转换为数字类型',
    language: 'javascript',
    template: `const num = Number(value)
return isNaN(num) ? 0 : num`,
  },
  {
    name: '日期格式化',
    description: '格式化日期为 YYYY-MM-DD',
    language: 'javascript',
    template: `if (!value) return ''
const date = new Date(value)
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')
return \`\${year}-\${month}-\${day}\``,
  },
  {
    name: '数组转换',
    description: '将值转换为数组',
    language: 'javascript',
    template: `if (Array.isArray(value)) return value
if (!value) return []
return [value]`,
  },

  // API 配置模板
  {
    name: '获取下拉选项',
    description: '从 API 获取下拉选项数据',
    language: 'javascript',
    template: `// 假设 API 返回格式: { data: [{ id: 1, name: '选项1' }] }
return response.data.map(item => ({
  label: item.name,
  value: item.id
}))`,
  },
  {
    name: '提交数据转换',
    description: '提交前转换数据格式',
    language: 'javascript',
    template: `// 添加额外字段
return {
  ...formData,
  submitTime: new Date().toISOString(),
  status: 'pending'
}`,
  },
]

/**
 * 根据分类获取模板
 */
export function getTemplatesByCategory(category: string): CodeTemplate[] {
  // 简单的关键词匹配分类
  const categories: Record<string, string[]> = {
    '验证': ['验证', '必填', '长度', '数字', '邮箱', '手机'],
    '事件': ['事件', '变化', '条件', '格式化'],
    '转换': ['转换', '去除', '日期', '数组'],
    'API': ['API', '获取', '提交'],
  }

  const keywords = categories[category] || []
  return codeTemplates.filter(template =>
    keywords.some(keyword => template.name.includes(keyword) || template.description.includes(keyword))
  )
}

/**
 * 根据 Schema 生成验证代码
 */
export function generateValidationCode(schema: FormilySchema): string {
  const lines: string[] = []

  if (schema.required) {
    lines.push(`if (!value) return '${schema.title || '此字段'}为必填项'`)
  }

  // 可以根据 schema 的其他属性生成更多验证代码
  const rules = schema['x-validation-rules'] || []
  for (const rule of rules) {
    if (rule.type === 'required') {
      lines.push(`if (!value) return '${rule.message}'`)
    } else if (rule.type === 'pattern' && rule.pattern) {
      lines.push(`const regex = /${rule.pattern}/`)
      lines.push(`if (!regex.test(value)) return '${rule.message}'`)
    } else if (rule.type === 'custom' && rule.code) {
      lines.push(rule.code)
    }
  }

  if (lines.length === 0) {
    return 'return true'
  }

  lines.push('return true')
  return lines.join('\n')
}

/**
 * 根据 Schema 生成事件处理代码
 */
export function generateEventHandlerCode(schema: FormilySchema): string {
  const events = schema['x-events'] || {}
  const lines: string[] = []

  for (const [eventType, actions] of Object.entries(events)) {
    if (actions && actions.length > 0) {
      lines.push(`// ${eventType} 事件处理`)
      for (const action of actions) {
        if (action.type === 'setValue' && action.target) {
          lines.push(`formData['${action.target}'] = ${JSON.stringify(action.value)}`)
        } else if (action.type === 'message') {
          lines.push(`console.log('${action.message}')`)
        }
      }
    }
  }

  return lines.join('\n') || '// 在此编写事件处理代码'
}
