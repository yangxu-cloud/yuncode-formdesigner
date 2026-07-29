import type { MaterialDescriptor } from '@/types'
import { EditOutlined } from '@ant-design/icons-vue'

export const InputMaterial: MaterialDescriptor = {
  name: 'Input',
  label: '单行输入',
  group: '常规',
  order: 1,
  icon: EditOutlined,
  schema: {
    type: 'string',
    title: '单行输入',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    'x-component-props': {
      placeholder: '请输入',
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
        { name: 'x-component-props.type', label: '类型', type: 'Select', options: [
          { label: '文本', value: 'text' },
          { label: '密码', value: 'password' },
          { label: '数字', value: 'number' },
          { label: '邮箱', value: 'email' },
          { label: '电话', value: 'tel' },
          { label: '网址', value: 'url' },
        ]},
        { name: 'x-component-props.maxLength', label: '最大长度', type: 'NumberPicker', props: { min: 1, max: 9999 } },
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
