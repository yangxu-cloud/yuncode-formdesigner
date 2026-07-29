import type { MaterialDescriptor } from '@/types'

export const FormGridMaterial: MaterialDescriptor = {
  name: 'FormGrid',
  label: '栅格布局',
  group: '布局',
  order: 1,
  isContainer: true,
  schema: {
    type: 'object',
    title: '栅格布局',
    'x-component': 'FormGrid',
    'x-component-props': {
      columns: 2,
    },
    properties: {
      col1: {
        type: 'object',
        'x-component': 'FormGrid.Column',
        properties: {},
      },
      col2: {
        type: 'object',
        'x-component': 'FormGrid.Column',
        properties: {},
      },
    },
  },
  propsConfig: [
    {
      group: '基础',
      items: [
        { name: 'x-component-props.columns', label: '列数', type: 'NumberPicker', props: { min: 1, max: 4 } },
      ],
    },
  ],
}
