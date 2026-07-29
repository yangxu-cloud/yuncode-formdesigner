import type { MaterialDescriptor } from '@/types'
import { FolderOutlined } from '@ant-design/icons-vue'

export const CollapseMaterial: MaterialDescriptor = {
  name: 'Collapse',
  label: '手风琴',
  group: '布局',
  order: 7,
  icon: FolderOutlined,
  isContainer: true,
  containerSlot: 'children',
  schema: {
    type: 'object',
    title: '',
    'x-component': 'Collapse',
    'x-component-props': {
      accordion: false,
    },
    'x-label-placement': 'top',
    properties: {},
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.accordion', label: '手风琴模式', type: 'Switch' },
        { name: 'x-component-props.bordered', label: '显示边框', type: 'Switch' },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
  ],
}
