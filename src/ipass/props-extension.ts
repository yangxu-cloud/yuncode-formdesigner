import type { PropsConfigGroup } from '@/types'
import { registry } from '@/engine/registry'

/**
 * BO 绑定属性组（已废弃）
 * BO 绑定信息已在数据源面板中体现，不再注入到属性面板
 */
// const boPropsGroup: PropsConfigGroup = {
//   group: 'BO绑定',
//   injectBy: 'ipass-adapter',
//   items: [
//     { name: 'x-ipass.boName', label: 'BO名称', type: 'Input' },
//     { name: 'x-ipass.fieldName', label: '字段名', type: 'Input' },
//     {
//       name: 'x-ipass.fieldType',
//       label: '字段类型',
//       type: 'Select',
//       options: [
//         { label: 'STRING', value: 'STRING' },
//         { label: 'TEXT', value: 'TEXT' },
//         { label: 'INTEGER', value: 'INTEGER' },
//         { label: 'DECIMAL', value: 'DECIMAL' },
//         { label: 'DATE', value: 'DATE' },
//         { label: 'BOOLEAN', value: 'BOOLEAN' },
//         { label: 'ENUM', value: 'ENUM' },
//         { label: 'REF', value: 'REF' },
//       ],
//     },
//   ],
// }

/** 向所有已注册组件注入 BO 属性组（当前为空操作） */
export function injectBoProps() {
  // BO 绑定信息已在数据源面板中体现，不再注入到属性面板
  // 保留此函数以兼容现有调用
}
