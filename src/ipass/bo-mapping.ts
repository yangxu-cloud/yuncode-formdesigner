import type { FormilySchema } from '@/types'
import { nanoid } from 'nanoid'

/** BO 字段类型 → Formily 组件映射 */
const boTypeMapping: Record<string, { type: FormilySchema['type']; xComponent: string }> = {
  STRING:  { type: 'string',  xComponent: 'Input' },
  TEXT:    { type: 'string',  xComponent: 'TextArea' },
  INTEGER: { type: 'number',  xComponent: 'NumberPicker' },
  DECIMAL: { type: 'number',  xComponent: 'NumberPicker' },
  DATE:    { type: 'string',  xComponent: 'DatePicker' },
  BOOLEAN: { type: 'boolean', xComponent: 'Switch' },
  ENUM:    { type: 'string',  xComponent: 'Select' },
  REF:     { type: 'string',  xComponent: 'Select' },
}

/** BO 字段元数据（接口预留） */
export interface BoFieldMeta {
  name: string
  label: string
  type: string
  required?: boolean
  length?: number
  precision?: number
  enumValues?: { label: string; value: string }[]
}

/** 单个 BO 字段 → Schema 节点 */
export function boFieldToSchema(field: BoFieldMeta): FormilySchema {
  const mapping = boTypeMapping[field.type] || boTypeMapping.STRING
  const node: FormilySchema = {
    name: field.name,
    type: mapping.type,
    title: field.label,
    required: field.required,
    'x-decorator': 'FormItem',
    'x-component': mapping.xComponent,
    'x-component-props': {},
    'x-ipass': {
      boName: '',
      fieldName: field.name,
      fieldType: field.type,
    },
  }

  // 枚举值注入 options
  if (field.enumValues && mapping.xComponent === 'Select') {
    node['x-component-props']!.options = field.enumValues
  }

  return node
}

/** BO 全部字段 → Schema properties */
export function boFieldsToSchema(fields: BoFieldMeta[]): Record<string, FormilySchema> {
  const properties: Record<string, FormilySchema> = {}
  for (const field of fields) {
    properties[field.name] = boFieldToSchema(field)
  }
  return properties
}
