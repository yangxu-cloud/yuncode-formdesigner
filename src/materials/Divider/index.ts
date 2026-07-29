import type { MaterialDescriptor } from '@/types'
import { LineOutlined } from '@ant-design/icons-vue'

export const DividerMaterial: MaterialDescriptor = {
  name: 'Divider',
  label: '分割线',
  group: '布局',
  order: 5,
  icon: LineOutlined,
  schema: {
    type: 'object',
    title: '',
    'x-component': 'Divider',
    'x-component-props': {},
    'x-label-placement': 'top',
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.type', label: '类型', type: 'Select', options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' },
        ]},
        { name: 'x-component-props.orientation', label: '文字位置', type: 'Select', options: [
          { label: '左', value: 'left' },
          { label: '右', value: 'right' },
          { label: '居中', value: 'center' },
        ]},
        { name: 'x-component-props.content', label: '分割线文字', type: 'Input' },
      ],
    },
  ],
}
