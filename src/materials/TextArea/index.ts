import type { MaterialDescriptor } from '@/types'
import { FileTextOutlined } from '@ant-design/icons-vue'

export const TextAreaMaterial: MaterialDescriptor = {
  name: 'TextArea',
  label: '多行输入',
  group: '常规',
  order: 2,
  icon: FileTextOutlined,
  schema: {
    type: 'string',
    title: '多行输入',
    'x-decorator': 'FormItem',
    'x-component': 'TextArea',
    'x-component-props': {
      placeholder: '请输入',
      rows: 3,
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
        { name: 'x-component-props.maxLength', label: '最大长度', type: 'NumberPicker', props: { min: 1, max: 9999 } },
        { name: 'x-component-props.rows', label: '显示行数', type: 'NumberPicker', props: { min: 1, max: 20 } },
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
        { name: 'x-component-props.readOnly', label: '是否只读', type: 'Switch' },
        { name: 'x-component-props.allowClear', label: '显示清除按钮', type: 'Switch' },
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
