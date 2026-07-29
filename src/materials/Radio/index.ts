import type { MaterialDescriptor } from '@/types'
import { CheckCircleOutlined } from '@ant-design/icons-vue'

export const RadioMaterial: MaterialDescriptor = {
  name: 'Radio.Group',
  label: '单选组',
  group: '常规',
  order: 5,
  icon: CheckCircleOutlined,
  schema: {
    type: 'string',
    title: '单选组',
    'x-decorator': 'FormItem',
    'x-component': 'Radio.Group',
    'x-component-props': {},
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
        { name: 'required', label: '是否必填', type: 'Switch' },
        { name: 'x-component-props.disabled', label: '是否禁用', type: 'Switch' },
        { name: 'x-component-props.readOnly', label: '是否只读', type: 'Switch' },
      ],
    },
    {
      group: '模式',
      items: [
        {
          name: 'x-pattern',
          label: '模式',
          type: 'Select',
          options: [
            { label: '可编辑', value: 'editable' },
            { label: '只读', value: 'readOnly' },
            { label: '禁用', value: 'disabled' },
            { label: '阅读态', value: 'readPretty' },
          ],
        },
        { name: 'x-visible', label: '可见', type: 'Switch' },
      ],
    },
  ],
}
