import type { Component } from 'vue'

/** 物料分组 */
export type MaterialGroup = '常规' | '布局'

/** Formily Schema 节点 */
export interface FormilySchema {
  name?: string
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  default?: any
  required?: boolean

  // Formily 扩展
  'x-decorator'?: string
  'x-decorator-props'?: Record<string, any>
  'x-component'?: string
  'x-component-props'?: Record<string, any>
  'x-pattern'?: 'editable' | 'disabled' | 'readOnly' | 'readPretty'
  'x-visible'?: boolean
  'x-hidden'?: boolean
  'x-reactions'?: any

  // 行列布局
  'x-row'?: number  // 行号，从 1 开始
  'x-col'?: number  // 列号，从 1 开始
  'x-span'?: number  // 宽度，1-4
  'x-label-placement'?: 'top' | 'left'  // 标题位置

  // 移动端配置
  'x-mobile'?: {
    visible?: boolean    // 移动端是否显示（默认 true）
    order?: number       // 移动端排序（越小越靠前）
  }

  // 事件配置
  'x-events'?: Record<string, ActionConfig[]>

  // 代码配置
  'x-code-config'?: CodeConfig

  // 高级配置
  'x-advanced-config'?: AdvancedConfig

  // 自定义验证规则
  'x-validation-rules'?: ValidationRuleConfig[]

  // IPASS 扩展
  'x-ipass'?: {
    boName?: string
    fieldName?: string
    fieldType?: string
    [key: string]: any
  }

  // 容器子节点
  properties?: Record<string, FormilySchema>
  items?: FormilySchema
}

/** 属性面板配置项 */
export interface PropsConfigItem {
  /** 属性路径，支持点分嵌套如 x-component-props.placeholder */
  name: string
  /** 面板标签 */
  label: string
  /** 编辑控件类型（复用物料名） */
  type: string
  /** 控件额外参数 */
  props?: Record<string, any>
  /** 可选值（Select / Radio 等） */
  options?: { label: string; value: any }[]
}

/** 属性面板配置组 */
export interface PropsConfigGroup {
  /** 分组名称 */
  group: string
  /** 属性项列表 */
  items: PropsConfigItem[]
  /** 由哪个扩展注入 */
  injectBy?: string
}

/** 物料描述符 */
export interface MaterialDescriptor {
  /** 组件标识，对应 x-component */
  name: string
  /** 组件中文名 */
  label: string
  /** 组件分类 */
  group: MaterialGroup
  /** 组件区图标 */
  icon?: string | Component
  /** 排序权重 */
  order?: number

  /** 是否为容器组件 */
  isContainer?: boolean
  /** 容器默认子节点 key */
  containerSlot?: string

  /** 拖入时生成的默认 Schema（不含 name，运行时自动生成） */
  schema: Omit<FormilySchema, 'name'>

  /** 属性面板配置 */
  propsConfig: PropsConfigGroup[]

  /** 设计态自定义渲染器 */
  designRenderer?: Component
}

/** 拖拽位置 */
export type DropPosition = 'before' | 'after' | 'inside'

/** 节点路径段 */
export type SchemaPath = string

// ====== 事件系统类型 ======

/** 动作类型 */
export type ActionType = 'setValue' | 'show' | 'hide' | 'enable' | 'disable' | 'message'

/** 动作配置 */
export interface ActionConfig {
  /** 动作类型 */
  type: ActionType
  /** 目标组件路径 */
  target?: string
  /** 设置值时的值 */
  value?: any
  /** 显示消息时的内容 */
  message?: string
  /** 消息类型 */
  messageType?: 'success' | 'info' | 'warning' | 'error'
  /** 延迟执行（毫秒） */
  delay?: number
}

/** 事件处理器 */
export interface EventHandler {
  /** 是否启用 */
  enabled: boolean
  /** 动作列表，按顺序执行 */
  actions: ActionConfig[]
}

/** 支持的事件类型 */
export type EventType = 'onChange' | 'onFocus' | 'onBlur' | 'onPressEnter' | 'onMounted' | 'onSubmit'

/** 事件类型配置 */
export interface EventTypeConfig {
  /** 事件类型 */
  type: EventType
  /** 显示名称 */
  label: string
  /** 描述 */
  description?: string
  /** 适用的组件类型 */
  components?: string[]
}

/** 支持的事件类型列表 */
export const EVENT_TYPES: EventTypeConfig[] = [
  { type: 'onChange', label: '值变化', description: '当值改变时触发' },
  { type: 'onFocus', label: '获得焦点', description: '当获得焦点时触发' },
  { type: 'onBlur', label: '失去焦点', description: '当失去焦点时触发' },
  { type: 'onPressEnter', label: '按下回车', description: '当按下回车键时触发', components: ['Input', 'TextArea'] },
  { type: 'onMounted', label: '组件加载', description: '组件挂载后触发' },
  { type: 'onSubmit', label: '表单提交', description: '表单提交时触发' },
]

/** 支持的动作类型列表 */
export interface ActionTypeConfig {
  type: ActionType
  label: string
  icon: string
  hasTarget?: boolean
  hasValue?: boolean
  hasMessage?: boolean
}

