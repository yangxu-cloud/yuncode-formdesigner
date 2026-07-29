import type { MaterialDescriptor } from '@/types'

export const GroupMaterial: MaterialDescriptor = {
  name: 'Group',
  label: '分组',
  group: '布局',
  order: 1,
  schema: {
    type: 'object',
    title: '分组',
    'x-decorator': 'Card',
    'x-component': 'Card',
    'x-component-props': {
      title: '分组标题',
      bordered: false,
    },
  },
  propsConfig: [
    {
      group: '基础',
      items: [
        { name: 'title', label: '标题', type: 'Input' },
        { name: 'x-component-props.title', label: '卡片标题', type: 'Input' },
      ],
    },
    {
      group: '布局',
      items: [
        {
          name: 'x-span',
          label: '宽度',
          type: 'Select',
          options: [
            { label: '1/4', value: 1 },
            { label: '1/2', value: 2 },
            { label: '3/4', value: 3 },
            { label: '1', value: 4 },
          ],
        },
      ],
    },
  ],
}
