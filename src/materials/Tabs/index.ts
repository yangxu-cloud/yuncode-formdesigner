import type { MaterialDescriptor } from '@/types'
import { TableOutlined } from '@ant-design/icons-vue'

export const TabsMaterial: MaterialDescriptor = {
  name: 'Tabs',
  label: '标签页',
  group: '布局',
  order: 6,
  icon: TableOutlined,
  isContainer: true,
  containerSlot: 'children',
  schema: {
    type: 'object',
    title: '',
    'x-component': 'Tabs',
    'x-component-props': {
      type: 'line',
    },
    'x-label-placement': 'top',
    properties: {
      tab1: {
        type: 'object',
        title: '标签页1',
        'x-component': 'TabPane',
        'x-component-props': {
          tab: '标签页1',
        },
        properties: {},
      },
    },
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'x-component-props.type', label: '类型', type: 'Select', options: [
          { label: '线条', value: 'line' },
          { label: '卡片', value: 'card' },
        ]},
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
    {
      group: '标签页配置',
      items: [
        { name: 'x-tabs-config', label: '标签页管理', type: 'TabsConfig' },
      ],
    },
  ],
}
