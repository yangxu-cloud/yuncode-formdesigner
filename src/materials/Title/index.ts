import type { MaterialDescriptor } from '@/types'
import { FontSizeOutlined } from '@ant-design/icons-vue'

export const TitleMaterial: MaterialDescriptor = {
  name: 'Title',
  label: '标题',
  group: '布局',
  order: 1,
  icon: FontSizeOutlined,
  schema: {
    type: 'object',
    title: '',
    'x-component': 'Title',
    'x-component-props': {
      level: 4,
      content: '标题文字',
    },
    'x-label-placement': 'top',
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.content', label: '标题内容', type: 'Input' },
        { name: 'x-component-props.level', label: '标题级别', type: 'Select', options: [
          { label: 'H1', value: 1 },
          { label: 'H2', value: 2 },
          { label: 'H3', value: 3 },
          { label: 'H4', value: 4 },
          { label: 'H5', value: 5 },
        ]},
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
  ],
}
