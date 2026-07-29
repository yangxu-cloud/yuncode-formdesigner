# 云码表单设计器 (yuncode-formDesigner) 更新日志

## 版本：v0.2.0
更新日期：2026-06-06

---

## 一、新增功能

### 1. 行列布局系统
- **动态行布局**：组件自动按行排列，支持 1-4 列
- **智能 span 计算**：
  - 1 个组件：span 4（满行）
  - 2 个组件：span 2 + span 2（各半）
  - 3 个组件：span 1 + span 1 + span 2
  - 4 个组件：span 1 × 4
- **手动宽度设置**：每个组件可设置 1/4、1/2、3/4、1 宽度

### 2. 拖拽交互
- **竖线指示器**：拖拽到组件前/后时显示蓝色竖线
- **插入行指示器**：拖拽到行下方时显示蓝色横线，可新增行
- **画布内排序**：支持组件在行内、行间拖拽移动
- **空画布拖入**：支持从组件区拖入空画布

### 3. 预览功能
- **表单预览**：点击工具栏"预览"按钮，弹窗显示表单实际效果
- **实时渲染**：使用 Ant Design Vue 组件真实渲染
- **布局一致**：预览区布局与设计区完全一致

### 4. 组件分类
- **常规组件**：单行输入、多行输入、数值、下拉选择、单选组、复选组、日期、开关
- **布局组件**：分组卡片

### 5. 属性配置
- **组件属性**：
  - 字段标识（只读）
  - 基础属性：标题、默认值、必填、占位提示、长度
  - 布局：宽度设置
  - 模式：可编辑/只读/禁用/阅读态、可见
- **表单属性**：
  - 显示设置：标题位置（左侧/上方）
  - 高级设置：隐藏、装饰器

### 6. 标题位置
- **全局设置**：在"表单属性"中设置，影响所有组件
- **两种模式**：左侧（默认）/ 上方

---

## 二、技术改进

### 1. 状态管理
- 新增 `designerStore.draggingPath` 存储拖拽中的组件路径
- 使用 `schemaStore.root` 替代 `props.schema` 读取数据，确保数据一致性
- 新增 `triggerUpdate()` 方法强制触发响应式更新

### 2. 拖拽逻辑
- 使用 `designerStore` 存储拖拽状态，替代 `dataTransfer`
- 新增 `insertNodeBefore` / `insertNodeAfter` 辅助函数
- 新增 `shiftRowsDown` / `cleanEmptyRows` 辅助函数

### 3. 数据结构
```typescript
interface FormilySchema {
  // ... 原有字段
  'x-row'?: number        // 行号，从 1 开始
  'x-col'?: number        // 列号，从 1 开始
  'x-span'?: number       // 宽度，1-4
  'x-label-placement'?: 'top' | 'left'  // 标题位置
}
```

---

## 三、UI 优化

### 1. 设计系统
- 统一 CSS 变量（颜色、间距、圆角、阴影）
- 统一字体和排版

### 2. 组件样式
- **组件区**：卡片式设计，悬停微动效
- **设计区**：行容器卡片，竖线/横线指示器
- **属性面板**：分组标题大写样式，统一表单控件

### 3. 交互细节
- 拖拽时半透明效果
- 选中状态蓝色边框
- 悬停状态渐变背景
- 平滑过渡动画

---

## 四、修复的问题

### 1. 拖拽问题
- 修复 dataTransfer 数据丢失导致拖拽失败
- 修复 insertRow 后组件合并问题
- 修复行号不连续问题

### 2. 布局问题
- 修复预览区与设计区布局不一致
- 修复行间距过大问题
- 修复组件宽度计算错误

### 3. 响应式问题
- 修复 `props.schema` 缓存导致数据不一致
- 修复深拷贝后引用失效问题

---

## 五、文件变更

### 新增文件
- `src/components/Preview/index.vue` - 表单预览组件
- `src/materials/Group/index.ts` - 分组布局组件

### 修改文件
- `src/types/index.ts` - 新增 x-row、x-col、x-span、x-label-placement 类型
- `src/stores/designer.ts` - 新增 draggingPath 状态
- `src/stores/schema.ts` - 优化响应式更新
- `src/components/Canvas/SchemaRenderer.vue` - 核心改造
- `src/components/Canvas/ComponentPreview.vue` - 支持标题位置
- `src/components/Canvas/DesignableShell.vue` - 样式优化
- `src/components/Canvas/index.vue` - 添加预览按钮
- `src/components/Designer.vue` - 样式优化
- `src/components/PropsPanel/index.vue` - 重构属性面板
- `src/components/PropsPanel/PropItem.vue` - 样式优化
- `src/components/SourcePanel/index.vue` - 添加布局分组
- `src/components/SourcePanel/DataSourceTree.vue` - 样式优化
- `src/materials/Input/index.ts` - 添加宽度、标题位置配置
- `src/materials/TextArea/index.ts` - 同上
- `src/materials/InputNumber/index.ts` - 同上
- `src/materials/Select/index.ts` - 同上
- `src/materials/Radio/index.ts` - 同上
- `src/materials/Checkbox/index.ts` - 同上
- `src/materials/DatePicker/index.ts` - 同上
- `src/materials/Switch/index.ts` - 同上
- `src/materials/index.ts` - 移除 FormGrid，添加 Group
- `src/ipass/props-extension.ts` - 移除 BO 绑定
- `src/App.vue` - 全局样式优化

### 删除文件
- `src/materials/FormGrid/index.ts` - 移除栅格布局组件

---

## 六、已知限制

1. 容器组件（如 Card）暂不支持嵌套子组件
2. 撤销/重做基于快照，大数据量可能影响性能
3. 预览区暂不支持表单验证
