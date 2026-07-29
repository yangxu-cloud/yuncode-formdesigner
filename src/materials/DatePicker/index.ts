import type { MaterialDescriptor } from '@/types'
import { CalendarOutlined } from '@ant-design/icons-vue'

export const DatePickerMaterial: MaterialDescriptor = {
  name: 'DatePicker',
  label: '日期',
  group: '常规',
  order: 7,
  icon: CalendarOutlined,
  schema: {
    type: 'string',
    title: '日期',
    'x-decorator': 'FormItem',
    'x-component': 'DatePicker',
    'x-component-props': {
      placeholder: '请选择日期',
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
        {
          name: 'x-component-props.format',
          label: '日期格式',
          type: 'Select',
          options: [
            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
            { label: 'YYYY-MM-DD HH:mm', value: 'YYYY-MM-DD HH:mm' },
            { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
          ],
        },
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
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
