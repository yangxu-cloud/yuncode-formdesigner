import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import { registry } from './engine/registry'
import { builtInMaterials } from './materials'
import { injectBoProps } from './ipass/props-extension'
import { useDesignerStore, type BoTable } from './stores/designer'

// 注册内置物料
registry.registerAll(builtInMaterials)

// 注入 IPASS BO 绑定属性组
injectBoProps()

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(Antd)

// Mock BO 数据（后续替换为 IPASS 接口）
const mockBoTables: BoTable[] = [
  {
    name: 'Order',
    label: '订单',
    isMain: true,
    fields: [
      { name: 'orderNo', label: '订单编号', type: 'STRING', required: true },
      { name: 'orderDate', label: '订单日期', type: 'DATE', required: true },
      { name: 'amount', label: '金额', type: 'DECIMAL' },
      { name: 'status', label: '状态', type: 'ENUM' },
      { name: 'remark', label: '备注', type: 'TEXT' },
    ],
  },
  {
    name: 'OrderItem',
    label: '订单明细',
    isMain: false,
    fields: [
      { name: 'productName', label: '产品名称', type: 'STRING', required: true },
      { name: 'quantity', label: '数量', type: 'INTEGER', required: true },
      { name: 'price', label: '单价', type: 'DECIMAL' },
      { name: 'subtotal', label: '小计', type: 'DECIMAL' },
    ],
  },
]

const designerStore = useDesignerStore()
designerStore.setBoTables(mockBoTables)

app.mount('#app')
