import type { MaterialDescriptor } from '@/types'
import { UserOutlined } from '@ant-design/icons-vue'

export const ApplicantMaterial: MaterialDescriptor = {
  name: 'Applicant',
  label: '申请人',
  group: '布局',
  order: 3,
  icon: UserOutlined,
  schema: {
    type: 'object',
    title: '申请人',
    'x-component': 'Applicant',
    'x-component-props': {
      placeholder: '请选择申请人',
    },
  },
  propsConfig: [
    {
      group: '基础配置',
      items: [
        { name: 'title', label: '标题', type: 'Input' },
        { name: 'x-component-props.placeholder', label: '提示信息', type: 'Input' },
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
  ],
}
