<template>
  <div class="condition-config">
    <!-- 标题 -->
    <div class="condition-config__header">
      <span class="condition-config__title">{{ title }}</span>
      <a-button size="small" type="link" @click="showModal = true">
        <template #icon><SettingOutlined /></template>
        配置条件
      </a-button>
    </div>

    <!-- 已配置条件摘要 -->
    <div v-if="hasConditions" class="condition-config__summary">
      <a-tag color="blue" size="small">
        <template #icon><CheckCircleOutlined /></template>
        已配置 {{ totalConditions }} 个条件
      </a-tag>
      <a-button size="small" type="link" danger @click="clearConditions">
        清除
      </a-button>
    </div>
    <div v-else class="condition-config__empty">
      <span class="condition-config__empty-text">未配置条件</span>
    </div>

    <!-- 条件配置弹窗 -->
    <a-modal
      v-model:open="showModal"
      :title="title"
      width="700px"
      :body-style="{ height: '500px', overflow: 'auto' }"
      @ok="onSave"
      @cancel="onCancel"
    >
      <div class="condition-config__modal">
        <!-- Tab 切换 -->
        <a-tabs v-model:activeKey="activeTab" size="small">
          <!-- 逻辑条件 Tab -->
          <a-tab-pane key="logic" tab="逻辑条件">
            <div class="condition-config__logic">
              <!-- 条件组列表 -->
              <div
                v-for="(group, groupIndex) in conditionGroups"
                :key="groupIndex"
                class="condition-config__group"
              >
                <!-- 组间逻辑关系 -->
                <div v-if="groupIndex > 0" class="condition-config__group-relation">
                  <a-select
                    v-model:value="group.relation"
                    size="small"
                    style="width: 80px"
                  >
                    <a-select-option value="AND">AND</a-select-option>
                    <a-select-option value="OR">OR</a-select-option>
                  </a-select>
                </div>

                <!-- 条件组标题 -->
                <div class="condition-config__group-header">
                  <span class="condition-config__group-title">条件组 {{ groupIndex + 1 }}</span>
                  <a-button
                    v-if="conditionGroups.length > 1"
                    size="small"
                    type="text"
                    danger
                    @click="removeGroup(groupIndex)"
                  >
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </div>

                <!-- 条件列表 -->
                <div class="condition-config__conditions">
                  <div
                    v-for="(condition, conditionIndex) in group.conditions"
                    :key="conditionIndex"
                    class="condition-config__condition"
                  >
                    <!-- 组内逻辑关系 -->
                    <div v-if="conditionIndex > 0" class="condition-config__condition-relation">
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
                    <div class="condition-config__condition-fields">
                      <!-- 字段选择 -->
                      <a-select
                        v-model:value="condition.field"
                        placeholder="选择字段"
                        size="small"
                        show-search
                        style="width: 150px"
                        @change="onFieldChange(condition)"
                      >
                        <a-select-option v-for="field in availableFields" :key="field.value" :value="field.value">
                          {{ field.label }}
                        </a-select-option>
                      </a-select>

                      <!-- 操作符选择 -->
                      <a-select
                        v-model:value="condition.operator"
                        placeholder="选择条件"
                        size="small"
                        style="width: 130px"
                        @change="onOperatorChange(condition)"
                      >
                        <a-select-option v-for="op in operators" :key="op.value" :value="op.value">
                          {{ op.label }}
                        </a-select-option>
                      </a-select>

                      <!-- 值输入 -->
                      <a-input
                        v-if="!isNoValueOperator(condition.operator)"
                        v-model:value="condition.value"
                        placeholder="请输入值"
                        size="small"
                        style="width: 150px"
                      />

                      <!-- 删除按钮 -->
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

                  <!-- 添加条件按钮 -->
                  <a-button
                    size="small"
                    type="dashed"
                    block
                    @click="addCondition(groupIndex)"
                  >
                    <template #icon><PlusOutlined /></template>
                    添加条件
                  </a-button>
                </div>
              </div>

              <!-- 添加条件组按钮 -->
              <a-button
                size="small"
                type="dashed"
                block
                @click="addGroup"
                style="margin-top: 12px"
              >
                <template #icon><PlusOutlined /></template>
                添加条件组
              </a-button>

              <!-- 条件成立后组件状态 -->
              <div class="condition-config__state-section">
                <div class="condition-config__state-title">
                  <span class="condition-config__state-icon">
                    <SettingOutlined />
                  </span>
                  条件成立后组件状态
                </div>
                <div class="condition-config__state-options">
                  <!-- 可见性 -->
                  <div v-if="showVisibility" class="condition-config__state-group">
                    <div class="condition-config__state-label">可见性</div>
                    <a-radio-group v-model:value="visibilityState" size="small" @change="onStateChange">
                      <a-radio-button value="visible">
                        <EyeOutlined /> 显示
                      </a-radio-button>
                      <a-radio-button value="hidden">
                        <EyeInvisibleOutlined /> 隐藏
                      </a-radio-button>
                    </a-radio-group>
                  </div>

                  <!-- 可用性 -->
                  <div v-if="showAvailability" class="condition-config__state-group">
                    <div class="condition-config__state-label">可用性</div>
                    <a-radio-group v-model:value="availabilityState" size="small" @change="onStateChange">
                      <a-radio-button value="enabled">
                        <CheckCircleOutlined /> 启用
                      </a-radio-button>
                      <a-radio-button value="disabled">
                        <StopOutlined /> 禁用
                      </a-radio-button>
                      <a-radio-button value="readonly">
                        <LockOutlined /> 只读
                      </a-radio-button>
                    </a-radio-group>
                  </div>

                  <!-- 必填性 -->
                  <div v-if="showRequired" class="condition-config__state-group">
                    <div class="condition-config__state-label">必填性</div>
                    <a-radio-group v-model:value="requiredState" size="small" @change="onStateChange">
                      <a-radio-button value="required">
                        <ExclamationCircleOutlined /> 必填
                      </a-radio-button>
                      <a-radio-button value="optional">
                        非必填
                      </a-radio-button>
                    </a-radio-group>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <!-- 计算公式 Tab -->
          <a-tab-pane key="formula" tab="计算公式">
            <div class="condition-config__formula">
              <div class="condition-config__formula-layout">
                <!-- 左侧：可用字段和函数 -->
                <div class="condition-config__formula-sidebar">
                  <!-- 搜索框 -->
                  <a-input
                    v-model:value="formulaSearch"
                    placeholder="输入关键字搜索"
                    size="small"
                    class="condition-config__formula-search"
                  >
                    <template #prefix><SearchOutlined /></template>
                  </a-input>

                  <!-- 当前表单字段 -->
                  <div class="condition-config__formula-group">
                    <div class="condition-config__formula-group-title" @click="toggleFormulaGroup('formFields')">
                      <span v-if="expandedFormulaGroups.has('formFields')"><DownOutlined /></span>
                      <span v-else><RightOutlined /></span>
                      当前表单
                    </div>
                    <div v-if="expandedFormulaGroups.has('formFields')" class="condition-config__formula-group-content">
                      <div
                        v-for="field in filteredFormFields"
                        :key="field.value"
                        class="condition-config__formula-item"
                        @click="insertFormulaField(field.value)"
                      >
                        <span class="condition-config__formula-item-name">{{ field.label }}</span>
                        <a-tag size="small" color="blue">ID</a-tag>
                      </div>
                    </div>
                  </div>

                  <!-- 函数公式 -->
                  <div class="condition-config__formula-group">
                    <div class="condition-config__formula-group-title" @click="toggleFormulaGroup('functions')">
                      <span v-if="expandedFormulaGroups.has('functions')"><DownOutlined /></span>
                      <span v-else><RightOutlined /></span>
                      函数公式
                    </div>
                    <div v-if="expandedFormulaGroups.has('functions')" class="condition-config__formula-group-content">
                      <div
                        v-for="category in filteredFormulaCategories"
                        :key="category.key"
                        class="condition-config__formula-subgroup"
                      >
                        <div class="condition-config__formula-subgroup-title" @click.stop="toggleFormulaGroup(category.key)">
                          <span v-if="expandedFormulaGroups.has(category.key)"><DownOutlined /></span>
                          <span v-else><RightOutlined /></span>
                          {{ category.name }}
                        </div>
                        <div v-if="expandedFormulaGroups.has(category.key)" class="condition-config__formula-subgroup-content">
                          <div
                            v-for="func in category.formulas"
                            :key="func.name"
                            class="condition-config__formula-item"
                            @click="insertFormulaFunction(func)"
                          >
                            <span class="condition-config__formula-item-name">{{ func.name }}</span>
                            <span class="condition-config__formula-item-desc">{{ func.desc }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 右侧：公式编辑器 -->
                <div class="condition-config__formula-editor">
                  <div class="condition-config__formula-editor-title">设置组件的隐藏条件</div>
                  <a-textarea
                    ref="formulaEditorRef"
                    v-model:value="formulaCode"
                    placeholder="例如: formData.status === 'hidden' && formData.type === 'custom'"
                    :rows="8"
                    class="condition-config__formula-textarea"
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
  CheckCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  StopOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'

export interface Condition {
  field: string
  operator: string
  value: string
  relation?: 'AND' | 'OR'
}

export interface ConditionGroup {
  conditions: Condition[]
  relation: 'AND' | 'OR'
}

export type VisibilityState = 'visible' | 'hidden'
export type AvailabilityState = 'enabled' | 'disabled' | 'readonly'
export type RequiredState = 'required' | 'optional'

export interface ConditionConfigValue {
  type: 'logic' | 'formula'
  groups: ConditionGroup[]
  formula: string
  visibilityState?: VisibilityState
  availabilityState?: AvailabilityState
  requiredState?: RequiredState
}

const props = withDefaults(defineProps<{
  title: string
  modelValue?: ConditionConfigValue
  showVisibility?: boolean
  showAvailability?: boolean
  showRequired?: boolean
}>(), {
  showVisibility: true,
  showAvailability: true,
  showRequired: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: ConditionConfigValue]
  change: [value: ConditionConfigValue]
}>()

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 弹窗状态
const showModal = ref(false)
const activeTab = ref('logic')

// 条件数据
const conditionGroups = ref<ConditionGroup[]>([])
const formulaCode = ref('')
const visibilityState = ref<VisibilityState>('visible')
const availabilityState = ref<AvailabilityState>('enabled')
const requiredState = ref<RequiredState>('optional')

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

// 公式编辑器相关
const formulaSearch = ref('')
const formulaEditorRef = ref()
const expandedFormulaGroups = ref<Set<string>>(new Set(['formFields']))

// 公式注册表
export interface FormulaItem {
  name: string
  desc: string
  template: string
  category: string
}

export interface FormulaCategory {
  key: string
  name: string
  icon?: string
  formulas: FormulaItem[]
}

// 默认公式分类
const defaultFormulaCategories: FormulaCategory[] = [
  {
    key: 'number',
    name: '数字处理',
    formulas: [
      { name: 'abs(x)', desc: '绝对值', template: 'Math.abs({0})', category: 'number' },
      { name: 'ceil(x)', desc: '向上取整', template: 'Math.ceil({0})', category: 'number' },
      { name: 'floor(x)', desc: '向下取整', template: 'Math.floor({0})', category: 'number' },
      { name: 'round(x)', desc: '四舍五入', template: 'Math.round({0})', category: 'number' },
      { name: 'max(a, b)', desc: '最大值', template: 'Math.max({0}, {1})', category: 'number' },
      { name: 'min(a, b)', desc: '最小值', template: 'Math.min({0}, {1})', category: 'number' },
      { name: 'parseInt(x)', desc: '转整数', template: 'parseInt({0})', category: 'number' },
      { name: 'parseFloat(x)', desc: '转浮点数', template: 'parseFloat({0})', category: 'number' },
    ],
  },
  {
    key: 'string',
    name: '文本处理',
    formulas: [
      { name: 'length', desc: '字符串长度', template: '{0}.length', category: 'string' },
      { name: 'toUpperCase()', desc: '转大写', template: '{0}.toUpperCase()', category: 'string' },
      { name: 'toLowerCase()', desc: '转小写', template: '{0}.toLowerCase()', category: 'string' },
      { name: 'trim()', desc: '去除空格', template: '{0}.trim()', category: 'string' },
      { name: 'includes(s)', desc: '包含', template: '{0}.includes({1})', category: 'string' },
      { name: 'startsWith(s)', desc: '以...开头', template: '{0}.startsWith({1})', category: 'string' },
      { name: 'endsWith(s)', desc: '以...结尾', template: '{0}.endsWith({1})', category: 'string' },
      { name: 'replace(a, b)', desc: '替换', template: '{0}.replace({1}, {2})', category: 'string' },
      { name: 'substr(start, len)', desc: '截取子串', template: '{0}.substr({1}, {2})', category: 'string' },
      { name: 'split(s)', desc: '分割字符串', template: '{0}.split({1})', category: 'string' },
      { name: 'join(s)', desc: '数组连接', template: '{0}.join({1})', category: 'string' },
    ],
  },
  {
    key: 'date',
    name: '日期处理',
    formulas: [
      { name: 'new Date()', desc: '当前日期', template: 'new Date()', category: 'date' },
      { name: 'now()', desc: '当前时间戳', template: 'Date.now()', category: 'date' },
      { name: 'getFullYear()', desc: '获取年份', template: 'new Date().getFullYear()', category: 'date' },
      { name: 'getMonth()', desc: '获取月份', template: 'new Date().getMonth() + 1', category: 'date' },
      { name: 'getDate()', desc: '获取日期', template: 'new Date().getDate()', category: 'date' },
      { name: 'getDay()', desc: '获取星期', template: 'new Date().getDay()', category: 'date' },
      { name: 'getHours()', desc: '获取小时', template: 'new Date().getHours()', category: 'date' },
      { name: 'getMinutes()', desc: '获取分钟', template: 'new Date().getMinutes()', category: 'date' },
      { name: 'getSeconds()', desc: '获取秒', template: 'new Date().getSeconds()', category: 'date' },
      { name: 'toISOString()', desc: '转ISO格式', template: 'new Date().toISOString()', category: 'date' },
      { name: 'toLocaleDateString()', desc: '本地日期', template: 'new Date().toLocaleDateString()', category: 'date' },
    ],
  },
  {
    key: 'logic',
    name: '逻辑处理',
    formulas: [
      { name: 'AND', desc: '逻辑与', template: '{0} && {1}', category: 'logic' },
      { name: 'OR', desc: '逻辑或', template: '{0} || {1}', category: 'logic' },
      { name: 'NOT', desc: '逻辑非', template: '!{0}', category: 'logic' },
      { name: 'if(c, a, b)', desc: '条件判断', template: '{0} ? {1} : {2}', category: 'logic' },
      { name: 'isEmpty', desc: '是否为空', template: '!{0}', category: 'logic' },
      { name: 'isNotEmpty', desc: '是否不为空', template: '!!{0}', category: 'logic' },
      { name: 'equal(a, b)', desc: '是否相等', template: '{0} === {1}', category: 'logic' },
      { name: 'notEqual(a, b)', desc: '是否不等', template: '{0} !== {1}', category: 'logic' },
      { name: 'greater(a, b)', desc: '大于', template: '{0} > {1}', category: 'logic' },
      { name: 'less(a, b)', desc: '小于', template: '{0} < {1}', category: 'logic' },
    ],
  },
  {
    key: 'collection',
    name: '合集处理',
    formulas: [
      { name: 'length', desc: '数组长度', template: '{0}.length', category: 'collection' },
      { name: 'includes(item)', desc: '包含元素', template: '{0}.includes({1})', category: 'collection' },
      { name: 'indexOf(item)', desc: '元素索引', template: '{0}.indexOf({1})', category: 'collection' },
      { name: 'filter(fn)', desc: '过滤', template: '{0}.filter(item => {1})', category: 'collection' },
      { name: 'map(fn)', desc: '映射', template: '{0}.map(item => {1})', category: 'collection' },
      { name: 'reduce(fn)', desc: '归约', template: '{0}.reduce((acc, item) => {1}, 0)', category: 'collection' },
      { name: 'find(fn)', desc: '查找', template: '{0}.find(item => {1})', category: 'collection' },
      { name: 'some(fn)', desc: '存在', template: '{0}.some(item => {1})', category: 'collection' },
      { name: 'every(fn)', desc: '全部满足', template: '{0}.every(item => {1})', category: 'collection' },
      { name: 'flat()', desc: '扁平化', template: '{0}.flat()', category: 'collection' },
    ],
  },
  {
    key: 'advanced',
    name: '高级函数',
    formulas: [
      { name: 'JSON.parse(s)', desc: '解析JSON', template: 'JSON.parse({0})', category: 'advanced' },
      { name: 'JSON.stringify(o)', desc: '转JSON字符串', template: 'JSON.stringify({0})', category: 'advanced' },
      { name: 'typeof x', desc: '获取类型', template: 'typeof {0}', category: 'advanced' },
      { name: 'Array.isArray(x)', desc: '是否数组', template: 'Array.isArray({0})', category: 'advanced' },
      { name: 'Object.keys(o)', desc: '获取键数组', template: 'Object.keys({0})', category: 'advanced' },
      { name: 'Object.values(o)', desc: '获取值数组', template: 'Object.values({0})', category: 'advanced' },
      { name: 'Object.entries(o)', desc: '获取键值对', template: 'Object.entries({0})', category: 'advanced' },
      { name: 'Number(x)', desc: '转数字', template: 'Number({0})', category: 'advanced' },
      { name: 'String(x)', desc: '转字符串', template: 'String({0})', category: 'advanced' },
      { name: 'Boolean(x)', desc: '转布尔值', template: 'Boolean({0})', category: 'advanced' },
    ],
  },
]

// 公式分类列表（支持动态注册）
const formulaCategories = ref<FormulaCategory[]>([...defaultFormulaCategories])

// 可用字段列表
const availableFields = computed(() => {
  const properties = schemaStore.root.properties || {}
  return Object.entries(properties).map(([key, node]) => ({
    value: key,
    label: node.title || key,
  }))
})

// 是否有配置条件
const hasConditions = computed(() => {
  return conditionGroups.value.length > 0 && conditionGroups.value.some(g => g.conditions.length > 0)
})

// 总条件数
const totalConditions = computed(() => {
  return conditionGroups.value.reduce((sum, group) => sum + group.conditions.length, 0)
})

// 过滤后的表单字段
const filteredFormFields = computed(() => {
  if (!formulaSearch.value) return availableFields.value
  const search = formulaSearch.value.toLowerCase()
  return availableFields.value.filter(field =>
    field.label.toLowerCase().includes(search) || field.value.toLowerCase().includes(search)
  )
})

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

// 注册公式分类
function registerFormulaCategory(category: FormulaCategory) {
  const existingIndex = formulaCategories.value.findIndex(c => c.key === category.key)
  if (existingIndex >= 0) {
    // 合并公式
    const existing = formulaCategories.value[existingIndex]
    const newFormulas = category.formulas.filter(
      f => !existing.formulas.some(ef => ef.name === f.name)
    )
    existing.formulas.push(...newFormulas)
  } else {
    formulaCategories.value.push(category)
  }
}

// 注册单个公式
function registerFormula(categoryKey: string, formula: FormulaItem) {
  const category = formulaCategories.value.find(c => c.key === categoryKey)
  if (category) {
    const existingIndex = category.formulas.findIndex(f => f.name === formula.name)
    if (existingIndex >= 0) {
      category.formulas[existingIndex] = formula
    } else {
      category.formulas.push(formula)
    }
  }
}

// 暴露注册方法给父组件
defineExpose({
  registerFormulaCategory,
  registerFormula,
})

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

// 插入函数到公式
function insertFormulaFunction(func: { name: string; template: string }) {
  insertAtCursor(func.template)
}

// 在光标位置插入文本
function insertAtCursor(text: string) {
  const textarea = formulaEditorRef.value?.$el?.querySelector('textarea')
  if (!textarea) {
    // 如果找不到textarea，直接追加
    formulaCode.value += text
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = formulaCode.value

  formulaCode.value = value.substring(0, start) + text + value.substring(end)

  // 设置光标位置
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + text.length, start + text.length)
  }, 0)
}

