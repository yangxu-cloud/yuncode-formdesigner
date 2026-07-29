<template>
  <div class="props-panel">
    <a-tabs v-model:activeKey="activeTab" size="small" class="props-panel__tabs">
      <a-tab-pane key="component" tab="组件配置">
        <div class="props-panel__content">
          <template v-if="selectedNode">
            <div class="props-panel__component-header">
              <AppstoreOutlined class="props-panel__component-icon" />
              <span class="props-panel__component-name">{{ selectedLabel }}</span>
            </div>

            <!-- 字段标识 -->
            <div class="props-panel__section">
              <div class="props-panel__section-title">
                <TagOutlined class="props-panel__section-icon" />
                字段标识
              </div>
              <div class="props-panel__section-items">
                <PropItem :item="fieldNameItem" :value="selectedNode.name" disabled />
              </div>
            </div>

            <!-- 从物料配置读取所有属性 -->
            <template v-for="group in allComponentGroups" :key="group.group">
              <div class="props-panel__section">
                <div class="props-panel__section-title">
                  <component :is="getGroupIcon(group.group)" class="props-panel__section-icon" />
                  {{ group.group }}
                </div>
                <div class="props-panel__section-items">
                  <template v-for="item in group.items" :key="item.name">
                    <TabsConfig v-if="item.type === 'TabsConfig'" />
                    <PropItem
                      v-else
                      :item="item"
                      :value="getPropValue(item.name)"
                      @change="(v: any) => onPropChange(item.name, v)"
                    />
                  </template>
                </div>
              </div>
            </template>

            <!-- 事件配置 -->
            <EventConfig />

            <!-- 高级配置 -->
            <AdvancedConfig />
          </template>
          <div v-else class="props-panel__empty">
            <div class="props-panel__empty-icon">🖱️</div>
            <div class="props-panel__empty-text">请选中一个组件</div>
            <div class="props-panel__empty-hint">点击设计区中的组件进行配置</div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="mobile" tab="移动端">
        <div class="props-panel__content">
          <template v-if="selectedNode">
            <div class="props-panel__section">
              <div class="props-panel__section-title">
                <MobileOutlined class="props-panel__section-icon" />
                移动端设置
              </div>
              <div class="props-panel__section-items">
                <PropItem
                  :item="mobileVisibleItem"
                  :value="getMobileProp('visible')"
                  @change="(v: any) => onMobilePropChange('visible', v)"
                />
                <PropItem
                  :item="mobileOrderItem"
                  :value="getMobileProp('order')"
                  @change="(v: any) => onMobilePropChange('order', v)"
                />
              </div>
            </div>

            <div class="props-panel__tip">
              <a-alert
                message="移动端设置仅影响移动端布局，不影响PC端"
                type="info"
                show-icon
              />
            </div>
          </template>
          <div v-else class="props-panel__empty">
            <div class="props-panel__empty-icon">
              <SelectOutlined />
            </div>
            <div class="props-panel__empty-text">请选中一个组件</div>
          </div>
        </div>
      </a-tab-pane>

      <a-tab-pane key="form" tab="表单属性">
        <div class="props-panel__content">
          <template v-if="selectedNode">
            <div class="props-panel__section">
              <div class="props-panel__section-title">
                <BgColorsOutlined class="props-panel__section-icon" />
                显示设置
              </div>
              <div class="props-panel__section-items">
                <PropItem
                  :item="labelPlacementItem"
                  :value="getPropValue(labelPlacementItem.name)"
                  @change="(v: any) => onFormPropChange(labelPlacementItem.name, v)"
                />
              </div>
            </div>

            <div class="props-panel__section">
              <div class="props-panel__section-title">
                <span class="props-panel__section-icon">⚙️</span>
                高级设置
              </div>
              <div class="props-panel__section-items">
                <PropItem
                  v-for="item in advancedItems"
                  :key="item.name"
                  :item="item"
                  :value="getPropValue(item.name)"
                  @change="(v: any) => onPropChange(item.name, v)"
                />
              </div>
            </div>

            <!-- 全局事件配置 -->
            <div class="props-panel__section">
              <div class="props-panel__section-title">
                <ThunderboltOutlined class="props-panel__section-icon" />
                全局事件
              </div>
              <div class="props-panel__section-items">
                <a-button
                  type="primary"
                  block
                  size="small"
                  @click="openGlobalEventDrawer"
                >
                  设置全局事件
                </a-button>
                <div v-if="globalEventCount > 0" class="props-panel__event-count">
                  已配置 {{ globalEventCount }} 个事件
                </div>
              </div>
            </div>
          </template>
          <div v-else class="props-panel__empty">
            <div class="props-panel__empty-icon">
              <SelectOutlined />
            </div>
            <div class="props-panel__empty-text">请选中一个组件</div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!-- 全局事件配置抽屉 -->
    <a-drawer
      v-model:open="globalEventDrawerVisible"
      title="设置全局事件"
      :width="900"
      placement="right"
    >
      <div class="global-event-drawer">
        <!-- 左侧事件列表 -->
        <div class="global-event-drawer__sidebar">
          <div class="global-event-drawer__sidebar-header">
            <span class="global-event-drawer__sidebar-title">全局事件</span>
          </div>
          <div class="global-event-drawer__event-list">
            <div
              v-for="event in globalEventTypes"
              :key="event.type"
              class="global-event-drawer__event-item"
              :class="{ 'global-event-drawer__event-item--active': selectedGlobalEvent === event.type }"
              @click="selectGlobalEvent(event.type)"
            >
              <div class="global-event-drawer__event-main">
                <span class="global-event-drawer__event-func">function</span>
                <span class="global-event-drawer__event-name">{{ event.functionName }}</span>
              </div>
              <div class="global-event-drawer__event-desc">{{ event.description }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧代码编辑器 -->
        <div class="global-event-drawer__content">
          <template v-if="selectedGlobalEvent">
            <EventEditor
              :event-type="selectedGlobalEvent"
              :code="currentGlobalEventCode"
              :show-event-type-selector="false"
              :height="500"
              :placeholder="getGlobalEventPlaceholder()"
              @update:code="onGlobalEventCodeChange"
            />
          </template>
          <div v-else class="global-event-drawer__no-event">
            <a-empty description="请从左侧选择一个事件" />
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import { registry } from '@/engine/registry'
import { getNestedProp } from '@/engine/schema-ops'
import type { PropsConfigItem } from '@/types'
import PropItem from './PropItem.vue'
import EventConfig from './EventConfig.vue'
import EventEditor from '@/components/EventEditor/index.vue'
import AdvancedConfig from './AdvancedConfig.vue'
import TabsConfig from './TabsConfig.vue'
import {
  AppstoreOutlined,
  TagOutlined,
  MobileOutlined,
  SelectOutlined,
  BgColorsOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  EditOutlined,
  CodeOutlined,
  BlockOutlined,
  OrderedListOutlined,
  FontSizeOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons-vue'

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()
const activeTab = ref('component')

// 字段标识
const fieldNameItem: PropsConfigItem = { name: 'name', label: '字段名', type: 'Input' }

// 标题位置（全局属性）
const labelPlacementItem: PropsConfigItem = {
  name: 'x-label-placement',
  label: '标题位置',
  type: 'Select',
  options: [
    { label: '左侧', value: 'left' },
    { label: '上方', value: 'top' },
  ],
}

// 高级设置（表单属性tab）
const advancedItems: PropsConfigItem[] = [
  { name: 'x-hidden', label: '隐藏', type: 'Switch' },
  { name: 'x-decorator', label: '装饰器', type: 'Input' },
]

// 移动端设置项
const mobileVisibleItem: PropsConfigItem = {
  name: 'x-mobile.visible',
  label: '显示',
  type: 'Switch',
}

const mobileOrderItem: PropsConfigItem = {
  name: 'x-mobile.order',
  label: '排序',
  type: 'NumberPicker',
  props: { min: 0, max: 999, placeholder: '越小越靠前' },
}

const selectedNode = computed(() => {
  if (!designerStore.selectedPath) return null
  return schemaStore.getNode(designerStore.selectedPath)
})

const selectedLabel = computed(() => {
  if (!selectedNode.value) return ''
  const comp = selectedNode.value['x-component']
  if (!comp) return ''
  return registry.get(comp)?.label ?? comp
})

// 分组图标
function getGroupIcon(groupName: string) {
  const iconMap: Record<string, any> = {
    '基础': EditOutlined,
    '布局': BlockOutlined,
    '模式': EyeOutlined,
    '高级': ThunderboltOutlined,
    '样式': BgColorsOutlined,
    '属性配置': SettingOutlined,
  }
  return iconMap[groupName] || EditOutlined
}

// 从物料配置读取所有属性分组
const allComponentGroups = computed(() => {
  if (!selectedNode.value) return []
  const comp = selectedNode.value['x-component']
  if (!comp) return []
  return registry.getPropsConfig(comp)
})

function getPropValue(propPath: string): any {
  if (!designerStore.selectedPath) return undefined
  const value = getNestedProp(schemaStore.root, designerStore.selectedPath, propPath)
  // 标题位置默认值
  if (propPath === 'x-label-placement' && (value === undefined || value === null)) {
    return 'left'
  }
  return value
}

function onPropChange(propPath: string, value: any) {
  if (!designerStore.selectedPath) return
  schemaStore.updateNestedProp(designerStore.selectedPath, propPath, value)
}

// 表单属性变更（影响所有组件）
function onFormPropChange(propPath: string, value: any) {
  if (!schemaStore.root.properties) return
  for (const [, node] of Object.entries(schemaStore.root.properties)) {
    ;(node as any)[propPath] = value
  }
  schemaStore.triggerUpdate()
}

// 移动端属性读取
function getMobileProp(propName: string): any {
  if (!designerStore.selectedPath || !selectedNode.value) return undefined
  const mobile = selectedNode.value['x-mobile'] as Record<string, any> | undefined
  if (!mobile) {
    // 返回默认值
    if (propName === 'visible') return true
    return undefined
  }
  return mobile[propName]
}

// 移动端属性修改
function onMobilePropChange(propName: string, value: any) {
  if (!designerStore.selectedPath || !selectedNode.value) return
  const mobile = (selectedNode.value['x-mobile'] as Record<string, any>) || {}
  mobile[propName] = value
  selectedNode.value['x-mobile'] = { ...mobile }
  schemaStore.triggerUpdate()
}

// 全局事件配置
const globalEventDrawerVisible = ref(false)
const selectedGlobalEvent = ref<string | null>(null)

const globalEventTypes = [
  { type: 'onMounted', label: '组件加载', description: '组件挂载后触发', functionName: 'mounted' },
  { type: 'onSubmit', label: '表单提交', description: '表单提交时触发', functionName: 'submit' },
]

// 全局事件代码
const mountedEventCode = computed(() => {
  if (!selectedNode.value) return ''
  const config = selectedNode.value['x-code-config']
  if (!config?.eventHandlerCode) return ''

  const match = config.eventHandlerCode.match(/function\s+mounted\([^)]*\)\s*\{([\s\S]*?)\}/)
  return match ? match[1].trim() : ''
})

const submitEventCode = computed(() => {
  if (!selectedNode.value) return ''
  const config = selectedNode.value['x-code-config']
  if (!config?.eventHandlerCode) return ''

  const match = config.eventHandlerCode.match(/function\s+submit\([^)]*\)\s*\{([\s\S]*?)\}/)
  return match ? match[1].trim() : ''
})

