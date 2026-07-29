<template>
  <div class="data-linkage-config">
    <!-- 标题 -->
    <div class="data-linkage-config__header">
      <span class="data-linkage-config__title">{{ title }}</span>
      <a-button size="small" type="link" @click="showModal = true">
        <template #icon><SettingOutlined /></template>
        配置联动
      </a-button>
    </div>

    <!-- 已配置摘要 -->
    <div v-if="hasLinkage" class="data-linkage-config__summary">
      <a-tag color="blue" size="small">
        <template #icon><LinkOutlined /></template>
        已配置 {{ totalLinkages }} 条联动规则
      </a-tag>
      <a-button size="small" type="link" danger @click="clearLinkage">
        清除
      </a-button>
    </div>
    <div v-else class="data-linkage-config__empty">
      <span class="data-linkage-config__empty-text">未配置联动</span>
    </div>

    <!-- 数据联动配置弹窗 -->
    <a-modal
      v-model:open="showModal"
      :title="title"
      width="800px"
      :body-style="{ height: '500px', overflow: 'auto' }"
      @ok="onSave"
      @cancel="onCancel"
    >
      <div class="data-linkage-config__modal">
        <!-- Tab 切换 -->
        <a-tabs v-model:activeKey="activeTab" size="small">
          <!-- 数据联动 Tab -->
          <a-tab-pane key="linkage" tab="数据联动">
            <div class="data-linkage-config__linkage">
              <!-- 设置条件区域 -->
              <div class="data-linkage-config__condition-section">
                <div class="data-linkage-config__section-title">
                  <span class="data-linkage-config__section-icon">
                    <FilterOutlined />
                  </span>
                  设置条件
                </div>
                <div class="data-linkage-config__condition-groups">
                  <div
                    v-for="(group, groupIndex) in conditionGroups"
                    :key="groupIndex"
                    class="data-linkage-config__condition-group"
                  >
                    <!-- 组间逻辑关系 -->
                    <div v-if="groupIndex > 0" class="data-linkage-config__group-relation">
                      <a-select
                        v-model:value="group.relation"
                        size="small"
                        style="width: 80px"
                      >
                        <a-select-option value="AND">AND</a-select-option>
                        <a-select-option value="OR">OR</a-select-option>
                      </a-select>
                    </div>

                    <!-- 条件列表 -->
                    <div class="data-linkage-config__conditions">
                      <div
                        v-for="(condition, conditionIndex) in group.conditions"
                        :key="conditionIndex"
                        class="data-linkage-config__condition"
                      >
                        <!-- 组内逻辑关系 -->
                        <div v-if="conditionIndex > 0" class="data-linkage-config__condition-relation">
                          <a-select
                            v-model:value="condition.relation"
                            size="small"
                            style="width: 70px"
                          >
                            <a-select-option value="AND">AND</a-select-option>
                            <a-select-option value="OR">OR</a-select-option>
                          </a-select>
                        </div>

                        <!-- 条件字段 -->
                        <div class="data-linkage-config__condition-fields">
                          <a-select
                            v-model:value="condition.field"
                            placeholder="字段"
                            size="small"
                            show-search
                            style="width: 150px"
                          >
                            <a-select-option v-for="field in availableFields" :key="field.value" :value="field.value">
                              {{ field.label }}
                            </a-select-option>
                          </a-select>

                          <a-select
                            v-model:value="condition.operator"
                            placeholder="条件"
                            size="small"
                            style="width: 120px"
                          >
                            <a-select-option v-for="op in operators" :key="op.value" :value="op.value">
                              {{ op.label }}
                            </a-select-option>
                          </a-select>

                          <a-input
                            v-if="!isNoValueOperator(condition.operator)"
                            v-model:value="condition.value"
                            placeholder="值"
                            size="small"
                            style="width: 120px"
                          />

                          <a-button
                            size="small"
                            type="text"
                            danger
                            @click="removeCondition(groupIndex, conditionIndex)"
                          >
                            <template #icon><DeleteOutlined /></template>
                          </a-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="data-linkage-config__condition-actions">
                  <a-button size="small" type="dashed" @click="addCondition">
                    <template #icon><PlusOutlined /></template>
                    添加条件
                  </a-button>
                  <a-button size="small" type="dashed" @click="addGroup">
                    <template #icon><PlusOutlined /></template>
                    添加条件组
                  </a-button>
                </div>
              </div>

              <!-- 触发以下联动 -->
              <div class="data-linkage-config__action-section">
                <div class="data-linkage-config__section-title">
                  <span class="data-linkage-config__section-icon">
                    <LinkOutlined />
                  </span>
                  触发以下联动
                </div>
                <div class="data-linkage-config__actions">
                  <div
                    v-for="(action, actionIndex) in linkageActions"
                    :key="actionIndex"
                    class="data-linkage-config__action"
                  >
                    <span class="data-linkage-config__action-label">触发联动</span>

                    <a-select
                      v-model:value="action.type"
                      size="small"
                      style="width: 120px"
                    >
                      <a-select-option value="setValue">设置值</a-select-option>
                      <a-select-option value="setVisible">设置可见</a-select-option>
                      <a-select-option value="setDisabled">设置禁用</a-select-option>
                      <a-select-option value="setRequired">设置必填</a-select-option>
                    </a-select>

                    <a-select
                      v-model:value="action.targetField"
                      placeholder="目标字段"
                      size="small"
                      show-search
                      style="width: 150px"
                    >
                      <a-select-option v-for="field in availableFields" :key="field.value" :value="field.value">
                        {{ field.label }}
                      </a-select-option>
                    </a-select>

                    <a-input
                      v-if="action.type === 'setValue'"
                      v-model:value="action.actionValue"
                      placeholder="目标值"
                      size="small"
                      style="width: 120px"
                    />

                    <a-select
                      v-else
                      v-model:value="action.actionValue"
                      size="small"
                      style="width: 100px"
                    >
                      <a-select-option value="true">是</a-select-option>
                      <a-select-option value="false">否</a-select-option>
                    </a-select>

                    <a-button
                      size="small"
                      type="text"
                      danger
                      @click="removeAction(actionIndex)"
                    >
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </div>
                </div>

                <a-button
                  size="small"
                  type="dashed"
                  block
                  @click="addAction"
                  style="margin-top: 12px"
                >
                  <template #icon><PlusOutlined /></template>
                  添加联动
                </a-button>
              </div>
            </div>
          </a-tab-pane>

          <!-- 计算公式 Tab -->
          <a-tab-pane key="formula" tab="计算公式">
            <div class="data-linkage-config__formula">
              <div class="data-linkage-config__formula-layout">
                <!-- 左侧：可用字段和函数 -->
                <div class="data-linkage-config__formula-sidebar">
                  <a-input
                    v-model:value="formulaSearch"
                    placeholder="输入关键字搜索"
                    size="small"
                    class="data-linkage-config__formula-search"
                  >
                    <template #prefix><SearchOutlined /></template>
                  </a-input>

                  <!-- 当前表单字段 -->
                  <div class="data-linkage-config__formula-group">
                    <div class="data-linkage-config__formula-group-title" @click="toggleFormulaGroup('fields')">
                      <span v-if="expandedFormulaGroups.has('fields')"><DownOutlined /></span>
                      <span v-else><RightOutlined /></span>
                      当前表单
                    </div>
                    <div v-if="expandedFormulaGroups.has('fields')" class="data-linkage-config__formula-group-content">
                      <div
                        v-for="field in filteredFormFields"
                        :key="field.value"
                        class="data-linkage-config__formula-item"
                        @click="insertFormulaField(field.value)"
                      >
                        <span class="data-linkage-config__formula-item-name">{{ field.label }}</span>
                        <a-tag size="small" color="blue">ID</a-tag>
                      </div>
                    </div>
                  </div>

                  <!-- 函数公式 -->
                  <div class="data-linkage-config__formula-group">
                    <div class="data-linkage-config__formula-group-title" @click="toggleFormulaGroup('functions')">
                      <span v-if="expandedFormulaGroups.has('functions')"><DownOutlined /></span>
                      <span v-else><RightOutlined /></span>
                      函数公式
                    </div>
                    <div v-if="expandedFormulaGroups.has('functions')" class="data-linkage-config__formula-group-content">
                      <div
                        v-for="category in filteredFormulaCategories"
                        :key="category.key"
                        class="data-linkage-config__formula-subgroup"
                      >
                        <div class="data-linkage-config__formula-subgroup-title" @click.stop="toggleFormulaGroup(category.key)">
                          <span v-if="expandedFormulaGroups.has(category.key)"><DownOutlined /></span>
                          <span v-else><RightOutlined /></span>
                          {{ category.name }}
                        </div>
                        <div v-if="expandedFormulaGroups.has(category.key)" class="data-linkage-config__formula-subgroup-content">
                          <div
                            v-for="func in category.formulas"
                            :key="func.name"
                            class="data-linkage-config__formula-item"
                            @click="insertFormulaFunction(func)"
                          >
                            <span class="data-linkage-config__formula-item-name">{{ func.name }}</span>
                            <span class="data-linkage-config__formula-item-desc">{{ func.desc }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 右侧：公式编辑器 -->
                <div class="data-linkage-config__formula-editor">
                  <div class="data-linkage-config__formula-editor-title">设置联动公式</div>
                  <a-textarea
                    ref="formulaEditorRef"
                    v-model:value="formulaCode"
                    placeholder="// 返回对象，key 为目标字段，value 为联动值
// 例如:
{
  detail: value,
  total: value * formData.price
}"
                    :rows="8"
                    class="data-linkage-config__formula-textarea"
                  />
                </div>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import {
  SettingOutlined,
  LinkOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  DownOutlined,
  RightOutlined,
  FilterOutlined,
} from '@ant-design/icons-vue'
import type {
  DataLinkageConfigValue,
  LinkageConditionGroup,
  LinkageCondition,
  LinkageAction,
} from '@/types'

export type { DataLinkageConfigValue, LinkageConditionGroup, LinkageCondition, LinkageAction }

const props = withDefaults(defineProps<{
  title: string
  modelValue?: DataLinkageConfigValue
}>(), {
  title: '数据联动',
})

const emit = defineEmits<{
  'update:modelValue': [value: DataLinkageConfigValue]
  change: [value: DataLinkageConfigValue]
}>()

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 弹窗状态
const showModal = ref(false)
const activeTab = ref('linkage')

// 条件数据
const conditionGroups = ref<LinkageConditionGroup[]>([])
const linkageActions = ref<LinkageAction[]>([])

// 公式数据
const formulaSearch = ref('')
const formulaEditorRef = ref()
const formulaCode = ref('')
const expandedFormulaGroups = ref<Set<string>>(new Set(['fields']))

// 操作符列表
const operators = [
  { label: '等于', value: '==' },
  { label: '不等于', value: '!=' },
  { label: '包含', value: 'includes' },
  { label: '不包含', value: 'notIncludes' },
  { label: '大于', value: '>' },
  { label: '大于等于', value: '>=' },
  { label: '小于', value: '<' },
  { label: '小于等于', value: '<=' },
  { label: '为空', value: 'empty' },
  { label: '不为空', value: 'notEmpty' },
]

// 可用字段列表
const availableFields = computed(() => {
  const properties = schemaStore.root.properties || {}
  return Object.entries(properties).map(([key, node]) => ({
    value: key,
    label: node.title || key,
  }))
})

// 过滤后的表单字段
const filteredFormFields = computed(() => {
  if (!formulaSearch.value) return availableFields.value
  const search = formulaSearch.value.toLowerCase()
  return availableFields.value.filter(field =>
    field.label.toLowerCase().includes(search) || field.value.toLowerCase().includes(search)
  )
})

// 公式分类
interface FormulaItem {
  name: string
  desc: string
  template: string
}

interface FormulaCategory {
  key: string
  name: string
  formulas: FormulaItem[]
}

// 函数分类列表
const formulaCategories = ref<FormulaCategory[]>([
  {
    key: 'number',
    name: '数字处理',
    formulas: [
      { name: 'abs(x)', desc: '绝对值', template: 'Math.abs({0})' },
      { name: 'ceil(x)', desc: '向上取整', template: 'Math.ceil({0})' },
      { name: 'floor(x)', desc: '向下取整', template: 'Math.floor({0})' },
      { name: 'round(x)', desc: '四舍五入', template: 'Math.round({0})' },
      { name: 'max(a, b)', desc: '最大值', template: 'Math.max({0}, {1})' },
      { name: 'min(a, b)', desc: '最小值', template: 'Math.min({0}, {1})' },
      { name: 'parseInt(x)', desc: '转整数', template: 'parseInt({0})' },
      { name: 'parseFloat(x)', desc: '转浮点数', template: 'parseFloat({0})' },
    ],
  },
  {
    key: 'string',
    name: '文本处理',
    formulas: [
      { name: 'length', desc: '字符串长度', template: '{0}.length' },
      { name: 'toUpperCase()', desc: '转大写', template: '{0}.toUpperCase()' },
      { name: 'toLowerCase()', desc: '转小写', template: '{0}.toLowerCase()' },
      { name: 'trim()', desc: '去除空格', template: '{0}.trim()' },
      { name: 'includes(s)', desc: '包含', template: '{0}.includes({1})' },
      { name: 'startsWith(s)', desc: '以...开头', template: '{0}.startsWith({1})' },
      { name: 'endsWith(s)', desc: '以...结尾', template: '{0}.endsWith({1})' },
      { name: 'replace(a, b)', desc: '替换', template: '{0}.replace({1}, {2})' },
      { name: 'substr(start, len)', desc: '截取子串', template: '{0}.substr({1}, {2})' },
      { name: 'split(s)', desc: '分割字符串', template: '{0}.split({1})' },
      { name: 'join(s)', desc: '数组连接', template: '{0}.join({1})' },
    ],
  },
  {
    key: 'date',
    name: '日期处理',
    formulas: [
      { name: 'new Date()', desc: '当前日期', template: 'new Date()' },
      { name: 'now()', desc: '当前时间戳', template: 'Date.now()' },
      { name: 'getFullYear()', desc: '获取年份', template: 'new Date().getFullYear()' },
      { name: 'getMonth()', desc: '获取月份', template: 'new Date().getMonth() + 1' },
      { name: 'getDate()', desc: '获取日期', template: 'new Date().getDate()' },
      { name: 'getDay()', desc: '获取星期', template: 'new Date().getDay()' },
      { name: 'getHours()', desc: '获取小时', template: 'new Date().getHours()' },
      { name: 'getMinutes()', desc: '获取分钟', template: 'new Date().getMinutes()' },
      { name: 'getSeconds()', desc: '获取秒', template: 'new Date().getSeconds()' },
      { name: 'toISOString()', desc: '转ISO格式', template: 'new Date().toISOString()' },
      { name: 'toLocaleDateString()', desc: '本地日期', template: 'new Date().toLocaleDateString()' },
    ],
  },
  {
    key: 'logic',
    name: '逻辑处理',
    formulas: [
      { name: 'AND', desc: '逻辑与', template: '{0} && {1}' },
      { name: 'OR', desc: '逻辑或', template: '{0} || {1}' },
      { name: 'NOT', desc: '逻辑非', template: '!{0}' },
      { name: 'if(c, a, b)', desc: '条件判断', template: '{0} ? {1} : {2}' },
      { name: 'isEmpty', desc: '是否为空', template: '!{0}' },
      { name: 'isNotEmpty', desc: '是否不为空', template: '!!{0}' },
      { name: 'equal(a, b)', desc: '是否相等', template: '{0} === {1}' },
      { name: 'notEqual(a, b)', desc: '是否不等', template: '{0} !== {1}' },
      { name: 'greater(a, b)', desc: '大于', template: '{0} > {1}' },
      { name: 'less(a, b)', desc: '小于', template: '{0} < {1}' },
    ],
  },
  {
    key: 'collection',
    name: '合集处理',
    formulas: [
      { name: 'length', desc: '数组长度', template: '{0}.length' },
      { name: 'includes(item)', desc: '包含元素', template: '{0}.includes({1})' },
      { name: 'indexOf(item)', desc: '元素索引', template: '{0}.indexOf({1})' },
      { name: 'filter(fn)', desc: '过滤', template: '{0}.filter(item => {1})' },
      { name: 'map(fn)', desc: '映射', template: '{0}.map(item => {1})' },
      { name: 'reduce(fn)', desc: '归约', template: '{0}.reduce((acc, item) => {1}, 0)' },
      { name: 'find(fn)', desc: '查找', template: '{0}.find(item => {1})' },
      { name: 'some(fn)', desc: '存在', template: '{0}.some(item => {1})' },
      { name: 'every(fn)', desc: '全部满足', template: '{0}.every(item => {1})' },
      { name: 'flat()', desc: '扁平化', template: '{0}.flat()' },
    ],
  },
  {
    key: 'advanced',
    name: '高级函数',
    formulas: [
      { name: 'JSON.parse(s)', desc: '解析JSON', template: 'JSON.parse({0})' },
      { name: 'JSON.stringify(o)', desc: '转JSON字符串', template: 'JSON.stringify({0})' },
      { name: 'typeof x', desc: '获取类型', template: 'typeof {0}' },
      { name: 'Array.isArray(x)', desc: '是否数组', template: 'Array.isArray({0})' },
      { name: 'Object.keys(o)', desc: '获取键数组', template: 'Object.keys({0})' },
      { name: 'Object.values(o)', desc: '获取值数组', template: 'Object.values({0})' },
      { name: 'Object.entries(o)', desc: '获取键值对', template: 'Object.entries({0})' },
      { name: 'Number(x)', desc: '转数字', template: 'Number({0})' },
      { name: 'String(x)', desc: '转字符串', template: 'String({0})' },
      { name: 'Boolean(x)', desc: '转布尔值', template: 'Boolean({0})' },
    ],
  },
])

// 过滤后的公式分类
const filteredFormulaCategories = computed(() => {
  if (!formulaSearch.value) return formulaCategories.value
  const search = formulaSearch.value.toLowerCase()
  return formulaCategories.value
    .map(category => ({
      ...category,
      formulas: category.formulas.filter(f =>
        f.name.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search)
      ),
    }))
    .filter(category => category.formulas.length > 0)
})

