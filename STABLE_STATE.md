# 稳定状态记录

## 记录时间
2026-06-06

## 当前功能状态

### ✅ 已实现功能
1. **行列布局系统**
   - 4列 Grid 布局
   - 动态 span 计算（1个=满行，2个=各半，3个=1/4+1/4+1/2，4个=各1/4）
   - 手动宽度设置（1/4, 1/2, 3/4, 1）

2. **拖拽功能**
   - 从组件区拖入画布
   - 画布内组件排序
   - 竖线指示器（before/after）
   - 插入行指示器（横线）

3. **预览功能**
   - 表单预览弹窗
   - 与设计区布局一致

4. **属性配置**
   - 组件属性：字段名、标题、默认值、必填、占位提示、长度、宽度、模式
   - 表单属性：标题位置（左侧/上方）、隐藏、装饰器

5. **组件分类**
   - 常规：单行输入、多行输入、数值、下拉选择、单选组、复选组、日期、开关
   - 布局：分组卡片

### ⚠️ 已知问题
1. 拖拽到新增行时偶尔会合并到上一行（状态竞争问题）
2. 拖拽完成后组件偶尔会变灰（已添加 onDragEnd 修复）

## 关键文件
- `src/components/Canvas/SchemaRenderer.vue` - 核心渲染器
- `src/components/Canvas/ComponentPreview.vue` - 组件预览
- `src/components/Preview/index.vue` - 表单预览
- `src/stores/schema.ts` - Schema 状态
- `src/stores/designer.ts` - 设计器 UI 状态
- `src/materials/*/index.ts` - 物料定义

## 核心设计决策
1. 使用 `designerStore` 存储拖拽状态，不依赖 dataTransfer
2. 使用 `schemaStore.root` 替代 `props.schema` 读取数据
3. insert-line 使用独立的 dragover/drop 事件处理
4. 绝对定位竖线指示器避免布局抖动
