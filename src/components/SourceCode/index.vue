<template>
  <a-modal
    v-model:open="visible"
    title="查看源码"
    width="800px"
    :footer="null"
    @cancel="onClose"
  >
    <div class="source-code">
      <div class="source-code__tabs">
        <a-radio-group v-model:value="activeTab" size="small">
          <a-radio-button value="vue">Vue 组件</a-radio-button>
          <a-radio-button value="json">JSON Schema</a-radio-button>
        </a-radio-group>
        <a-button size="small" @click="onCopy">
          <CopyOutlined /> 复制
        </a-button>
      </div>

      <pre class="source-code__pre"><code>{{ activeTab === 'vue' ? vueCode : jsonCode }}</code></pre>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import type { FormilySchema } from '@/types'

const props = defineProps<{
  open: boolean
  schema: FormilySchema
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const activeTab = ref('vue')

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const jsonCode = computed(() => {
  return JSON.stringify(props.schema, null, 2)
})

const vueCode = computed(() => {
  if (!props.schema.properties) return '<template>\n  <a-form></a-form>\n</template>'

  const entries = Object.entries(props.schema.properties)
  if (entries.length === 0) return '<template>\n  <a-form></a-form>\n</template>'

  // 按行分组
  const rows = new Map<number, Array<{ key: string; node: FormilySchema }>>()
  for (const [key, node] of entries) {
    const row = node['x-row'] ?? 1
    if (!rows.has(row)) rows.set(row, [])
    rows.get(row)!.push({ key, node })
  }

  // 生成模板
  const templateLines: string[] = ['<template>', '  <a-form layout="horizontal">']

  const sortedRows = [...rows.keys()].sort((a, b) => a - b)
  for (const rowNum of sortedRows) {
    const rowItems = rows.get(rowNum)!
    rowItems.sort((a, b) => (a.node['x-col'] ?? 1) - (b.node['x-col'] ?? 1))

    const span = rowItems.length
    const colSpan = span === 1 ? 24 : span === 2 ? 12 : span === 3 ? 8 : 6

    templateLines.push(`    <!-- 第 ${rowNum} 行 -->`)
    templateLines.push(`    <a-row :gutter="16">`)

    for (const item of rowItems) {
      const node = item.node
      const componentName = node['x-component']
      const title = node.title || componentName
      const required = node.required ? ' :rules="[{ required: true }]"' : ''
      const placeholder = node['x-component-props']?.placeholder || ''
      const disabled = node['x-component-props']?.disabled ? ' disabled' : ''
      const readOnly = node['x-component-props']?.readOnly ? ' read-only' : ''
      const allowClear = node['x-component-props']?.allowClear ? ' allow-clear' : ''
      const labelPlacement = node['x-label-placement'] || 'left'
      const labelCol = labelPlacement === 'left' ? ' :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }"' : ''

      templateLines.push(`      <a-col :span="${colSpan}">`)
      templateLines.push(`        <a-form-item label="${title}"${required}${labelCol}>`)

      if (componentName === 'Input') {
        templateLines.push(`          <a-input placeholder="${placeholder}" v-model="formData.${item.key}"${disabled}${readOnly}${allowClear} />`)
      } else if (componentName === 'TextArea') {
        templateLines.push(`          <a-textarea placeholder="${placeholder}" v-model="formData.${item.key}" :rows="${node['x-component-props']?.rows || 3}"${disabled}${readOnly}${allowClear} />`)
      } else if (componentName === 'NumberPicker') {
        templateLines.push(`          <a-input-number placeholder="${placeholder}" v-model="formData.${item.key}" style="width: 100%"${disabled}${readOnly} />`)
      } else if (componentName === 'Select') {
        templateLines.push(`          <a-select placeholder="${placeholder}" v-model="formData.${item.key}"${disabled}${allowClear} />`)
      } else if (componentName === 'DatePicker') {
        templateLines.push(`          <a-date-picker placeholder="${placeholder}" v-model="formData.${item.key}" style="width: 100%"${disabled} />`)
      } else if (componentName === 'Switch') {
        templateLines.push(`          <a-switch v-model:checked="formData.${item.key}"${disabled} />`)
      } else if (componentName === 'Radio.Group') {
        templateLines.push(`          <a-radio-group v-model="formData.${item.key}"${disabled} />`)
      } else if (componentName === 'Checkbox.Group') {
        templateLines.push(`          <a-checkbox-group v-model="formData.${item.key}"${disabled} />`)
      } else {
        templateLines.push(`          <!-- ${componentName} -->`)
        templateLines.push(`          <a-input v-model="formData.${item.key}"${disabled} />`)
      }

      templateLines.push(`        </a-form-item>`)
      templateLines.push(`      </a-col>`)
    }

    templateLines.push(`    </a-row>`)
  }

  templateLines.push('  </a-form>')
  templateLines.push('</template>')
  templateLines.push('')
  templateLines.push('<script setup lang="ts">')
  templateLines.push('import { reactive, computed } from \'vue\'')

  // 检查是否有自定义验证代码
  const hasValidationCode = entries.some(([, node]) => node['x-code-config']?.validationCode)
  if (hasValidationCode) {
    templateLines.push('')
    templateLines.push('// 自定义验证函数')
    templateLines.push('const validators: Record<string, (value: any, formData: Record<string, any>) => boolean | string> = {')
    for (const [key, node] of entries) {
      const validationCode = node['x-code-config']?.validationCode
      if (validationCode) {
        templateLines.push(`  ${key}: (value, formData) => {`)
        templateLines.push(`    ${validationCode.split('\n').join('\n    ')}`)
        templateLines.push('  },')
      }
    }
    templateLines.push('}')
  }

  templateLines.push('')
  templateLines.push('const formData = reactive({')

  for (const [key, node] of entries) {
    const defaultVal = node.default !== undefined ? JSON.stringify(node.default) : '\'\''
    templateLines.push(`  ${key}: ${defaultVal},`)
  }

  templateLines.push('})')

  // 添加验证规则
  if (hasValidationCode) {
    templateLines.push('')
    templateLines.push('const rules = {')
    for (const [key, node] of entries) {
      if (node['x-code-config']?.validationCode) {
        templateLines.push(`  ${key}: [{ validator: validators['${key}'] }],`)
      } else if (node.required) {
        templateLines.push(`  ${key}: [{ required: true, message: '请输入${node.title || key}' }],`)
      }
    }
    templateLines.push('}')
  }

  templateLines.push('<\/script>')

  return templateLines.join('\n')
})

function onCopy() {
  const code = activeTab.value === 'vue' ? vueCode.value : jsonCode.value
  navigator.clipboard.writeText(code).then(() => {
    message.success('已复制到剪贴板')
  }).catch(() => {
    console.log('[SourceCode]', code)
    message.info('已输出到控制台')
  })
}

function onClose() {
  emit('update:open', false)
}
</script>

<style scoped lang="less">
.source-code {
  &__tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__pre {
    background: #1e1e1e;
    border-radius: var(--radius-md);
    padding: 16px;
    overflow: auto;
    max-height: 500px;
    margin: 0;

    code {
      font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #d4d4d4;
      white-space: pre;
    }
  }
}
</style>