// 插入函数到公式
function insertFormulaFunction(func: FormulaItem) {
  insertAtCursor(func.template)
}

// 是否有配置
const hasLinkage = computed(() => {
  return conditionGroups.value.some(g => g.conditions.length > 0) ||
         linkageActions.value.length > 0 ||
         formulaCode.value.trim() !== ''
})

// 总条件数
const totalLinkages = computed(() => {
  const conditionCount = conditionGroups.value.reduce((sum, group) => sum + group.conditions.length, 0)
  const actionCount = linkageActions.value.length
  return conditionCount + actionCount
})

// 初始化
watch(() => props.modelValue, (val) => {
  if (val) {
    conditionGroups.value = val.conditionGroups || []
    linkageActions.value = val.actions || []
    formulaCode.value = val.formula || ''
    activeTab.value = val.type || 'linkage'
  }
}, { immediate: true })

// 判断是否为无值操作符
function isNoValueOperator(operator: string): boolean {
  return ['empty', 'notEmpty'].includes(operator)
}

// 切换公式组展开状态
function toggleFormulaGroup(group: string) {
  if (expandedFormulaGroups.value.has(group)) {
    expandedFormulaGroups.value.delete(group)
  } else {
    expandedFormulaGroups.value.add(group)
  }
  expandedFormulaGroups.value = new Set(expandedFormulaGroups.value)
}

