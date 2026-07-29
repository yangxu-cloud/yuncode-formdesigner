# 云码表单设计器 (yuncode-formDesigner) 设计文档

## 1. 项目概述

基于 Vue 3 + TypeScript + Formily 的可视化表单设计器，服务于 IPASS 系统，支持拖拽式表单搭建、属性配置、BO 字段快速对接，以及自定义组件注入。

### 核心目标
- 拖拽组件到设计区进行表单布局
- 可视化编辑组件属性，支持属性分组与外部挂接
- 基于 Formily Schema 驱动，设计时即运行时
- 容器类组件（Tab、Grid）支持嵌套拖入子组件
- 物料可注册，内置组件与自定义组件走同一机制
- 对接 IPASS BO 字段，自动生成表单

### MVP 边界
- 8 个核心组件跑通完整流程
- 预留 IPASS 适配层接口
- 预留自定义物料注册机制
- 容器组件支持子节点嵌套

---

## 2. 技术选型

| 领域 | 选型 | 说明 |
|------|------|------|
| 框架 | Vue 3 + TypeScript | Composition API |
| 表单引擎 | @formily/vue + @formily/core | Schema 驱动，反应式表单 |
| UI 组件库 | ant-design-vue | 设计态 + 运行态统一 |
| 拖拽 | vuedraggable (SortableJS) | Vue 3 版本 |
| 状态管理 | Pinia | Schema 树 + 设计器状态 |
| 构建 | Vite | 开发体验 |
| 样式 | Less | 跟随 ant-design-vue 体系 |

---

## 3. 整体架构

```
┌──────────────────────────────────────────────────┐
│                  Form Designer App                │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  组件区   │  │   设计区    │  │   属性区      │  │
│  │ (Source)  │  │  (Canvas)  │  │ (Properties) │  │
│  └─────┬────┘  └─────┬──────┘  └──────┬───────┘  │
│        │             │                │           │
│        └─────────────┼────────────────┘           │
│                      │                            │
│              MaterialRegistry                     │
│              (物料注册中心)                         │
├──────────────────────────────────────────────────┤
│  SchemaEngine                                    │
│  (Schema 树管理 / 历史记录 / 序列化)               │
├──────────────────────────────────────────────────┤
│  内置物料  │  IPASS 物料扩展  │  自定义物料         │
│  (8 组件)  │  (BO 绑定等)     │  (业务组件)        │
└──────────────────────────────────────────────────┘
```

### 核心原则

1. **Schema 是唯一数据源** — 设计区、属性区、导出都从同一份 Schema 读取
2. **设计器不认识组件** — 所有组件通过物料注册表注入，内置组件无特权
3. **属性面板可挂载** — 外部模块可向属性区注入属性分组
4. **容器递归嵌套** — 设计区渲染是递归的，容器组件就是递归锚点

---

## 4. 目录结构

```
yuncode-formDesigner/
├── src/
│   ├── components/
│   │   ├── SourcePanel/          # 组件区
│   │   ├── Canvas/               # 设计区
│   │   ├── PropsPanel/           # 属性区
│   │   └── Designer.vue          # 设计器主布局
│   ├── stores/
│   │   ├── schema.ts             # Schema 树状态
│   │   └── designer.ts           # 设计器 UI 状态
│   ├── engine/
│   │   ├── registry.ts           # MaterialRegistry 实现
│   │   ├── schema-ops.ts         # Schema 增删改查操作
│   │   └── history.ts            # 撤销/重做
│   ├── materials/                # 内置物料包
│   │   ├── Input/
│   │   ├── TextArea/
│   │   ├── InputNumber/
│   │   ├── Select/
│   │   ├── Radio/
│   │   ├── Checkbox/
│   │   ├── DatePicker/
│   │   ├── Switch/
│   │   ├── FormGrid/             # 容器组件
│   │   ├── FormTab/              # 容器组件
│   │   └── index.ts              # 批量注册
│   ├── ipass/                    # IPASS 适配层
│   │   ├── bo-mapping.ts
│   │   ├── bo-loader.ts
│   │   └── props-extension.ts
│   ├── types/                    # 类型定义
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── DESIGN.md
```

---

## 5. 核心数据结构

### 5.1 Formily Schema 节点

设计器内部直接使用 Formily Schema 格式：

```typescript
interface FormilySchema {
  name: string
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  default?: any
  required?: boolean

  'x-decorator'?: string
  'x-decorator-props'?: Record<string, any>
  'x-component'?: string
  'x-component-props'?: Record<string, any>
  'x-pattern'?: 'editable' | 'disabled' | 'readOnly' | 'readPretty'
  'x-visible'?: boolean
  'x-hidden'?: boolean
  'x-reactions'?: any

  properties?: Record<string, FormilySchema>
  items?: FormilySchema
}
```

### 5.2 物料描述符 (MaterialDescriptor)

