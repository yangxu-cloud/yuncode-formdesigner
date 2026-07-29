import type { MaterialDescriptor } from '@/types'
import { PhoneOutlined } from '@ant-design/icons-vue'

export const PhoneMaterial: MaterialDescriptor = {
  name: 'Phone',
  label: '手机号',
  group: '常规',
  order: 17,
  icon: PhoneOutlined,
  schema: {
    type: 'string',
    title: '手机号',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    'x-component-props': {
      placeholder: '请输入手机号',
      maxLength: 11,
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
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
        { name: 'x-component-props.readOnly', label: '是否只读', type: 'Switch' },
      ],
    },
  ],
}
