<template>
  <div v-if="selectedNode" class="event-config">
    <!-- 事件配置标题 -->
    <div class="event-config__header">
      <ThunderboltOutlined class="event-config__header-icon" />
      <span class="event-config__header-title">事件配置</span>
    </div>

    <!-- 设置事件按钮 -->
    <div class="event-config__action">
      <a-button
        type="primary"
        block
        size="small"
        @click="openDrawer"
      >
        设置事件
      </a-button>
      <div v-if="totalEventCount > 0" class="event-config__count">
        已配置 {{ totalEventCount }} 个事件
      </div>
    </div>

    <!-- 事件配置抽屉 -->
    <a-drawer
      v-model:open="drawerVisible"
      title="设置事件"
      :width="900"
      placement="right"
      @after-open-change="onDrawerChange"
    >
      <div class="event-drawer">
        <!-- 左侧事件列表 -->
        <div class="event-drawer__sidebar">
          <div class="event-drawer__sidebar-header">
            <a-dropdown>
              <a-button size="small" type="link" class="event-drawer__create-btn">
                创建事件 <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu @click="onAddEvent">
                  <a-menu-item v-for="event in availableEvents" :key="event.type">
                    <span>{{ event.label }}</span>
                    <span class="event-drawer__event-desc">{{ event.description }}</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>

          <!-- 事件列表 -->
          <div class="event-drawer__event-list">
            <div
              v-for="event in configuredEvents"
              :key="event.type"
              class="event-drawer__event-item"
              :class="{ 'event-drawer__event-item--active': selectedEvent === event.type }"
              @click="selectEvent(event.type)"
            >
              <div class="event-drawer__event-main">
                <span class="event-drawer__event-func">function</span>
                <span class="event-drawer__event-name">{{ getEventFunctionName(event.type) }}</span>
                <a-button
                  v-if="hasEventCode(event.type)"
                  size="small"
                  type="text"
                  danger
                  class="event-drawer__event-delete"
                  @click.stop="deleteEventCode(event.type)"
                >
                  <DeleteOutlined />
                </a-button>
              </div>
              <div class="event-drawer__event-desc">{{ event.description }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧代码编辑器 -->
        <div class="event-drawer__content">
          <template v-if="selectedEvent">
            <!-- Tab 切换 -->
            <a-tabs v-model:activeKey="codeTab" size="small" class="event-drawer__tabs">
              <a-tab-pane key="code" tab="自定义">
                <div class="event-drawer__code-section">
                  <EventEditor
                    :event-type="selectedEvent"
                    :code="currentEventCode"
                    :show-event-type-selector="false"
                    :height="400"
                    :placeholder="getCodePlaceholder()"
                    @update:code="onEventCodeChange"
                  />
                </div>
              </a-tab-pane>
            </a-tabs>
          </template>

          <div v-else class="event-drawer__no-event">
            <a-empty description="请从左侧选择一个事件" />
          </div>
        </div>
      </div>

      <!-- 动作配置抽屉 -->
      <ActionConfigDrawer
        v-model:open="actionDrawerVisible"
        :event-type="selectedEvent || 'onChange'"
        :action="currentAction"
        :action-index="currentActionIndex"
        :all-components="allComponents"
        @save="onActionSave"
      />
    </a-drawer>

    <!-- 代码提示弹窗 -->
    <a-modal
      v-model:open="showCodeTips"
      title="代码提示"
      :footer="null"
      width="480px"
    >
      <div class="event-drawer__tips-modal">
        <div class="event-drawer__tips-section">
          <div class="event-drawer__tips-title">推荐写法（FormCreate 风格）</div>
          <div class="event-drawer__tips-list">
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">const api = $inject.api</code>
              <span class="event-drawer__tips-desc">获取 api 对象</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.formData()</code>
              <span class="event-drawer__tips-desc">获取表单数据</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.setValue(field, value)</code>
              <span class="event-drawer__tips-desc">设置字段值</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.setVisible(field, visible)</code>
              <span class="event-drawer__tips-desc">设置可见性</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.setDisabled(field, disabled)</code>
              <span class="event-drawer__tips-desc">设置禁用状态</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.validate()</code>
              <span class="event-drawer__tips-desc">验证表单</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.submit()</code>
              <span class="event-drawer__tips-desc">提交表单</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.reset()</code>
              <span class="event-drawer__tips-desc">重置表单</span>
            </div>
            <div class="event-drawer__tips-item">
              <code class="event-drawer__tips-code">api.request({ url, method, data })</code>
              <span class="event-drawer__tips-desc">发起 HTTP 请求</span>
            </div>
          </div>
        </div>
        <div class="event-drawer__tips-section">
          <div class="event-drawer__tips-title">使用示例</div>
          <div class="event-drawer__tips-example">
            <pre class="event-drawer__tips-pre">// 获取 api 对象
const api = $inject.api

// 获取表单数据
const data = api.formData()

// 设置字段值
api.setValue('username', '张三')

// 联动控制
api.setVisible('detail', true)
api.setDisabled('code', false)

// 验证并提交
const valid = api.validate()
if (valid) {
  api.submit()
}

// 发起 HTTP 请求
api.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  onSuccess: (data) => {
    console.log('请求成功:', data)
    // 设置返回的数据到表单
    api.setValue('field', data.value)
  },
  onError: (error) => {
    console.error('请求失败:', error)
  }
})</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import { registry } from '@/engine/registry'
import { EVENT_TYPES, ACTION_TYPES } from '@/types'
import type { ActionConfig, EventType } from '@/types'
import ActionConfigDrawer from './ActionConfigDrawer.vue'
import EventEditor from '@/components/EventEditor/index.vue'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  ThunderboltOutlined,
  AimOutlined,
  EyeInvisibleOutlined,
  EnterOutlined,
  SyncOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons-vue'

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 抽屉状态
const drawerVisible = ref(false)
const actionDrawerVisible = ref(false)

