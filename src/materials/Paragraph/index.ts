import type { MaterialDescriptor } from '@/types'
import { FontSizeOutlined } from '@ant-design/icons-vue'

export const ParagraphMaterial: MaterialDescriptor = {
  name: 'Paragraph',
  label: '文字',
  group: '布局',
  order: 2,
  icon: FontSizeOutlined,
  schema: {
    type: 'object',
    title: '',
    'x-component': 'Paragraph',
    'x-component-props': {
      content: '这是一段文字内容',
    },
    'x-label-placement': 'top',
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.content', label: '文字内容', type: 'TextArea' },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
  ],
}
