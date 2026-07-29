import type { CodeConfig, APIConfig, ValidationRuleConfig } from '@/types'

/**
 * 代码执行引擎
 * 用于运行用户编写的自定义代码
 */
export class CodeExecutor {
  /**
   * 执行验证代码
   * @param code 验证代码
   * @param value 当前值
   * @param formData 表单数据
   * @returns true 表示验证通过，字符串表示错误消息
   */
  static executeValidation(code: string, value: any, formData: Record<string, any>): boolean | string {
    if (!code || code.trim() === '') return true

    try {
      const fn = new Function('value', 'formData', code)
      const result = fn(value, formData)
      return result
    } catch (error) {
      console.error('[CodeExecutor] 验证代码执行错误:', error)
      return `验证代码执行错误: ${(error as Error).message}`
    }
  }

  /**
   * 执行事件处理代码
   * @param code 事件处理代码
   * @param event 事件对象
   * @param formData 表单数据
   */
  static executeEventHandler(code: string, event: any, formData: Record<string, any>): void {
    if (!code || code.trim() === '') return

    try {
      const fn = new Function('event', 'formData', code)
      fn(event, formData)
    } catch (error) {
      console.error('[CodeExecutor] 事件处理代码执行错误:', error)
    }
  }

  /**
   * 执行数据转换代码
   * @param code 数据转换代码
   * @param value 当前值
   * @returns 转换后的值
   */
  static executeTransformer(code: string, value: any): any {
    if (!code || code.trim() === '') return value

    try {
      const fn = new Function('value', `return ${code}`)
      return fn(value)
    } catch (error) {
      console.error('[CodeExecutor] 数据转换代码执行错误:', error)
      return value
    }
  }

  /**
   * 执行 API 请求
   * @param config API 配置
   * @param data 请求数据
   * @returns 请求结果
   */
  static async executeAPI(config: APIConfig['fetchData'] | APIConfig['submitData'], data?: any): Promise<any> {
    if (!config || !config.url) return null

    try {
      const options: RequestInit = {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
      }

      if (config.method !== 'GET' && data) {
        // 如果有数据转换函数，先执行
        if (config.transform) {
          const transformedData = CodeExecutor.executeTransformer(config.transform, data)
          options.body = JSON.stringify(transformedData)
        } else {
          options.body = JSON.stringify(data)
        }
      }

      const response = await fetch(config.url, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 如果有数据转换函数，对返回结果进行转换
      if (config.transform && config.method === 'GET') {
        return CodeExecutor.executeTransformer(config.transform, result)
      }

      return result
    } catch (error) {
      console.error('[CodeExecutor] API 请求错误:', error)
      throw error
    }
  }

  /**
   * 执行自定义组件代码
   * @param code 组件代码
   * @param props 组件属性
   * @returns 组件选项对象
   */
  static executeCustomComponent(code: string, props: Record<string, any>): any {
    if (!code || code.trim() === '') return null

    try {
      const fn = new Function('props', `return ${code}`)
      return fn(props)
    } catch (error) {
      console.error('[CodeExecutor] 自定义组件代码执行错误:', error)
      return null
    }
  }

  /**
   * 验证代码语法
   * @param code 代码
   * @returns 验证结果
   */
  static validateCode(code: string): { valid: boolean; error?: string } {
    if (!code || code.trim() === '') return { valid: true }

    try {
      new Function(code)
      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * 批量验证表单
   * @param codeConfig 代码配置
   * @param formData 表单数据
   * @returns 验证结果
   */
  static validateForm(
    validationCode: string,
    rules: ValidationRuleConfig[],
    formData: Record<string, any>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    // 执行自定义验证代码
    if (validationCode) {
      const result = CodeExecutor.executeValidation(validationCode, formData, formData)
      if (typeof result === 'string') {
        errors['_form'] = result
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  }
}
