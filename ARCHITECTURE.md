# 云码表单设计器架构文档

## 1. 技术栈

| 领域 | 选型 | 版本 |
|------|------|------|
| 框架 | Vue 3 + TypeScript | ^3.4 |
| UI 组件库 | Ant Design Vue | ^4.x |
| 状态管理 | Pinia | ^2.1 |
| 构建 | Vite | ^5.x |
| 样式 | Less | ^4.x |

---

## 2. 核心架构

```
┌─────────────────────────────────────────────────────┐
│                   Designer.vue                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ SourcePanel  │  │    Canvas   │  │ PropsPanel  │  │
│  │  (组件区)    │  │   (设计区)   │  │  (属性区)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                 │         │
│         └────────────────┼─────────────────┘         │
│                          │                           │
│                    Pinia Stores                      │
│              (schema + designer)                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

```
src/
├── components/
│   ├── Canvas/                    # 设计区
│   │   ├── index.vue              # Canvas 容器
│   │   ├── SchemaRenderer.vue     # 核心渲染器
│   │   ├── DesignableShell.vue    # 交互壳
│   │   └── ComponentPreview.vue   # 组件预览
│   ├── Preview/
│   │   └── index.vue              # 表单预览弹窗
│   ├── PropsPanel/                # 属性面板
│   ├── SourcePanel/               # 组件区
│   └── Designer.vue               # 主布局
├── stores/
│   ├── schema.ts                  # Schema 状态
│   └── designer.ts                # 设计器 UI 状态
├── engine/
│   ├── registry.ts                # 物料注册中心
│   ├── schema-ops.ts              # Schema 操作
│   └── history.ts                 # 撤销/重做
├── materials/                     # 内置物料
│   ├── Input/                     # 单行输入
│   ├── TextArea/                  # 多行输入
│   ├── InputNumber/               # 数值
│   ├── Select/                    # 下拉选择
│   ├── Radio/                     # 单选组
│   ├── Checkbox/                  # 复选组
│   ├── DatePicker/                # 日期
│   ├── Switch/                    # 开关
│   ├── Group/                     # 分组卡片
│   └── index.ts                   # 批量注册
├── ipass/                         # IPASS 适配层
└── types/
    └── index.ts                   # 类型定义
```

---

## 4. 核心数据结构

### 4.1 FormilySchema 节点

```typescript
interface FormilySchema {
  name?: string
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  default?: any
  required?: boolean

  // Formily 扩展
  'x-decorator'?: string
  'x-component'?: string
  'x-component-props'?: Record<string, any>
  'x-pattern'?: 'editable' | 'disabled' | 'readOnly' | 'readPretty'
  'x-visible'?: boolean
  'x-hidden'?: boolean

  // 行列布局
  'x-row'?: number
  'x-col'?: number
  'x-span'?: number
  'x-label-placement'?: 'top' | 'left'

  // 容器子节点
  properties?: Record<string, FormilySchema>
}
```

### 4.2 布局计算规则

```
一行 1 个组件 → span 4（满行）
一行 2 个组件 → span 2 + span 2（各半）
一行 3 个组件 → span 1 + span 1 + span 2（前两个窄，最后一个宽）
一行 4 个组件 → span 1 × 4（各 1/4）
```

---

## 5. 核心模块

### 5.1 SchemaRenderer（核心渲染器）

**职责**：
- 按 x-row 分组渲染组件
- 处理拖拽交互（竖线/横线指示器）
- 管理行列布局

**关键函数**：
- `calcSpans(count)` - 根据组件数计算 span
- `insertNodeBefore/After` - 插入节点
- `shiftRowsDown` - 为新行腾出空间
- `cleanEmptyRows` - 清理空行
- `adjustRowNumbers` - 重新编号

### 5.2 PropsPanel（属性面板）

**职责**：
- 显示组件属性（组件属性 tab）
- 显示表单属性（表单属性 tab）
- 处理属性变更

**属性分组**：
- 组件属性：字段标识、基础、布局、模式
- 表单属性：显示设置、高级设置

### 5.3 DesignerStore（UI 状态）

```typescript
interface DesignerState {
  selectedPath: string | null     // 选中节点路径
  hoveredPath: string | null      // 悬停节点路径
  draggingMaterial: string | null // 拖拽中的组件名
  draggingPath: string | null     // 拖拽中的组件路径
}
```

---

## 6. 拖拽流程

### 6.1 从组件区拖入

```
1. onDragStart → 设置 designerStore.draggingMaterial
2. onDragOver → 显示插入线
3. onDrop/onEmptyDrop → 创建新节点，添加到 Schema
```

### 6.2 画布内拖拽

```
1. onDragStart → 设置 designerStore.draggingPath
2. onDragOver → 显示竖线指示器
3. onDrop → 移动节点到新位置
```

### 6.3 插入新行

```
1. 拖拽到行下方 → 显示横线
2. onInsertRowDrop → shiftRowsDown + 添加节点
```

---

## 7. 数据流

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ SourcePanel  │───▶│  SchemaStore │◀───│ PropsPanel  │
│  (拖入组件)   │    │  (Schema树)  │    │  (修改属性)  │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ SchemaRenderer│
                   │  (渲染设计区)  │
                   └─────────────┘
```

---

## 8. 关键设计决策

### 8.1 使用 designerStore 存储拖拽状态

**原因**：HTML5 dataTransfer 在某些情况下会丢失数据

**解决方案**：将拖拽状态（materialName、path）存储在 Pinia store 中

### 8.2 使用 schemaStore.root 替代 props.schema

**原因**：props 在组件内是缓存的，多次同步操作后可能读取到旧数据

**解决方案**：在命令式函数中直接读取 `schemaStore.root`（Pinia 自动解包，始终最新）

### 8.3 绝对定位竖线指示器

**原因**：相对定位会导致布局变化，触发连锁反应（闪烁）

**解决方案**：使用绝对定位，不影响 Grid 布局
