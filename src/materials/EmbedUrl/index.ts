import type { MaterialDescriptor } from '@/types'
import { LinkOutlined } from '@ant-design/icons-vue'

export const EmbedUrlMaterial: MaterialDescriptor = {
  name: 'EmbedUrl',
  label: '嵌入URL',
  group: '布局',
  order: 9,
  icon: LinkOutlined,
  schema: {
    type: 'object',
    title: '',
    'x-component': 'EmbedUrl',
    'x-component-props': {
      url: '',
      height: 400,
    },
    'x-label-placement': 'top',
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.url', label: 'URL地址', type: 'Input' },
        { name: 'x-component-props.height', label: '高度', type: 'NumberPicker', props: { min: 100, max: 2000 } },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
  ],
}
