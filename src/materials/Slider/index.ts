import type { MaterialDescriptor } from '@/types'
import { SlidersOutlined } from '@ant-design/icons-vue'

export const SliderMaterial: MaterialDescriptor = {
  name: 'Slider',
  label: '滑杆',
  group: '常规',
  order: 15,
  icon: SlidersOutlined,
  schema: {
    type: 'number',
    title: '滑杆',
    'x-decorator': 'FormItem',
    'x-component': 'Slider',
    'x-component-props': {
      min: 0,
      max: 100,
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
        { name: 'x-component-props.min', label: '最小值', type: 'NumberPicker' },
        { name: 'x-component-props.max', label: '最大值', type: 'NumberPicker' },
        { name: 'x-component-props.step', label: '步长', type: 'NumberPicker', props: { min: 1 } },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
      ],
    },
  ],
}
