import type { MaterialDescriptor } from '@/types'

export const FormTabMaterial: MaterialDescriptor = {
  name: 'FormTab',
  label: '标签页',
  group: '布局',
  order: 2,
  isContainer: true,
  schema: {
    type: 'object',
    title: '标签页',
    'x-component': 'FormTab',
    properties: {
      tab1: {
        type: 'object',
        'x-component': 'FormTab.TabPane',
        'x-component-props': { tab: '标签1' },
        properties: {},
      },
    },
  },
  propsConfig: [
    {
      group: '基础',
      items: [],
    },
  ],
}