// 插入字段到公式
function insertFormulaField(field: string) {
  const insertText = `formData['${field}']`
  insertAtCursor(insertText)
}

// 在光标位置插入文本
function insertAtCursor(text: string) {
  const textarea = formulaEditorRef.value?.$el?.querySelector('textarea')
  if (!textarea) {
    formulaCode.value += text
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = formulaCode.value

  formulaCode.value = value.substring(0, start) + text + value.substring(end)

  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + text.length, start + text.length)
  }, 0)
}

// 添加条件组
function addGroup() {
  conditionGroups.value.push({
    conditions: [{ field: '', operator: '==', value: '' }],
    relation: 'AND',
  })
}

// 添加条件
function addCondition() {
  if (conditionGroups.value.length === 0) {
    addGroup()
  } else {
    conditionGroups.value[0].conditions.push({
      field: '',
      operator: '==',
      value: '',
      relation: 'AND',
    })
  }
}

// 移除条件
function removeCondition(groupIndex: number, conditionIndex: number) {
  conditionGroups.value[groupIndex].conditions.splice(conditionIndex, 1)
  if (conditionGroups.value[groupIndex].conditions.length === 0) {
    conditionGroups.value.splice(groupIndex, 1)
  }
}

// 添加联动动作
function addAction() {
  linkageActions.value.push({
    type: 'setValue',
    targetField: '',
    actionValue: '',
  })
}