export const ACTION_TYPES: ActionTypeConfig[] = [
  { type: 'setValue', label: '设置值', icon: '✏️', hasTarget: true, hasValue: true },
  { type: 'show', label: '显示', icon: '👁️', hasTarget: true },
  { type: 'hide', label: '隐藏', icon: '🙈', hasTarget: true },
  { type: 'enable', label: '启用', icon: '✅', hasTarget: true },
  { type: 'disable', label: '禁用', icon: '🚫', hasTarget: true },
  { type: 'message', label: '显示消息', icon: '💬', hasMessage: true },
]

// ====== 代码配置类型 ======

/** 代码配置 */
export interface CodeConfig {
  /** 验证规则代码 - 函数签名: (value, formData) => boolean | string */
  validationCode?: string
  /** 事件处理代码 */
  eventHandlerCode?: string
  /** 数据转换代码 - 函数签名: (value) => any */
  dataTransformerCode?: string
  /** 自定义组件代码 */
  customComponentCode?: string
  /** API 配置 */
  apiConfig?: APIConfig
}

/** API 配置 */
export interface APIConfig {
  /** 数据获取配置 */
  fetchData?: APIEndpoint
  /** 数据提交配置 */
  submitData?: APIEndpoint
}

/** API 端点配置 */
export interface APIEndpoint {
  /** 请求 URL */
  url: string
  /** 请求方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** 请求参数 */
  params?: Record<string, any>
  /** 数据转换函数代码 */
  transform?: string
  /** 请求头 */
  headers?: Record<string, string>
}

/** 验证规则配置 */
export interface ValidationRuleConfig {
  /** 规则类型 */
  type: 'required' | 'pattern' | 'custom'
  /** 错误消息 */
  message: string
  /** 自定义验证代码 */
  code?: string
  /** 正则表达式 (pattern 类型使用) */
  pattern?: string
}

/** 事件处理代码配置 */
export interface EventHandlerCode {
  /** 事件类型 */
  eventType: EventType
  /** 处理函数代码 */
  code: string
}

/** 代码模板 */
export interface CodeTemplate {
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 语言 */
  language: 'javascript' | 'typescript' | 'json'
  /** 模板代码 */
  template: string
}

/** 代码语言类型 */
export type CodeLanguage = 'javascript' | 'typescript' | 'json'

/** 高级配置 */
export interface AdvancedConfig {
  /** 隐藏条件公式 */
  hideCondition?: string
  /** 隐藏条件配置 */
  hideConditionConfig?: ConditionConfigValue
  /** 动态必填条件公式 */
  requiredCondition?: string
  /** 动态必填条件配置 */
  requiredConditionConfig?: ConditionConfigValue
  /** 禁用条件公式 */
  disabledCondition?: string
  /** 禁用条件配置 */
  disabledConditionConfig?: ConditionConfigValue
  /** 只读条件公式 */
  readonlyCondition?: string
  /** 只读条件配置 */
  readonlyConditionConfig?: ConditionConfigValue
  /** 显示条件公式 */
  visibleCondition?: string
  /** 显示条件配置 */
  visibleConditionConfig?: ConditionConfigValue
  /** 值变化联动 */
  valueChangeLinkage?: string
  /** 数据联动配置 */
  dataLinkageConfig?: DataLinkageConfigValue
}

/** 数据联动规则 */
export interface DataLinkageRule {
  /** 目标字段 */
  targetField: string
  /** 规则类型 */
  rule: 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'includes' | 'custom'
  /** 比较值 */
  value: string
  /** 执行动作 */
  action: 'setValue' | 'setVisible' | 'setDisabled' | 'setRequired'
  /** 动作值 */
  actionValue: string
}

/** 条件配置值 */
export interface ConditionConfigValue {
  /** 类型：逻辑条件或公式 */
  type: 'logic' | 'formula'
  /** 条件组 */
  groups: ConditionGroup[]
  /** 公式代码 */
  formula: string
  /** 可见性状态 */
  visibilityState?: 'visible' | 'hidden'
  /** 可用性状态 */
  availabilityState?: 'enabled' | 'disabled' | 'readonly'
  /** 必填性状态 */
  requiredState?: 'required' | 'optional'
}

/** 条件组 */
export interface ConditionGroup {
  /** 条件列表 */
  conditions: ConditionItem[]
  /** 组间逻辑关系 */
  relation: 'AND' | 'OR'
}

/** 条件项 */
export interface ConditionItem {
  /** 字段名 */
  field: string
  /** 操作符 */
  operator: string
  /** 比较值 */
  value: string
  /** 条件间逻辑关系 */
  relation?: 'AND' | 'OR'
}

/** 数据联动配置值 */
export interface DataLinkageConfigValue {
  /** 类型：联动配置或公式 */
  type: 'linkage' | 'formula'
  /** 条件组 */
  conditionGroups: LinkageConditionGroup[]
  /** 联动动作 */
  actions: LinkageAction[]
  /** 公式代码 */
  formula: string
}

/** 联动条件组 */
export interface LinkageConditionGroup {
  /** 条件列表 */
  conditions: LinkageCondition[]
  /** 组间逻辑关系 */
  relation: 'AND' | 'OR'
}

/** 联动条件 */
export interface LinkageCondition {
  /** 字段名 */
  field: string
  /** 操作符 */
  operator: string
  /** 比较值 */
  value: string
  /** 条件间逻辑关系 */
  relation?: 'AND' | 'OR'
}

/** 联动动作 */
export interface LinkageAction {
  /** 动作类型 */
  type: 'setValue' | 'setVisible' | 'setDisabled' | 'setRequired'
  /** 目标字段 */
  targetField?: string
  /** 动作值 */
  actionValue?: string
}
