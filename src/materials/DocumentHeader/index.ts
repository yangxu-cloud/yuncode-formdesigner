import type { MaterialDescriptor } from '@/types'
import { FileTextOutlined } from '@ant-design/icons-vue'

export const DocumentHeaderMaterial: MaterialDescriptor = {
  name: 'DocumentHeader',
  label: '单据头',
  group: '布局',
  order: 4,
  icon: FileTextOutlined,
  isContainer: true,
  containerSlot: 'children',
  schema: {
    type: 'object',
    title: '',
    'x-component': 'Card',
    'x-component-props': {
      title: '单据头',
      bordered: false,
    },
    'x-label-placement': 'top',
    properties: {},
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.title', label: '标题', type: 'Input' },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
  ],
}
