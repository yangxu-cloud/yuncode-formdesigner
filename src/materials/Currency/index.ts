import type { MaterialDescriptor } from '@/types'
import { DollarOutlined } from '@ant-design/icons-vue'

export const CurrencyMaterial: MaterialDescriptor = {
  name: 'Currency',
  label: '货币',
  group: '常规',
  order: 5,
  icon: DollarOutlined,
  schema: {
    type: 'string',
    title: '货币',
    'x-decorator': 'FormItem',
    'x-component': 'InputNumber',
    'x-component-props': {
      placeholder: '请输入金额',
      precision: 2,
      prefix: '¥',
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
        { name: 'x-component-props.prefix', label: '前缀', type: 'Input' },
        { name: 'x-component-props.precision', label: '精度', type: 'NumberPicker', props: { min: 0, max: 10 } },
        { name: 'x-component-props.min', label: '最小值', type: 'NumberPicker' },
        { name: 'x-component-props.max', label: '最大值', type: 'NumberPicker' },
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
      ],
    },
  ],
}
