import type { MaterialDescriptor } from '@/types'
import { StarOutlined } from '@ant-design/icons-vue'

export const RateMaterial: MaterialDescriptor = {
  name: 'Rate',
  label: '打分',
  group: '常规',
  order: 16,
  icon: StarOutlined,
  schema: {
    type: 'number',
    title: '打分',
    'x-decorator': 'FormItem',
    'x-component': 'Rate',
    'x-component-props': {
      count: 5,
      allowHalf: false,
    },
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'title', label: '标题', type: 'Input' },
        { name: 'x-span', label: '组件宽度', type: 'SpanSelect' },
      ],
    },
    {
      group: '属性配置',
      items: [
        { name: 'x-component-props.count', label: '总星数', type: 'NumberPicker', props: { min: 1, max: 10 } },
        { name: 'x-component-props.allowHalf', label: '允许半选', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
      ],
    },
  ],
}