// 初始化
watch(() => props.modelValue, (val) => {
  if (val) {
    conditionGroups.value = val.groups || []
    formulaCode.value = val.formula || ''
    activeTab.value = val.type || 'logic'
    visibilityState.value = val.visibilityState || 'visible'
    availabilityState.value = val.availabilityState || 'enabled'
    requiredState.value = val.requiredState || 'optional'
  }
}, { immediate: true })

// 判断是否为无值操作符
function isNoValueOperator(operator: string): boolean {
  return ['empty', 'notEmpty'].includes(operator)
}

// 添加条件组
function addGroup() {
  conditionGroups.value.push({
    conditions: [{ field: '', operator: '==', value: '' }],
    relation: 'AND',
  })
}

// 移除条件组
function removeGroup(groupIndex: number) {
  conditionGroups.value.splice(groupIndex, 1)
}

// 添加条件
function addCondition(groupIndex: number) {
  conditionGroups.value[groupIndex].conditions.push({
    field: '',
    operator: '==',
    value: '',
    relation: 'AND',
  })
}

// 移除条件
function removeCondition(groupIndex: number, conditionIndex: number) {
  conditionGroups.value[groupIndex].conditions.splice(conditionIndex, 1)
  if (conditionGroups.value[groupIndex].conditions.length === 0) {
    removeGroup(groupIndex)
  }
}

