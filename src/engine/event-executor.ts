import type { ActionConfig } from '@/types'

/**
 * 事件执行器
 * 负责执行配置的动作链
 */
export class EventExecutor {
  private schemaStore: any
  private messageApi: any

  constructor(schemaStore: any, messageApi?: any) {
    this.schemaStore = schemaStore
    this.messageApi = messageApi
  }

  /**
   * 执行动作列表
   */
  async executeActions(actions: ActionConfig[]): Promise<void> {
    for (const action of actions) {
      await this.executeAction(action)
    }
  }

  /**
   * 执行单个动作
   */
  private async executeAction(action: ActionConfig): Promise<void> {
    // 延迟执行
    if (action.delay && action.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, action.delay))
    }

    switch (action.type) {
      case 'setValue':
        this.setValue(action)
        break
      case 'show':
        this.showComponent(action)
        break
      case 'hide':
        this.hideComponent(action)
        break
      case 'enable':
        this.enableComponent(action)
        break
      case 'disable':
        this.disableComponent(action)
        break
      case 'message':
        this.showMessage(action)
        break
      default:
        console.warn(`[EventExecutor] 未知的动作类型: ${action.type}`)
    }
  }

  /**
   * 设置值
   */
  private setValue(action: ActionConfig): void {
    if (!action.target) return
    const node = this.schemaStore.getNode(action.target)
    if (node) {
      node.default = action.value
      this.schemaStore.triggerUpdate()
    }
  }

  /**
   * 显示组件
   */
  private showComponent(action: ActionConfig): void {
    if (!action.target) return
    const node = this.schemaStore.getNode(action.target)
    if (node) {
      node['x-visible'] = true
      this.schemaStore.triggerUpdate()
    }
  }

  /**
   * 隐藏组件
   */
  private hideComponent(action: ActionConfig): void {
    if (!action.target) return
    const node = this.schemaStore.getNode(action.target)
    if (node) {
      node['x-visible'] = false
      this.schemaStore.triggerUpdate()
    }
  }

  /**
   * 启用组件
   */
  private enableComponent(action: ActionConfig): void {
    if (!action.target) return
    const node = this.schemaStore.getNode(action.target)
    if (node) {
      if (!node['x-component-props']) {
        node['x-component-props'] = {}
      }
      node['x-component-props'].disabled = false
      this.schemaStore.triggerUpdate()
    }
  }

  /**
   * 禁用组件
   */
  private disableComponent(action: ActionConfig): void {
    if (!action.target) return
    const node = this.schemaStore.getNode(action.target)
    if (node) {
      if (!node['x-component-props']) {
        node['x-component-props'] = {}
      }
      node['x-component-props'].disabled = true
      this.schemaStore.triggerUpdate()
    }
  }

  /**
   * 显示消息
   */
  private showMessage(action: ActionConfig): void {
    if (!action.message) return

    if (this.messageApi) {
      this.messageApi[action.messageType || 'info'](action.message)
    } else {
      console.log(`[EventExecutor] ${action.messageType || 'info'}: ${action.message}`)
    }
  }
}
