import type { MaterialDescriptor } from '@/types'
import { NumberOutlined } from '@ant-design/icons-vue'

export const InputNumberMaterial: MaterialDescriptor = {
  name: 'NumberPicker',
  label: '数值',
  group: '常规',
  order: 3,
  icon: NumberOutlined,
  schema: {
    type: 'number',
    title: '数值',
    'x-decorator': 'FormItem',
    'x-component': 'NumberPicker',
    'x-component-props': {
      placeholder: '请输入数值',
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
        { name: 'x-component-props.min', label: '最小值', type: 'NumberPicker' },
        { name: 'x-component-props.max', label: '最大值', type: 'NumberPicker' },
        { name: 'x-component-props.precision', label: '精度', type: 'NumberPicker', props: { min: 0, max: 10 } },
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
        { name: 'x-component-props.readOnly', label: '是否只读', type: 'Switch' },
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
