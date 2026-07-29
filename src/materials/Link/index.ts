import type { MaterialDescriptor } from '@/types'
import { LinkOutlined } from '@ant-design/icons-vue'

export const LinkMaterial: MaterialDescriptor = {
  name: 'Link',
  label: '链接',
  group: '常规',
  order: 19,
  icon: LinkOutlined,
  schema: {
    type: 'string',
    title: '链接',
    'x-decorator': 'FormItem',
    'x-component': 'Input',
    'x-component-props': {
      placeholder: '请输入链接地址',
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
      ],
    },
  ],
}
