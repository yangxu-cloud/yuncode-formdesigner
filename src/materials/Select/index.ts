import type { MaterialDescriptor } from '@/types'
import { CaretDownOutlined } from '@ant-design/icons-vue'

export const SelectMaterial: MaterialDescriptor = {
  name: 'Select',
  label: '下拉选择',
  group: '常规',
  order: 4,
  icon: CaretDownOutlined,
  schema: {
    type: 'string',
    title: '下拉选择',
    'x-decorator': 'FormItem',
    'x-component': 'Select',
    'x-component-props': {
      placeholder: '请选择',
      style: { width: '100%' },
    },
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'title', label: '标题', type: 'Input' },
        { name: 'x-component-props.placeholder', label: '提示信息', type: 'Input' },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
    {
      group: '属性配置',
      items: [
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.allowClear', label: '显示清除按钮', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
        { name: 'x-component-props.multiple', label: '多选', type: 'Switch' },
      ],
    },
    {
      group: '模式',
      items: [
        {
          name: 'x-pattern',
          label: '模式',
          type: 'Select',
          options: [
            { label: '可编辑', value: 'editable' },
            { label: '只读', value: 'readOnly' },
            { label: '禁用', value: 'disabled' },
            { label: '阅读态', value: 'readPretty' },
          ],
        },
        { name: 'x-visible', label: '可见', type: 'Switch' },
      ],
    },
  ],
}
