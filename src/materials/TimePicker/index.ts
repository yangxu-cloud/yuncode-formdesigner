import type { MaterialDescriptor } from '@/types'
import { ClockCircleOutlined } from '@ant-design/icons-vue'

export const TimePickerMaterial: MaterialDescriptor = {
  name: 'TimePicker',
  label: '时间',
  group: '常规',
  order: 10,
  icon: ClockCircleOutlined,
  schema: {
    type: 'string',
    title: '时间',
    'x-decorator': 'FormItem',
    'x-component': 'TimePicker',
    'x-component-props': {
      placeholder: '请选择时间',
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
        { name: 'x-component-props.format', label: '时间格式', type: 'Select', options: [
          { label: 'HH:mm:ss', value: 'HH:mm:ss' },
          { label: 'HH:mm', value: 'HH:mm' },
        ]},
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
      ],
    },
  ],
}