// 移除联动动作
function removeAction(index: number) {
  linkageActions.value.splice(index, 1)
}

// 清除配置
function clearLinkage() {
  conditionGroups.value = []
  linkageActions.value = []
  formulaCode.value = ''
  emitValue()
}

// 保存
function onSave() {
  emitValue()
  showModal.value = false
}

// 取消
function onCancel() {
  if (props.modelValue) {
    conditionGroups.value = props.modelValue.conditionGroups || []
    linkageActions.value = props.modelValue.actions || []
    formulaCode.value = props.modelValue.formula || ''
    activeTab.value = props.modelValue.type || 'linkage'
  }
  showModal.value = false
}

// 发送值
function emitValue() {
  const value: DataLinkageConfigValue = {
    type: activeTab.value as 'linkage' | 'formula',
    conditionGroups: conditionGroups.value,
    actions: linkageActions.value,
    formula: formulaCode.value,
  }
  emit('update:modelValue', value)
  emit('change', value)
}

// 初始化
if (!props.modelValue) {
  conditionGroups.value = [{ conditions: [{ field: '', operator: '==', value: '' }], relation: 'AND' }]
}
</script>

<style scoped lang="less">
.data-linkage-config {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
  }

  &__summary {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__empty {
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px dashed var(--border-color);
  }

  &__empty-text {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  &__modal {
    height: 100%;
    overflow: hidden;
  }

  &__linkage {
    padding: 12px 0;
  }

  // 条件区域
  &__condition-section {
    margin-bottom: 24px;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  &__section-icon {
    color: var(--primary-color);
  }

  &__condition-groups {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__condition-group {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 12px;
    background: var(--bg-secondary);
  }

  &__group-relation {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  &__conditions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__condition {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
  }

  &__condition-relation {
    width: 70px;
    flex-shrink: 0;
  }

  &__condition-fields {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  &__condition-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  // 联动动作区域
  &__action-section {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__action {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  &__action-label {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  // 公式 Tab
  &__formula {
    padding: 12px 0;
  }

  &__formula-layout {
    display: flex;
    gap: 16px;
    height: 400px;
  }

  &__formula-sidebar {
    width: 200px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
  }

  &__formula-search {
    border-bottom: 1px solid var(--border-color);
  }

  &__formula-group {
    border-bottom: 1px solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }
  }

  &__formula-group-title {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    background: var(--bg-secondary);

    &:hover {
      background: var(--bg-tertiary);
    }
  }

  &__formula-group-content {
    padding: 8px;
    overflow-y: auto;
    max-height: 200px;
  }

  &__formula-subgroup {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__formula-subgroup-title {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: all 0.2s;

    &:hover {
      color: var(--primary-color);
      background: var(--primary-light);
    }

    :deep(.anticon) {
      font-size: 9px;
    }
  }

  &__formula-subgroup-content {
    padding-left: 12px;
    margin-top: 4px;
  }

  &__formula-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--primary-light);
    }
  }

  &__formula-item-name {
    font-size: 12px;
    color: var(--text-primary);
    font-family: 'SF Mono', Monaco, Consolas, monospace;
  }

  &__formula-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  &__formula-editor-title {
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  &__formula-textarea {
    flex: 1;
    border: none;
    border-radius: 0;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 13px;
    resize: none;

    &:focus {
      box-shadow: none;
    }
  }
}
</style>