// 当前选中的全局事件代码
const currentGlobalEventCode = computed(() => {
  if (!selectedGlobalEvent.value) return ''
  if (selectedGlobalEvent.value === 'onMounted') return mountedEventCode.value
  if (selectedGlobalEvent.value === 'onSubmit') return submitEventCode.value
  return ''
})

// 全局事件数量
const globalEventCount = computed(() => {
  let count = 0
  if (mountedEventCode.value) count++
  if (submitEventCode.value) count++
  return count
})

// 打开全局事件抽屉
function openGlobalEventDrawer() {
  globalEventDrawerVisible.value = true
  // 默认选中第一个有代码的事件，否则选中第一个
  if (mountedEventCode.value) {
    selectedGlobalEvent.value = 'onMounted'
  } else if (submitEventCode.value) {
    selectedGlobalEvent.value = 'onSubmit'
  } else {
    selectedGlobalEvent.value = 'onMounted'
  }
}

// 选择全局事件
function selectGlobalEvent(type: string) {
  selectedGlobalEvent.value = type
}

// 获取全局事件占位符
function getGlobalEventPlaceholder(): string {
  if (selectedGlobalEvent.value === 'onMounted') {
    return '// 组件挂载后执行的代码\n// 例如：初始化数据、请求接口等'
  }
  if (selectedGlobalEvent.value === 'onSubmit') {
    return '// 表单提交前执行的代码\n// 返回 false 可阻止提交'
  }
  return '// 在此编写代码'
}