// 选中的事件
const selectedEvent = ref<EventType | null>(null)
const codeTab = ref('code')

// 动作配置相关
const currentAction = ref<ActionConfig | null>(null)
const currentActionIndex = ref<number>(-1)

// 代码提示弹窗
const showCodeTips = ref(false)

const selectedNode = computed(() => {
  if (!designerStore.selectedPath) return null
  return schemaStore.getNode(designerStore.selectedPath)
})

// 已配置的事件数量
const totalEventCount = computed(() => {
  if (!selectedNode.value?.['x-events']) return 0
  let count = 0
  for (const actions of Object.values(selectedNode.value['x-events'])) {
    count += actions.length
  }
  // 加上代码配置的事件
  const eventCode = selectedNode.value?.['x-code-config']?.eventHandlerCode
  if (eventCode) {
    // 简单统计函数数量
    const funcCount = (eventCode.match(/function\s+\w+\(/g) || []).length
    count += funcCount
  }
  return count
})

// 可用的事件类型（排除全局事件）
const availableEvents = computed(() => {
  const componentName = selectedNode.value?.['x-component']
  // 全局事件（onMounted, onSubmit）在表单属性中配置，这里不显示
  const componentEventTypes = EVENT_TYPES.filter(event => event.type !== 'onMounted' && event.type !== 'onSubmit')

  if (!componentName) return componentEventTypes

  return componentEventTypes.filter(event => {
    if (event.components && !event.components.includes(componentName)) {
      return false
    }
    return true
  })
})

// 已配置的事件列表（包含有代码的事件）
const configuredEvents = computed(() => {
  return availableEvents.value.map(event => ({
    ...event,
    hasCode: hasEventCode(event.type),
  }))
})

// 当前选中事件的动作列表
const currentActions = computed(() => {
  if (!selectedEvent.value || !selectedNode.value?.['x-events']) return []
  return selectedNode.value['x-events'][selectedEvent.value] || []
})

// 当前事件的代码
const currentEventCode = ref('')

// 监听 selectedEvent 变化，更新代码
watch(selectedEvent, () => {
  updateCurrentEventCode()
}, { immediate: true })

// 监听节点代码配置变化
watch(() => selectedNode.value?.['x-code-config'], () => {
  updateCurrentEventCode()
}, { immediate: true })

function updateCurrentEventCode() {
  if (!selectedEvent.value) {
    currentEventCode.value = ''
    return
  }

  const config = selectedNode.value?.['x-code-config']
  if (!config?.eventHandlerCode) {
    currentEventCode.value = ''
    return
  }

  // 解析事件代码
  const functionName = getEventFunctionName()
  const regex = new RegExp(`function\\s+${functionName}\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\}`)
  const match = config.eventHandlerCode.match(regex)
  currentEventCode.value = match ? match[1].trim() : ''
}

// 获取所有组件
const allComponents = computed(() => {
  const properties = schemaStore.root.properties
  if (!properties) return []

  return Object.entries(properties).map(([key, node]) => ({
    path: key,
    name: node.name || key,
    label: node.title || registry.get(node['x-component'] || '')?.label || key,
  }))
})

// 打开抽屉
function openDrawer() {
  drawerVisible.value = true
  // 默认选中第一个事件
  if (availableEvents.value.length > 0 && !selectedEvent.value) {
    selectedEvent.value = availableEvents.value[0].type
  }
}

// 抽屉变化
function onDrawerChange(open: boolean) {
  if (!open) {
    selectedEvent.value = null
  }
}

// 选择事件
function selectEvent(type: EventType) {
  selectedEvent.value = type
  codeTab.value = 'code' // 切换到自定义Tab
}

// 检查事件是否有代码
function hasEventCode(type: EventType): boolean {
  const config = selectedNode.value?.['x-code-config']
  if (!config?.eventHandlerCode) return false

  const eventNames: Record<EventType, string> = {
    onChange: 'change',
    onFocus: 'focus',
    onBlur: 'blur',
    onPressEnter: 'pressEnter',
    onMounted: 'mounted',
    onSubmit: 'submit',
  }

  const functionName = eventNames[type]
  const regex = new RegExp(`function\\s+${functionName}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`)
  return regex.test(config.eventHandlerCode)
}

// 获取事件图标
function getEventIcon(type: EventType) {
  const icons: Record<EventType, any> = {
    onChange: EditOutlined,
    onFocus: AimOutlined,
    onBlur: EyeInvisibleOutlined,
    onPressEnter: EnterOutlined,
    onMounted: SyncOutlined,
    onSubmit: ExportOutlined,
  }
  return icons[type] || ThunderboltOutlined
}

// 获取动作图标
function getActionIcon(type: string) {
  const icons: Record<string, any> = {
    setValue: EditOutlined,
    show: EyeOutlined,
    hide: EyeInvisibleOutlined,
    enable: CheckCircleOutlined,
    disable: CloseCircleOutlined,
    message: MessageOutlined,
  }
  return icons[type] || ThunderboltOutlined
}

// 获取动作标签
function getActionLabel(type: string): string {
  return ACTION_TYPES.find(a => a.type === type)?.label || type
}

// 获取目标组件标签
function getTargetLabel(path: string): string {
  const component = allComponents.value.find(c => c.path === path)
  return component?.label || path
}

// 添加事件
function onAddEvent(menuInfo: { key: string }) {
  const eventType = menuInfo.key as EventType
  selectedEvent.value = eventType
  codeTab.value = 'code' // 切换到代码tab
}

// 获取事件函数名
function getEventFunctionName(type?: EventType): string {
  const eventType = type || selectedEvent.value
  if (!eventType) return 'handler'

  const eventNames: Record<EventType, string> = {
    onChange: 'change',
    onFocus: 'focus',
    onBlur: 'blur',
    onPressEnter: 'pressEnter',
    onMounted: 'mounted',
    onSubmit: 'submit',
  }
  return eventNames[eventType] || 'handler'
}

// 获取代码占位符
function getCodePlaceholder(): string {
  if (!selectedEvent.value) return '// 在此编写代码'

  const placeholders: Record<EventType, string> = {
    onChange: `// 值变化时执行的代码
const api = $inject.api
const value = event.target.value
api.setValue('field', value)`,
    onFocus: `// 获得焦点时执行的代码`,
    onBlur: `// 失去焦点时执行的代码`,
    onPressEnter: `// 按下回车时执行的代码`,
    onMounted: `// 组件加载完成后执行的代码
const api = $inject.api
// 初始化数据等`,
    onSubmit: `// 表单提交前执行的代码
const api = $inject.api
const formData = api.formData()
console.log('提交数据:', formData)`,
  }
  return placeholders[selectedEvent.value] || '// 在此编写代码'
}

// 事件代码变更
function onEventCodeChange(code: string) {
  if (!selectedEvent.value || !selectedNode.value) return

  const config = selectedNode.value['x-code-config'] || {}
  let eventHandlerCode = config.eventHandlerCode || ''

  const functionName = getEventFunctionName()
  const eventLabel = availableEvents.value.find(e => e.type === selectedEvent.value)?.label || selectedEvent.value

  // 移除旧的事件代码
  const regex = new RegExp(`//\\s*${selectedEvent.value}[\\s\\S]*?function\\s+${functionName}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`)
  eventHandlerCode = eventHandlerCode.replace(regex, '')

  // 添加新的事件代码
  if (code.trim()) {
    const newCode = `// ${selectedEvent.value} - ${eventLabel}
function ${functionName}($inject) {
${code}
}
`
    eventHandlerCode = eventHandlerCode + '\n' + newCode
  }

  // 更新配置
  selectedNode.value['x-code-config'] = {
    ...config,
    eventHandlerCode: eventHandlerCode.trim(),
  }
  schemaStore.triggerUpdate()
}

// 全局事件代码变更

// 删除事件代码
function deleteEventCode(type: EventType) {
  if (!selectedNode.value) return

  const config = selectedNode.value['x-code-config'] || {}
  let eventHandlerCode = config.eventHandlerCode || ''

  const functionName = getEventFunctionName(type)

  // 移除事件代码
  const regex = new RegExp(`//\\s*${type}[\\s\\S]*?function\\s+${functionName}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`)
  eventHandlerCode = eventHandlerCode.replace(regex, '')

  // 更新配置
  selectedNode.value['x-code-config'] = {
    ...config,
    eventHandlerCode: eventHandlerCode.trim(),
  }
  schemaStore.triggerUpdate()
}

// 添加动作
function addAction() {
  currentAction.value = null
  currentActionIndex.value = -1
  actionDrawerVisible.value = true
}

// 编辑动作
function editAction(index: number) {
  currentAction.value = { ...currentActions.value[index] }
  currentActionIndex.value = index
  actionDrawerVisible.value = true
}

// 删除动作
function removeAction(index: number) {
  if (!selectedNode.value || !selectedEvent.value) return

  const events = selectedNode.value['x-events'] || {}
  const actions = events[selectedEvent.value] || []
  actions.splice(index, 1)

  selectedNode.value['x-events'] = { ...events, [selectedEvent.value]: [...actions] }
  schemaStore.triggerUpdate()
}

// 保存动作
function onActionSave(action: ActionConfig) {
  if (!selectedNode.value || !selectedEvent.value) return

  const events = selectedNode.value['x-events'] || {}
  const actions = events[selectedEvent.value] || []

  if (currentActionIndex.value >= 0) {
    actions[currentActionIndex.value] = action
  } else {
    actions.push(action)
  }

  selectedNode.value['x-events'] = { ...events, [selectedEvent.value]: [...actions] }
  schemaStore.triggerUpdate()
}
</script>

<style scoped lang="less">
.event-config {
  margin-top: 24px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__header-icon {
    font-size: 14px;
  }

  &__header-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__action {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__count {
    font-size: 11px;
    color: var(--text-tertiary);
    text-align: center;
  }
}

// 抽屉样式
.event-drawer {
  display: flex;
  height: 100%;
  margin: -24px;
  background: #fff;

  // 左侧边栏
  &__sidebar {
    width: 280px;
    border-right: 1px solid #e8e8e8;
    display: flex;
    flex-direction: column;
    background: #fafafa;
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e8e8e8;
  }

  &__create-btn {
    font-size: 14px;
    color: #1890ff;
    font-weight: 500;

    &:hover {
      color: #40a9ff;
    }
  }

  &__event-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  &__event-item {
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;
    border: 1px solid transparent;

    &:hover {
      background: #fff;
      border-color: #d9d9d9;
    }

    &--active {
      background: #e6f4ff;
      border-color: #1890ff;

      .event-drawer__event-name {
        color: #1890ff;
      }
    }
  }

  &__event-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__event-func {
    font-size: 13px;
    color: #c586c0;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
  }

  &__event-name {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a2e;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
  }

  &__event-delete {
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &__event-item:hover &__event-delete {
    opacity: 1;
  }

  &__event-desc {
    font-size: 12px;
    color: #8c8c8c;
    padding-left: 12px;
    line-height: 1.4;
    margin-top: 4px;
  }

  // 右侧内容
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    min-height: 0;
  }

  &__tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.ant-tabs-nav) {
      padding: 0 20px;
      margin-bottom: 0;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.ant-tabs-tab) {
      padding: 12px 0;
      margin-right: 24px;
      font-size: 14px;
      font-weight: 500;

      &.ant-tabs-tab-active {
        color: #1890ff;
      }
    }

    :deep(.ant-tabs-content-holder) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.ant-tabs-content) {
      height: 100%;
    }

    :deep(.ant-tabs-tabpane) {
      height: 100%;
    }
  }

  &__no-event {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 事件流 Tab
  &__flow-section {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__actions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
    font-weight: 500;
    color: #1a1a2e;
  }

  &__empty-actions {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__action-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }

  &__action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.2s;

    &:hover {
      background: #fff;
      border-color: #e8e8e8;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }

  &__action-icon {
    font-size: 18px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }

  &__action-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__action-type {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a2e;
  }

  &__action-target {
    font-size: 12px;
    color: #8c8c8c;
  }

  &__action-btns {
    display: flex;
    gap: 4px;
  }

  // 代码 Tab
  &__code-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    overflow: hidden;
    min-height: 0;
    height: 100%;
  }

  // 代码提示弹窗样式
  &__tips-modal {
    padding: 0;
  }

  &__tips-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__tips-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 12px;
  }

  &__tips-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__tips-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    background: #f6f8fa;
    border-radius: 6px;
  }

  &__tips-code {
    background: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 12px;
    color: #1677ff;
    border: 1px solid #e8e8e8;
    white-space: nowrap;
  }

  &__tips-desc {
    font-size: 13px;
    color: #595959;
    line-height: 1.4;
  }

  &__tips-example {
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
  }

  &__tips-pre {
    margin: 0;
    padding: 16px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #d4d4d4;
    overflow-x: auto;
  }
}
</style>
