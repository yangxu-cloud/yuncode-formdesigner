import type { MaterialDescriptor } from '@/types'
import { AppstoreOutlined } from '@ant-design/icons-vue'

export const LayoutContainerMaterial: MaterialDescriptor = {
  name: 'LayoutContainer',
  label: '布局容器',
  group: '布局',
  order: 8,
  icon: AppstoreOutlined,
  isContainer: true,
  containerSlot: 'children',
  schema: {
    type: 'object',
    title: '',
    'x-component': 'LayoutContainer',
    'x-component-props': {
      columns: 4,
      gap: 12,
    },
    'x-label-placement': 'top',
    properties: {},
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.columns', label: '列数', type: 'NumberPicker', props: { min: 1, max: 4 } },
        { name: 'x-component-props.gap', label: '间距', type: 'NumberPicker', props: { min: 0, max: 50 } },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
  ],
}