// 更新全局事件代码
function onGlobalEventCodeChange(code: string) {
  if (!selectedGlobalEvent.value) return

  const eventConfig = globalEventTypes.find(e => e.type === selectedGlobalEvent.value)
  if (!eventConfig) return

  updateGlobalEventCode(eventConfig.type, eventConfig.functionName, code)
}

// 更新全局事件代码（通用方法）
function updateGlobalEventCode(eventName: string, functionName: string, code: string) {
  if (!selectedNode.value) return

  const config = selectedNode.value['x-code-config'] || {}
  let eventHandlerCode = config.eventHandlerCode || ''

  // 移除旧的全局事件代码
  const regex = new RegExp(`//\\s*${eventName}[\\s\\S]*?function\\s+${functionName}\\([^)]*\\)\\s*\\{[\\s\\S]*?\\}`)
  eventHandlerCode = eventHandlerCode.replace(regex, '')

  // 添加新的全局事件代码
  if (code.trim()) {
    const newCode = `// ${eventName}
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
</script>

<style scoped lang="less">
.props-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.ant-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-tabs-content-holder) {
    flex: 1;
    overflow-y: auto;
  }

  :deep(.ant-tabs-nav) {
    padding: 0 16px;
    margin-bottom: 0;
    border-bottom: 1px solid var(--border-color) !important;
  }

  :deep(.ant-tabs-tab) {
    padding: 12px 0 !important;
    margin: 0 12px 0 0 !important;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);

    &.ant-tabs-tab-active {
      color: var(--primary-color);
    }
  }

  &__tabs {
    height: 100%;
  }

  &__content {
    padding: 16px;
  }

  // 组件头部
  &__component-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background: linear-gradient(135deg, #cae3e6 0%, #764ba2 100%);
    border-radius: var(--radius-md);
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &__component-icon {
    font-size: 18px;
  }

  &__component-name {
    font-size: 15px;
    color: #fff;
    font-weight: 600;
  }

  // 配置分组
  &__section {
    margin-bottom: 28px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 16px;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--primary-light);
  }

  &__section-icon {
    font-size: 15px;
  }

  &__section-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  // 空状态
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: var(--text-tertiary);
    text-align: center;
  }

  &__empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  &__empty-text {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  &__empty-hint {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  // 全局事件配置
  &__event-count {
    font-size: 12px;
    color: var(--text-tertiary);
    text-align: center;
    margin-top: 8px;
  }

  &__tip {
    margin-top: 16px;
  }
}

// 全局事件抽屉样式
.global-event-drawer {
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

  &__sidebar-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
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

      .global-event-drawer__event-name {
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
    padding: 16px;
    min-height: 0;
  }

  &__no-event {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