```typescript
interface MaterialDescriptor {
  name: string
  label: string
  group: MaterialGroup
  icon?: string | Component
  order?: number
  isContainer?: boolean
  containerSlot?: string
  schema: Omit<FormilySchema, 'name'>
  propsConfig: PropsConfigGroup[]
  designRenderer?: Component
}
```

### 5.3 属性面板配置

```typescript
interface PropsConfigGroup {
  group: string
  items: PropsConfigItem[]
  injectBy?: string
}

interface PropsConfigItem {
  name: string
  label: string
  type: string
  props?: Record<string, any>
  options?: { label: string; value: any }[]
}
```

---

## 6. 核心模块设计

### 6.1 物料注册中心 (MaterialRegistry)

```typescript
class MaterialRegistry {
  register(material: MaterialDescriptor): void
  registerAll(materials: MaterialDescriptor[]): void
  get(name: string): MaterialDescriptor | undefined
  getGroups(): Map<string, MaterialDescriptor[]>
  registerPropsGroup(targetComponent: string, group: PropsConfigGroup): void
  getPropsConfig(name: string): PropsConfigGroup[]
}
```

### 6.2 Schema 状态管理 (Pinia Store)

```typescript
const useSchemaStore = defineStore('schema', {
  state: () => ({ root: FormilySchema }),
  actions: {
    addNode(parentPath: string, schema: FormilySchema): void
    removeNode(path: string): void
    moveNode(fromPath: string, toPath: string, position: 'before' | 'after' | 'inside'): void
    updateNode(path: string, patch: Partial<FormilySchema>): void
    getNode(path: string): FormilySchema | undefined
    exportSchema(): string
    importSchema(json: string): void
  }
})
```

### 6.3 设计器 UI 状态 (Pinia Store)

```typescript
const useDesignerStore = defineStore('designer', {
  state: () => ({
    selectedPath: string | null,
    hoveredPath: string | null,
    draggingMaterial: string | null
  })
})
```

### 6.4 历史记录 (History)

基于 Schema 快照实现撤销/重做，MVP 阶段用快照，后续可优化为增量 patch。

---

## 7. 三区交互流程

### 7.1 组件区 → 拖入设计区
1. 组件区从 MaterialRegistry 读取分组和物料
2. 拖拽开始时设置 draggingMaterial
3. 拖入后生成新 Schema 节点，调用 addNode，自动选中

### 7.2 设计区内拖拽排序
1. vuedraggable 触发排序回调
2. 调用 moveNode(from, to, position)
3. 容器组件 position='inside'，普通组件 'before'|'after'

### 7.3 选中节点 → 属性区
1. 点击设计区组件，设置 selectedPath
2. 属性区 watch selectedPath，从 registry 获取 propsConfig + 扩展属性组
3. 属性值变更调用 updateNode

---

## 8. 容器组件设计

设计区递归渲染，容器组件是递归锚点：
- 普通组件：渲染 x-component + 交互壳
- 容器组件：渲染 x-component + 递归渲染 properties 子节点 + drop zone

### FormGrid / FormTab
- isContainer: true
- 拖入时生成含子槽位的默认 Schema
- 容器内空白区域作为 drop zone

### 容器拖入判定
- 目标物料 isContainer === true → position = 'inside'
- 否则 → position = 'before' | 'after'
- 容器空白区域也可接收拖入

---

## 9. 设计态渲染策略

真渲染 + 交互拦截：
- Formily 真实渲染组件，套 DesignableShell 交互壳
- x-pattern: disabled 防止真实交互
- 交互壳拦截点击，提供选中/删除/复制操作

---

## 10. IPASS 适配层

### BO 字段映射
STRING → Input, TEXT → TextArea, INTEGER/DECIMAL → NumberPicker,
DATE → DatePicker, BOOLEAN → Switch, ENUM/REF → Select

### BO 属性组注入
通过 registerPropsGroup 向组件注入 BO 绑定属性组（MVP 预留接口）

---

## 11. MVP 开发计划

| Phase | 内容 | 状态 |
|-------|------|------|
| 1 | 项目骨架 + 三区布局 + Registry + Store | 进行中 |
| 2 | 拖拽 + Schema 增删改查 + 交互壳 | 待开始 |
| 3 | 属性面板 + 8 个内置物料 | 待开始 |
| 4 | 容器组件 + Schema 导出 + 撤销重做 | 待开始 |
| 5 | IPASS 适配层 | 待开始 |

---

## 12. 关键依赖

| 包 | 版本 | 用途 |
|----|------|------|
| vue | ^3.4 | 框架 |
| typescript | ^5.3 | 类型 |
| @formily/core | ^2.3 | 表单核心 |
| @formily/vue | ^2.3 | Vue 渲染适配 |
| @formily/antdv | ^2.3 | Ant Design Vue 组件桥接 |
| ant-design-vue | ^4.x | UI 组件库 |
| vuedraggable | ^4.1 | 拖拽 |
| pinia | ^2.1 | 状态管理 |
| vite | ^5.x | 构建 |
| less | ^4.x | 样式预处理 |