// 字段变化
function onFieldChange(condition: Condition) {
  condition.value = ''
}

// 操作符变化
function onOperatorChange(condition: Condition) {
  if (isNoValueOperator(condition.operator)) {
    condition.value = ''
  }
}

// 清除条件
function clearConditions() {
  conditionGroups.value = []
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
  // 恢复原始值
  if (props.modelValue) {
    conditionGroups.value = props.modelValue.groups || []
    formulaCode.value = props.modelValue.formula || ''
    activeTab.value = props.modelValue.type || 'logic'
  }
  showModal.value = false
}

// 发送值
function emitValue() {
  const value: ConditionConfigValue = {
    type: activeTab.value as 'logic' | 'formula',
    groups: conditionGroups.value,
    formula: formulaCode.value,
    visibilityState: visibilityState.value,
    availabilityState: availabilityState.value,
    requiredState: requiredState.value,
  }
  emit('update:modelValue', value)
  emit('change', value)
}

// 状态变化
function onStateChange() {
  emitValue()
}

// 初始化
if (!props.modelValue) {
  conditionGroups.value = [{ conditions: [{ field: '', operator: '==', value: '' }], relation: 'AND' }]
}
</script>

<style scoped lang="less">
.condition-config {
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

  &__logic {
    padding: 12px 0;
    max-height: 300px;
    overflow-y: auto;
  }

  &__group {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 14px;
    margin-bottom: 12px;
    background: var(--bg-secondary);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__group-relation {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  &__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__group-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
  }

  &__conditions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__condition {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }

  &__condition-relation {
    width: 70px;
    flex-shrink: 0;
  }

  &__condition-fields {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  &__formula {
    padding: 12px 0;
  }

  &__formula-layout {
    display: flex;
    gap: 16px;
    height: 400px;
  }

  &__formula-sidebar {
    width: 220px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--bg-primary);
  }

  &__formula-search {
    border-bottom: 1px solid var(--border-color);

    :deep(.ant-input) {
      border-radius: 0;
      border: none;
    }
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
    gap: 8px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    background: var(--bg-secondary);
    transition: background 0.2s;

    &:hover {
      background: var(--bg-tertiary);
    }

    :deep(.anticon) {
      font-size: 10px;
      color: var(--text-tertiary);
    }
  }

  &__formula-group-content {
    padding: 8px;
    overflow-y: auto;
    max-height: 200px;
    background: var(--bg-primary);
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
    padding: 7px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--primary-light);
      transform: translateX(2px);
    }
  }

  &__formula-item-name {
    font-size: 12px;
    color: var(--text-primary);
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-weight: 500;
  }

  &__formula-item-desc {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  &__formula-editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;
    background: var(--bg-primary);
  }

  &__formula-editor-title {
    padding: 10px 14px;
    font-size: 13px;
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
    line-height: 1.6;
    resize: none;
    padding: 12px 14px;

    &:focus {
      box-shadow: none;
    }

    &::placeholder {
      color: var(--text-tertiary);
    }
  }

  &__state-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  &__state-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 14px;
  }

  &__state-icon {
    color: var(--primary-color);
    font-size: 14px;
  }

  &__state-options {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__state-group {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  &__state-label {
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 50px;
    font-weight: 500;
  }
}
</style>
