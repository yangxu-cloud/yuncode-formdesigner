<template>
  <a-modal
    v-model:open="visible"
    :title="isMobile ? '移动端预览' : 'PC端预览'"
    :width="isMobile ? 375 : 900"
    :class="{ 'form-preview-modal--mobile': isMobile }"
    :footer="null"
    @cancel="onClose"
  >
    <div class="form-preview">
      <div v-if="isEmpty" class="form-preview__empty">
        <a-empty description="暂无表单内容" />
      </div>
      <div v-else class="form-preview__content" :class="{ 'form-preview__content--mobile': isMobile }">
        <template v-for="row in rows" :key="row.rowNum">
          <div class="form-preview__row" :class="{ 'form-preview__row--mobile': isMobile }">
            <div
              v-for="item in row.items"
              :key="item.key"
              class="form-preview__cell"
              :style="isMobile ? {} : { gridColumn: `span ${item.span}` }"
            >
              <div
                class="form-preview__field"
                :class="{ 'form-preview__field--inline': getLabelPlacement(item.node) === 'left' && !isMobile }"
              >
                <label v-if="item.node.title" class="form-preview__label">
                  <span v-if="shouldRequired(item.node, item.node.default, item.key)" class="form-preview__required">*</span>
                  {{ item.node.title }}：
                </label>
                <div class="form-preview__control">
                  <a-input
                    v-if="item.node['x-component'] === 'Input'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    :readonly="shouldReadonly(item.node, item.node.default, item.key)"
                    @change="(e: any) => { item.node.default = e.target?.value; onEvent('onChange', item.node, e.target?.value); handleValueChangeLinkage(item.key, e.target?.value) }"
                    @focus="() => onEvent('onFocus', item.node)"
                    @blur="() => onEvent('onBlur', item.node)"
                    @press-enter="() => onEvent('onPressEnter', item.node)"
                  />
                  <a-textarea
                    v-else-if="item.node['x-component'] === 'TextArea'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    :readonly="shouldReadonly(item.node, item.node.default, item.key)"
                    @change="(e: any) => { item.node.default = e.target?.value; onEvent('onChange', item.node, e.target?.value); handleValueChangeLinkage(item.key, e.target?.value) }"
                    @focus="() => onEvent('onFocus', item.node)"
                    @blur="() => onEvent('onBlur', item.node)"
                    @press-enter="() => onEvent('onPressEnter', item.node)"
                  />
                  <a-input-number
                    v-else-if="item.node['x-component'] === 'NumberPicker'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    :readonly="shouldReadonly(item.node, item.node.default, item.key)"
                    style="width: 100%"
                    @change="(val: any) => { item.node.default = val; onEvent('onChange', item.node, val); handleValueChangeLinkage(item.key, val) }"
                    @focus="() => onEvent('onFocus', item.node)"
                    @blur="() => onEvent('onBlur', item.node)"
                  />
                  <a-select
                    v-else-if="item.node['x-component'] === 'Select'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    style="width: 100%"
                    @change="(val: any) => { item.node.default = val; onEvent('onChange', item.node, val); handleValueChangeLinkage(item.key, val) }"
                    @focus="() => onEvent('onFocus', item.node)"
                    @blur="() => onEvent('onBlur', item.node)"
                  />
                  <a-radio-group
                    v-else-if="item.node['x-component'] === 'Radio.Group'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    @change="(e: any) => { item.node.default = e.target?.value; onEvent('onChange', item.node, e.target?.value); handleValueChangeLinkage(item.key, e.target?.value) }"
                  />
                  <a-checkbox-group
                    v-else-if="item.node['x-component'] === 'Checkbox.Group'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    @change="(val: any) => { item.node.default = val; onEvent('onChange', item.node, val); handleValueChangeLinkage(item.key, val) }"
                  />
                  <a-date-picker
                    v-else-if="item.node['x-component'] === 'DatePicker'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    style="width: 100%"
                    @change="(date: any, dateString: string) => { item.node.default = dateString; onEvent('onChange', item.node, dateString) }"
                    @focus="() => onEvent('onFocus', item.node)"
                    @blur="() => onEvent('onBlur', item.node)"
                  />
                  <a-switch
                    v-else-if="item.node['x-component'] === 'Switch'"
                    v-bind="item.node['x-component-props']"
                    :checked="item.node.default"
                    @change="(checked: boolean) => { item.node.default = checked; onEvent('onChange', item.node, checked) }"
                  />
                  <a-input-number
                    v-else-if="item.node['x-component'] === 'InputNumber'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    style="width: 100%"
                    @change="(val: any) => { item.node.default = val; onEvent('onChange', item.node, val) }"
                  />
                  <a-slider
                    v-else-if="item.node['x-component'] === 'Slider'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    @change="(val: any) => { item.node.default = val; onEvent('onChange', item.node, val) }"
                  />
                  <a-rate
                    v-else-if="item.node['x-component'] === 'Rate'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    @change="(val: any) => { item.node.default = val; onEvent('onChange', item.node, val) }"
                  />
                  <a-time-picker
                    v-else-if="item.node['x-component'] === 'TimePicker'"
                    v-bind="item.node['x-component-props']"
                    :value="item.node.default"
                    :disabled="shouldDisable(item.node, item.node.default, item.key)"
                    style="width: 100%"
                    @change="(time: any, timeString: string) => { item.node.default = timeString; onEvent('onChange', item.node, timeString) }"
                  />
                  <a-tabs
                    v-else-if="item.node['x-component'] === 'Tabs'"
                    v-bind="item.node['x-component-props']"
                    style="margin-bottom: 16px"
                  >
                    <a-tab-pane
                      v-for="(childKey, childIndex) in getChildrenKeys(item.key)"
                      :key="childKey"
                      :tab="getChildTabTitle(item.key, childKey)"
                    >
                      <div class="form-preview__tab-content">
                        <div
                          v-for="(tabRow, rowIdx) in getTabPaneRows(item.key, childKey)"
                          :key="rowIdx"
                          class="form-preview__tab-row"
                        >
                          <div
                            v-for="tabItem in tabRow.items"
                            :key="tabItem.key"
                            class="form-preview__tab-cell"
                            :style="{ gridColumn: `span ${tabItem.span}` }"
                          >
                            <div
                              class="form-preview__field"
                              :class="{ 'form-preview__field--inline': getLabelPlacement(tabItem.node) === 'left' && !isMobile }"
                            >
                              <label v-if="tabItem.node.title" class="form-preview__label">
                                <span v-if="tabItem.node.required" class="form-preview__required">*</span>
                                {{ tabItem.node.title }}：
                              </label>
                              <div class="form-preview__control">
                                <component :is="getComponentType(tabItem.node)" v-bind="tabItem.node['x-component-props']" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="!getTabPaneChildren(item.key, childKey).length"
                          class="form-preview__tab-hint"
                        >
                          拖拽组件到此处
                        </div>
                      </div>
                    </a-tab-pane>
                  </a-tabs>
                  <!-- 布局容器 -->
                  <div
                    v-else-if="item.node['x-component'] === 'LayoutContainer'"
                    class="form-preview__layout-container"
                  >
                    <div
                      v-for="(containerRow, rowIdx) in getLayoutContainerRows(item.node)"
                      :key="rowIdx"
                      class="form-preview__layout-row"
                    >
                      <div
                        v-for="containerItem in containerRow.items"
                        :key="containerItem.key"
                        class="form-preview__layout-cell"
                        :style="{ gridColumn: `span ${containerItem.span}` }"
                      >
                        <div
                          class="form-preview__field"
                          :class="{ 'form-preview__field--inline': getLabelPlacement(containerItem.node) === 'left' && !isMobile }"
                        >
                          <label v-if="containerItem.node.title" class="form-preview__label">
                            <span v-if="containerItem.node.required" class="form-preview__required">*</span>
                            {{ containerItem.node.title }}：
                          </label>
                          <div class="form-preview__control">
                            <component :is="getComponentType(containerItem.node)" v-bind="containerItem.node['x-component-props']" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a-collapse
                    v-else-if="item.node['x-component'] === 'Collapse'"
                    v-bind="item.node['x-component-props']"
                    style="margin-bottom: 16px"
                  >
                    <a-collapse-panel
                      v-for="(childKey, childIndex) in getChildrenKeys(item.key)"
                      :key="childKey"
                      :header="getChildTabTitle(item.key, childKey)"
                    >
                      <div class="form-preview__tab-hint">
                        拖拽组件到此处
                      </div>
                    </a-collapse-panel>
                  </a-collapse>
                  <div
                    v-else-if="item.node['x-component'] === 'Divider'"
                    v-bind="item.node['x-component-props']"
                    style="margin: 16px 0"
                  >
                    <a-divider v-bind="item.node['x-component-props']">{{ item.node['x-component-props']?.content }}</a-divider>
                  </div>
                  <div
                    v-else-if="item.node['x-component'] === 'Title'"
                    v-bind="item.node['x-component-props']"
                    style="margin: 16px 0"
                  >
                    <a-typography-title :level="item.node['x-component-props']?.level || 4">
                      {{ item.node['x-component-props']?.content || '标题' }}
                    </a-typography-title>
                  </div>
                  <div
                    v-else-if="item.node['x-component'] === 'Paragraph'"
                    v-bind="item.node['x-component-props']"
                    style="margin: 16px 0"
                  >
                    <a-typography-paragraph>
                      {{ item.node['x-component-props']?.content || '文字内容' }}
                    </a-typography-paragraph>
                  </div>
                  <a-card
                    v-else-if="item.node['x-component'] === 'Card'"
                    :title="item.node['x-component-props']?.title || item.node.title"
                    :bordered="false"
                    style="margin-bottom: 16px"
                  >
                    <div class="form-preview__group-hint">分组容器</div>
                  </a-card>
                  <div v-else class="form-preview__unknown">
                    {{ item.node['x-component'] || '未知组件' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEventExecutor } from '@/composables/useEventExecutor'
import { useSchemaStore } from '@/stores/schema'
import type { FormilySchema, EventType, ConditionConfigValue } from '@/types'

const props = defineProps<{
  open: boolean
  schema: FormilySchema
  isMobile: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const schemaStore = useSchemaStore()

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

// 获取子节点keys
function getChildrenKeys(parentKey: string): string[] {
  const parent = props.schema.properties?.[parentKey]
  if (!parent?.properties) return []
  return Object.keys(parent.properties)
}

// 获取子节点
function getChildNode(parentKey: string, childKey: string): FormilySchema | undefined {
  return props.schema.properties?.[parentKey]?.properties?.[childKey]
}

// 获取标签页面板的子组件keys
function getTabPaneChildren(parentKey: string, tabKey: string): string[] {
  const tabPane = props.schema.properties?.[parentKey]?.properties?.[tabKey]
  if (!tabPane?.properties) return []
  return Object.keys(tabPane.properties)
}

// 获取标签页面板的子节点
function getTabPaneChild(parentKey: string, tabKey: string, childKey: string): FormilySchema | undefined {
  return props.schema.properties?.[parentKey]?.properties?.[tabKey]?.properties?.[childKey]
}

// 获取标签页面板的行布局
function getTabPaneRows(parentKey: string, tabKey: string): Array<{ items: Array<{ key: string; node: FormilySchema; span: number }> }> {
  const tabPane = props.schema.properties?.[parentKey]?.properties?.[tabKey]
  if (!tabPane?.properties) return []

  const entries = Object.entries(tabPane.properties)
  if (entries.length === 0) return []

  // 按行分组
  const rowMap = new Map<number, Array<{ key: string; node: FormilySchema; col: number }>>()

  for (const [key, node] of entries) {
    const row = node['x-row'] ?? 1
    const col = node['x-col'] ?? 1
    if (!rowMap.has(row)) rowMap.set(row, [])
    rowMap.get(row)!.push({ key, node, col })
  }

  // 排序并计算span
  const result: Array<{ items: Array<{ key: string; node: FormilySchema; span: number }> }> = []
  const sortedRows = [...rowMap.keys()].sort((a, b) => a - b)

  for (const rowNum of sortedRows) {
    const rowItems = rowMap.get(rowNum)!
    rowItems.sort((a, b) => a.col - b.col)

    // 计算span
    const count = rowItems.length
    let autoSpans: number[]
    if (count === 1) autoSpans = [4]
    else if (count === 2) autoSpans = [2, 2]
    else if (count === 3) autoSpans = [1, 1, 2]
    else autoSpans = Array(Math.min(count, 4)).fill(1)

    result.push({
      items: rowItems.map((item, idx) => ({
        key: item.key,
        node: item.node,
        span: (item.node['x-span'] as number) || autoSpans[idx] || 1,
      })),
    })
  }

  return result
}

// 获取子节点Tab标题
function getChildTabTitle(parentKey: string, childKey: string): string {
  const child = getChildNode(parentKey, childKey)
  if (!child) return childKey

  // 优先从x-component-props.tab获取
  const tab = child['x-component-props']?.tab
  if (tab) return tab as string

  // 其次从title获取
  if (child.title) return child.title

  // 最后返回childKey
  return childKey
}

// 获取布局容器的行布局
function getLayoutContainerRows(layoutNode: FormilySchema): Array<{ items: Array<{ key: string; node: FormilySchema; span: number }> }> {
  if (!layoutNode.properties) return []

  const entries = Object.entries(layoutNode.properties)
  if (entries.length === 0) return []

  // 按行分组
  const rowMap = new Map<number, Array<{ key: string; node: FormilySchema; col: number }>>()

  for (const [key, node] of entries) {
    const row = node['x-row'] ?? 1
    const col = node['x-col'] ?? 1
    if (!rowMap.has(row)) rowMap.set(row, [])
    rowMap.get(row)!.push({ key, node, col })
  }

  // 排序并计算span
  const result: Array<{ items: Array<{ key: string; node: FormilySchema; span: number }> }> = []
  const sortedRows = [...rowMap.keys()].sort((a, b) => a - b)

  for (const rowNum of sortedRows) {
    const rowItems = rowMap.get(rowNum)!
    rowItems.sort((a, b) => a.col - b.col)

    // 计算span
    const count = rowItems.length
    let autoSpans: number[]
    if (count === 1) autoSpans = [4]
    else if (count === 2) autoSpans = [2, 2]
    else if (count === 3) autoSpans = [1, 1, 2]
    else autoSpans = Array(Math.min(count, 4)).fill(1)

    result.push({
      items: rowItems.map((item, idx) => ({
        key: item.key,
        node: item.node,
        span: (item.node['x-span'] as number) || autoSpans[idx] || 1,
      })),
    })
  }

  return result
}

// 获取组件类型（用于动态渲染）
function getComponentType(node: FormilySchema): any {
  const componentMap: Record<string, any> = {
    'Input': 'a-input',
    'TextArea': 'a-textarea',
    'NumberPicker': 'a-input-number',
    'InputNumber': 'a-input-number',
    'Select': 'a-select',
    'Radio.Group': 'a-radio-group',
    'Checkbox.Group': 'a-checkbox-group',
    'DatePicker': 'a-date-picker',
    'Switch': 'a-switch',
    'Slider': 'a-slider',
    'Rate': 'a-rate',
    'TimePicker': 'a-time-picker',
  }
  const componentName = node['x-component'] || 'Input'
  return componentMap[componentName] || 'a-input'
}

const isEmpty = computed(() => {
  return !props.schema.properties || Object.keys(props.schema.properties).length === 0
})

interface PreviewItem {
  key: string
  node: FormilySchema
  span: number
}

interface PreviewRow {
  rowNum: number
  items: PreviewItem[]
}

function calcSpans(count: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [4]
  if (count === 2) return [2, 2]
  if (count === 3) return [1, 1, 2]
  return Array(Math.min(count, 4)).fill(1)
}

// 获取表单数据
function getFormData(): Record<string, any> {
  const properties = schemaStore.root.properties || {}
  const data: Record<string, any> = {}
  for (const [key, node] of Object.entries(properties)) {
    data[key] = node.default
  }
  return data
}

// 评估条件表达式
function evaluateCondition(condition: string, value: any, field: string): boolean {
  if (!condition || condition.trim() === '') return false

  try {
    const formData = getFormData()
    const fn = new Function('value', 'field', 'formData', `return ${condition}`)
    return fn(value, field, formData)
  } catch (error) {
    console.warn(`[Preview] 条件评估错误:`, error)
    return false
  }
}

// 检查组件是否应该隐藏
function shouldHide(node: FormilySchema, value: any, field: string): boolean {
  const advancedConfig = node['x-advanced-config']
  if (!advancedConfig) return false

  // 检查显示条件（优先级最高）
  if (advancedConfig.visibleCondition) {
    const result = evaluateCondition(advancedConfig.visibleCondition, value, field)
    const config = advancedConfig.visibleConditionConfig
    // 根据配置的状态决定返回值
    if (config?.visibilityState === 'hidden') return result
    return !result
  }

  // 检查隐藏条件
  if (advancedConfig.hideCondition) {
    const result = evaluateCondition(advancedConfig.hideCondition, value, field)
    const config = advancedConfig.hideConditionConfig
    // 根据配置的状态决定返回值
    if (config?.visibilityState === 'visible') return !result
    return result
  }

  return false
}

// 检查组件是否应该禁用
function shouldDisable(node: FormilySchema, value: any, field: string): boolean {
  const advancedConfig = node['x-advanced-config']
  if (!advancedConfig) return false

  // 检查禁用条件
  if (advancedConfig.disabledCondition) {
    const result = evaluateCondition(advancedConfig.disabledCondition, value, field)
    const config = advancedConfig.disabledConditionConfig
    // 根据配置的状态决定返回值
    if (config?.availabilityState === 'enabled') return !result
    return result
  }

  return false
}

// 检查组件是否应该只读
function shouldReadonly(node: FormilySchema, value: any, field: string): boolean {
  const advancedConfig = node['x-advanced-config']
  if (!advancedConfig) return false

  // 检查只读条件
  if (advancedConfig.readonlyCondition) {
    return evaluateCondition(advancedConfig.readonlyCondition, value, field)
  }

  return false
}

// 检查组件是否应该必填
function shouldRequired(node: FormilySchema, value: any, field: string): boolean {
  const advancedConfig = node['x-advanced-config']

  // 检查必填条件
  if (advancedConfig?.requiredCondition) {
    const result = evaluateCondition(advancedConfig.requiredCondition, value, field)
    const config = advancedConfig.requiredConditionConfig
    // 根据配置的状态决定返回值
    if (config?.requiredState === 'optional') return !result
    return result
  }

  return node.required || false
}

// 处理值变化联动
function handleValueChangeLinkage(field: string, value: any) {
  const node = schemaStore.root.properties?.[field]
  if (!node) return

  const advancedConfig = node['x-advanced-config']
  if (!advancedConfig) return

  // 处理数据联动配置
  if (advancedConfig.dataLinkageConfig) {
    handleDataLinkage(field, value, advancedConfig.dataLinkageConfig)
  }
}

// 处理数据联动配置
function handleDataLinkage(field: string, value: any, linkageConfig: any) {
  try {
    const formData = getFormData()

    // 检查条件是否满足
    if (!evaluateLinkageConditions(linkageConfig.conditionGroups, value, field, formData)) {
      return
    }

    // 执行联动动作
    for (const action of linkageConfig.actions) {
      executeLinkageAction(action, value, field, formData)
    }

    schemaStore.triggerUpdate()
  } catch (error) {
    console.warn(`[Preview] 数据联动处理错误:`, error)
  }
}

// 评估联动条件
function evaluateLinkageConditions(
  conditionGroups: any[],
  value: any,
  field: string,
  formData: Record<string, any>
): boolean {
  if (!conditionGroups || conditionGroups.length === 0) return true

  for (const group of conditionGroups) {
    const groupResult = evaluateConditionGroup(group, value, field, formData)

    if (group.relation === 'OR' && groupResult) {
      return true
    }
    if (group.relation === 'AND' && !groupResult) {
      return false
    }
  }

  // 默认返回 true（如果没有条件或所有条件组都满足）
  return true
}

// 评估条件组
function evaluateConditionGroup(
  group: any,
  value: any,
  field: string,
  formData: Record<string, any>
): boolean {
  if (!group.conditions || group.conditions.length === 0) return true

  for (const condition of group.conditions) {
    const conditionResult = evaluateLinkageCondition(condition, value, field, formData)

    if (condition.relation === 'OR' && conditionResult) {
      return true
    }
    if (condition.relation === 'AND' && !conditionResult) {
      return false
    }
  }

  return true
}

// 评估单个条件
function evaluateLinkageCondition(
  condition: any,
  value: any,
  field: string,
  formData: Record<string, any>
): boolean {
  if (!condition.field || !condition.operator) return false

  const fieldValue = condition.field === field ? value : formData[condition.field]
  const compareValue = condition.value

  switch (condition.operator) {
    case '==':
      return String(fieldValue) === String(compareValue)
    case '!=':
      return String(fieldValue) !== String(compareValue)
    case '>':
      return Number(fieldValue) > Number(compareValue)
    case '>=':
      return Number(fieldValue) >= Number(compareValue)
    case '<':
      return Number(fieldValue) < Number(compareValue)
    case '<=':
      return Number(fieldValue) <= Number(compareValue)
    case 'includes':
      return String(fieldValue).includes(compareValue)
    case 'notIncludes':
      return !String(fieldValue).includes(compareValue)
    case 'empty':
      return !fieldValue
    case 'notEmpty':
      return !!fieldValue
    default:
      return false
  }
}

// 执行联动动作
function executeLinkageAction(
  action: any,
  value: any,
  field: string,
  formData: Record<string, any>
) {
  if (!action.type || !action.targetField) return

  const targetNode = schemaStore.root.properties?.[action.targetField]
  if (!targetNode) return

  switch (action.type) {
    case 'setValue':
      // 设置值
      let targetValue = value
      if (action.value !== undefined && action.value !== '') {
        targetValue = action.value
      }
      targetNode.default = targetValue
      break

    case 'setVisible':
      // 设置可见性
      targetNode['x-visible'] = action.actionValue === 'true'
      break

    case 'setDisabled':
      // 设置禁用状态
      if (!targetNode['x-component-props']) {
        targetNode['x-component-props'] = {}
      }
      targetNode['x-component-props'].disabled = action.actionValue === 'true'
      break

    case 'setRequired':
      // 设置必填状态
      targetNode.required = action.actionValue === 'true'
      break
  }
}

const rows = computed<PreviewRow[]>(() => {
  if (!props.schema.properties) return []

  let entries = Object.entries(props.schema.properties)
  if (entries.length === 0) return []

  // 获取表单数据用于条件评估
  const formData = getFormData()

  // 过滤隐藏组件（包括静态隐藏和条件隐藏）
  entries = entries.filter(([key, node]) => {
    // 检查静态隐藏
    if (node['x-hidden']) return false

    // 检查移动端配置
    const mobile = node['x-mobile']
    if (mobile && mobile.visible === false) return false

    // 检查条件隐藏
    const value = node.default
    if (shouldHide(node, value, key)) return false

    return true
  })

  // 移动端模式
  if (props.isMobile) {
    // 按移动端 order 排序
    entries.sort((a, b) => {
      const orderA = (a[1]['x-mobile'] as any)?.order ?? ((a[1]['x-row'] ?? 1) * 4 + (a[1]['x-col'] ?? 1))
      const orderB = (b[1]['x-mobile'] as any)?.order ?? ((b[1]['x-row'] ?? 1) * 4 + (b[1]['x-col'] ?? 1))
      return orderA - orderB
    })

    return entries.map(([key, node], idx) => ({
      rowNum: idx + 1,
      items: [{ key, node, span: 1 }],
    }))
  }

  // PC 端模式
  const itemsWithPos: Array<{ key: string; node: FormilySchema; row: number; col: number }> = []
  for (const [key, node] of entries) {
    itemsWithPos.push({ key, node, row: node['x-row'] ?? 1, col: node['x-col'] ?? 1 })
  }

  const rowMap = new Map<number, typeof itemsWithPos>()
  for (const item of itemsWithPos) {
    if (!rowMap.has(item.row)) rowMap.set(item.row, [])
    rowMap.get(item.row)!.push(item)
  }

  const result: PreviewRow[] = []
  const sortedRows = [...rowMap.keys()].sort((a, b) => a - b)

  for (let i = 0; i < sortedRows.length; i++) {
    const rowNum = sortedRows[i]
    const rowItems = rowMap.get(rowNum)!
    rowItems.sort((a, b) => a.col - b.col)
    const autoSpans = calcSpans(rowItems.length)

    result.push({
      rowNum: i + 1,
      items: rowItems.map((item, idx) => ({
        key: item.key,
        node: item.node,
        span: (item.node['x-span'] as number) || autoSpans[idx] || 1,
      })),
    })
  }

  return result
})

// 获取标题位置（默认左侧）
function getLabelPlacement(node: FormilySchema): string {
  return (node['x-label-placement'] as string) || 'left'
}

// 处理组件事件
function onEvent(eventType: EventType, node: FormilySchema, value?: any) {
  // 1. 执行事件流（动作配置）
  const events = node['x-events']
  if (events && events[eventType] && events[eventType].length > 0) {
    const executor = useEventExecutor()
    executor.executeActions(events[eventType])
  }

  // 2. 执行自定义代码
  const codeConfig = node['x-code-config']
  if (codeConfig?.eventHandlerCode) {
    executeEventCode(eventType, codeConfig.eventHandlerCode, node, value)
  }
}

// 执行事件代码
function executeEventCode(eventType: EventType, eventCode: string, node: FormilySchema, value?: any) {
  // 解析事件函数名
  const eventNames: Record<string, string> = {
    onChange: 'change',
    onFocus: 'focus',
    onBlur: 'blur',
    onPressEnter: 'pressEnter',
    onMounted: 'mounted',
    onSubmit: 'submit',
  }

  const functionName = eventNames[eventType]
  if (!functionName) return

  // 匹配函数体 - 支持多种格式
  // 格式1: function change($inject) { ... }
  // 格式2: function change() { ... }
  const regex = new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\}`)
  const match = eventCode.match(regex)
  if (!match) {
    console.log(`[Preview] 未找到 ${functionName} 函数`)
    return
  }

  const code = match[1].trim()
  if (!code) {
    console.log(`[Preview] ${functionName} 函数体为空`)
    return
  }

  console.log(`[Preview] 执行 ${functionName} 函数，代码:`, code)

  // 创建 $inject 对象
  const $inject = createInjectObject(node, value)
  console.log(`[Preview] $inject 对象:`, $inject)

  // 执行代码
  try {
    const fn = new Function('$inject', 'event', code)
    const eventObj = { target: { value } }
    fn($inject, eventObj)
    console.log(`[Preview] ${functionName} 函数执行成功`)
  } catch (error) {
    console.error(`[Preview] 执行 ${eventType} 事件代码错误:`, error)
  }
}

// 创建 $inject 对象 - 参考 FormCreate 设计
function createInjectObject(currentNode: FormilySchema, currentValue?: any) {
  const schemaStore = useSchemaStore()

  // 获取所有字段值
  function getFormData(): Record<string, any> {
    const properties = schemaStore.root.properties || {}
    const data: Record<string, any> = {}
    for (const [key, node] of Object.entries(properties)) {
      data[key] = node.default
    }
    return data
  }

  // 设置字段值
  function setFieldValue(fieldName: string, value: any) {
    const properties = schemaStore.root.properties || {}
    const node = properties[fieldName]
    if (node) {
      node.default = value
      schemaStore.triggerUpdate()
    }
  }

  // 获取字段值
  function getFieldValue(fieldName: string): any {
    const properties = schemaStore.root.properties || {}
    return properties[fieldName]?.default
  }

  // 设置字段可见性
  function setFieldVisible(fieldName: string, visible: boolean) {
    const properties = schemaStore.root.properties || {}
    const node = properties[fieldName]
    if (node) {
      node['x-visible'] = visible
      schemaStore.triggerUpdate()
    }
  }

  // 设置字段禁用状态
  function setFieldDisabled(fieldName: string, disabled: boolean) {
    const properties = schemaStore.root.properties || {}
    const node = properties[fieldName]
    if (node) {
      if (!node['x-component-props']) {
        node['x-component-props'] = {}
      }
      node['x-component-props'].disabled = disabled
      schemaStore.triggerUpdate()
    }
  }

  // 验证表单
  function validateForm(): boolean {
    console.log('[Preview] 触发表单验证')
    return true
  }

  // 提交表单
  function submitForm() {
    console.log('[Preview] 提交表单:', getFormData())
  }

  // 重置表单
  function resetForm() {
    const properties = schemaStore.root.properties || {}
    for (const [, node] of Object.entries(properties)) {
      node.default = undefined
    }
    schemaStore.triggerUpdate()
  }

  // 清空表单
  function clearForm() {
    resetForm()
  }

  // 发起 HTTP 请求
  async function httpRequest(options: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    params?: Record<string, any>
    headers?: Record<string, string>
    onSuccess?: (data: any) => void
    onError?: (error: any) => void
  }): Promise<any> {
    const { url, method = 'GET', data, params, headers = {}, onSuccess, onError } = options

    try {
      // 构建 URL
      let fullUrl = url
      if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString()
        fullUrl += `?${queryString}`
      }

      // 构建请求选项
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      // 添加请求体
      if (method !== 'GET' && data) {
        fetchOptions.body = JSON.stringify(data)
      }

      console.log(`[Preview] 发起请求: ${method} ${fullUrl}`)

      // 发起请求
      const response = await fetch(fullUrl, fetchOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log(`[Preview] 请求成功:`, result)

      // 调用成功回调
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (error) {
      console.error(`[Preview] 请求失败:`, error)

      // 调用错误回调
      if (onError) {
        onError(error)
      }

      throw error
    }
  }

  // 参考 FormCreate 的 api 对象设计
  const api = {
    // 获取表单数据
    formData: getFormData,
    // 设置表单数据（批量设置）
    setFormData(formData: Record<string, any>) {
      for (const [key, value] of Object.entries(formData)) {
        setFieldValue(key, value)
      }
    },
    // 获取字段值
    getValue: getFieldValue,
    // 设置字段值
    setValue: setFieldValue,
    // 设置字段可见性
    setVisible: setFieldVisible,
    // 设置字段禁用状态
    setDisabled: setFieldDisabled,
    // 验证表单
    validate: validateForm,
    // 提交表单
    submit: submitForm,
    // 重置表单
    reset: resetForm,
    // 清空表单
    clear: clearForm,
    // 重新加载表单
    reload() {
      schemaStore.triggerUpdate()
    },
    // 发起 HTTP 请求
    request: httpRequest,
    // 获取当前字段值
    get currentValue() {
      return currentValue
    },
    // 获取当前字段名
    get currentField() {
      return currentNode.name || ''
    },
  }

  return {
    // api 对象 - 包含所有表单操作方法
    api,
    // 为了兼容，也直接暴露一些常用方法
    formData: getFormData,
    setValue: setFieldValue,
    getValue: getFieldValue,
    setVisible: setFieldVisible,
    setDisabled: setFieldDisabled,
    validate: validateForm,
    submit: submitForm,
    reset: resetForm,
    clear: clearForm,
    request: httpRequest,
  }
}

function onClose() {
  emit('update:open', false)
}
</script>

<style scoped lang="less">
.form-preview {
  min-height: 300px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px;

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &--mobile {
      max-width: 375px;
      margin: 0 auto;
    }
  }

  &__row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    &--mobile {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  &__cell {
    &--mobile {
      width: 100%;
    }
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    // 左侧标题布局（PC端）
    &--inline {
      flex-direction: row;
      align-items: center;
      gap: 8px;

      .form-preview__label {
        min-width: 80px;
        text-align: right;
      }

      .form-preview__control {
        flex: 1;
      }
    }

    // 移动端始终垂直布局
    .form-preview__row--mobile & {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
  }

  &__label {
    font-size: 13px;
    color: var(--text-primary);
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__required {
    color: var(--error-color);
    margin-right: 2px;
  }

  &__control {
    flex: 1;
    min-width: 0;
  }

  &__group-hint {
    text-align: center;
    color: var(--text-tertiary);
    font-size: 12px;
    padding: 20px;
  }

  &__unknown {
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-tertiary);
    font-size: 12px;
    text-align: center;
  }

  &__layout-container {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fafafa;
  }

  &__layout-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  &__layout-cell {
    min-height: 40px;
  }

  &__tab-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    min-height: 80px;
    background: #fafafa;
    border-radius: 8px;
  }

  &__tab-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  &__tab-cell {
    min-height: 40px;
  }

  &__tab-hint {
    text-align: center;
    color: #999;
    font-size: 13px;
    padding: 20px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    background: #fff;
  }
}
</style>

<!-- 移动端预览全局样式 -->
<style>
.form-preview-modal--mobile .ant-modal {
  max-width: 375px !important;
}

.form-preview-modal--mobile .ant-modal-body {
  padding: 0 !important;
  background: #f5f5f5;
  border-radius: 0 !important;
}

.form-preview__row--mobile .form-preview__label {
  font-size: 14px !important;
}

.form-preview__row--mobile .ant-input,
.form-preview__row--mobile .ant-input-number,
.form-preview__row--mobile .ant-select,
.form-preview__row--mobile .ant-picker,
.form-preview__row--mobile .ant-input-textarea,
.form-preview__row--mobile .ant-input-affix-wrapper {
  width: 100% !important;
}
</style>
