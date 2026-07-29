<template>
  <div class="schema-renderer">
    <template v-for="row in rows" :key="row.rowNum">
      <!-- 每行的 Grid -->
      <div
        class="schema-renderer__row"
        :style="{ gridTemplateColumns: `repeat(${row.totalCols}, 1fr)` }"
      >
        <div
          v-for="item in row.items"
          :key="item.path"
          class="schema-renderer__cell-wrapper"
          :style="{ gridColumn: `span ${item.span}` }"
        >
          <!-- 组件单元格 -->
          <div
            class="schema-renderer__cell"
            :class="{
              'schema-renderer__cell--dragging': draggingPath === item.path,
              'schema-renderer__cell--drag-over': dragOverPath === item.path,
            }"
            :data-path="item.path"
            draggable="true"
            @dragstart="onDragStart($event, item.path)"
            @dragend="onDragEnd"
            @dragover.prevent="onDragOver($event, item.path)"
            @dragleave="onDragLeave"
            @drop.stop="onDrop($event, item.path)"
          >
            <DesignableShell
              :path="item.path"
              :component-name="item.node['x-component']"
              @delete="onDelete(item.path)"
              @copy="onCopy(item.path, item.node)"
            >
              <div class="schema-renderer__preview-wrap">
                <ComponentPreview :schema="item.node">
                  <!-- 容器组件的子组件 -->
                  <template v-if="item.node['x-component'] && registry.isContainer(item.node['x-component'])">
                    <!-- 标签页组件特殊处理 -->
                    <div
                      v-if="item.node['x-component'] === 'Tabs'"
                      class="schema-renderer__tabs-content"
                      :data-path="item.path"
                      @dragover.prevent="onTabsContentDragOver($event, item.path)"
                      @dragleave="onTabsContentDragLeave"
                      @drop.stop="onTabsContentDrop($event, item.path)"
                    >
                      <!-- 标签页标题行 -->
                      <div class="schema-renderer__tabs-header">
                        <div
                          v-for="(tabKey, tabIdx) in getTabKeys(item.node)"
                          :key="tabKey"
                          class="schema-renderer__tabs-tab"
                          :class="{ 'schema-renderer__tabs-tab--active': (tabsActiveIndices[item.path] ?? 0) === tabIdx }"
                          @click.stop="switchTab(item.path, tabIdx)"
                        >
                          {{ getTabTitle(item.node, tabIdx) }}
                        </div>
                      </div>
                      <!-- 渲染当前激活标签页的内容 -->
                      <div class="schema-renderer__tabs-pane">
                        <!-- 使用行布局显示标签页内的组件 -->
                        <div
                          v-for="(tabRow, rowIdx) in getActiveTabRows(item.node, item.path)"
                          :key="rowIdx"
                          class="schema-renderer__tabs-row"
                        >
                          <div
                            v-for="tabItem in tabRow.items"
                            :key="tabItem.key"
                            class="schema-renderer__tabs-cell"
                            :class="{
                              'schema-renderer__tabs-cell--selected': designerStore.selectedPath === tabItem.path,
                              'schema-renderer__tabs-cell--dragging': draggingPath === tabItem.path,
                            }"
                            :style="{ gridColumn: `span ${tabItem.span}` }"
                            :data-path="tabItem.path"
                          >
                            <DesignableShell
                              :path="tabItem.path"
                              :component-name="tabItem.node['x-component']"
                              draggable="true"
                              @dragstart="onChildDragStart($event, tabItem.path)"
                              @delete="onDeleteTabItem(tabItem.path)"
                              @copy="onCopyTabItem(tabItem.path, tabItem.node)"
                            >
                              <ComponentPreview :schema="tabItem.node" />
                            </DesignableShell>
                          </div>
                        </div>
                        <div
                          v-if="!getActiveTabContent(item.node) || Object.keys(getActiveTabContent(item.node) || {}).length === 0"
                          class="schema-renderer__container-placeholder"
                        >
                          拖拽组件到此处
                        </div>
                      </div>
                      <!-- 标记线 -->
                      <div class="schema-renderer__tabs-markers" :data-path="item.path">
                        <!-- 行标记线 - 当鼠标在两行之间时显示 -->
                        <div
                          v-for="markerIdx in getMarkerCount(item.node, item.path)"
                          :key="'row-' + markerIdx"
                          class="schema-renderer__tabs-marker"
                          :class="{ 'schema-renderer__tabs-marker--active': tabsRowIndex === markerIdx - 1 && tabsColAbsX <= 0 }"
                          :style="{ top: getMarkerTop(markerIdx - 1, item.path) + 'px' }"
                        >
                          <div class="schema-renderer__tabs-marker-line"></div>
                        </div>
                        <!-- 列标记线 - 使用绝对定位在容器内 -->
                        <div
                          v-if="tabsColAbsX > 0"
                          class="schema-renderer__tabs-col-marker"
                          :style="{ top: tabsColAbsY + 'px', height: tabsRowHeight + 'px', left: (tabsColAbsX - 1) + 'px' }"
                        >
                          <div class="schema-renderer__tabs-col-marker-line"></div>
                        </div>
                      </div>
                    </div>

                    <!-- 布局容器组件特殊处理 -->
                    <div
                      v-else-if="item.node['x-component'] === 'LayoutContainer'"
                      class="schema-renderer__layout-container"
                      :data-path="item.path"
                      @dragover.prevent="onLayoutContainerDragOver($event, item.path)"
                      @dragleave="onLayoutContainerDragLeave"
                      @drop.stop="onLayoutContainerDrop($event, item.path)"
                    >
                      <template v-if="item.node.properties && Object.keys(item.node.properties).length > 0">
                        <!-- 使用行布局显示容器内的组件 -->
                        <div
                          v-for="(containerRow, rowIdx) in getLayoutContainerRows(item.node, item.path)"
                          :key="rowIdx"
                          class="schema-renderer__layout-row"
                        >
                          <div
                            v-for="containerItem in containerRow.items"
                            :key="containerItem.key"
                            class="schema-renderer__layout-cell"
                            :class="{
                              'schema-renderer__layout-cell--selected': designerStore.selectedPath === containerItem.path,
                              'schema-renderer__layout-cell--dragging': draggingPath === containerItem.path,
                            }"
                            :style="{ gridColumn: `span ${containerItem.span}` }"
                            :data-path="containerItem.path"
                          >
                            <DesignableShell
                              :path="containerItem.path"
                              :component-name="containerItem.node['x-component']"
                              draggable="true"
                              @dragstart="onChildDragStart($event, containerItem.path)"
                              @delete="onDeleteContainerItem(containerItem.path)"
                              @copy="onCopyContainerItem(containerItem.path, containerItem.node)"
                            >
                              <ComponentPreview :schema="containerItem.node" />
                            </DesignableShell>
                          </div>
                        </div>
                      </template>
                      <div v-else class="schema-renderer__container-placeholder">
                        拖拽组件到此处
                      </div>
                      <!-- 布局容器标记线 -->
                      <div class="schema-renderer__layout-markers" :data-path="item.path">
                        <!-- 行标记线 -->
                        <div
                          v-for="markerIdx in getLayoutMarkerCount(item.node, item.path)"
                          :key="'row-' + markerIdx"
                          class="schema-renderer__layout-marker"
                          :class="{ 'schema-renderer__layout-marker--active': layoutRowIndex === markerIdx - 1 && layoutColAbsX <= 0 }"
                          :style="{ top: getLayoutMarkerTop(markerIdx - 1, item.path) + 'px' }"
                        >
                          <div class="schema-renderer__layout-marker-line"></div>
                        </div>
                        <!-- 列标记线 -->
                        <div
                          v-if="layoutColAbsX > 0"
                          class="schema-renderer__layout-col-marker"
                          :style="{ top: layoutColAbsY + 'px', height: layoutRowHeight + 'px', left: (layoutColAbsX - 1) + 'px' }"
                        >
                          <div class="schema-renderer__layout-col-marker-line"></div>
                        </div>
                      </div>
                    </div>

                    <!-- 其他容器组件 -->
                    <div
                      v-else
                      class="schema-renderer__container-dropzone"
                      :data-path="item.path"
                      @dragover.prevent="onContainerDragOver($event, item.path)"
                      @dragleave="onContainerDragLeave"
                      @drop.stop="onContainerDrop($event, item.path)"
                    >
                      <template v-if="item.node.properties && Object.keys(item.node.properties).length > 0">
                        <div
                          v-for="(childNode, childKey) in item.node.properties"
                          :key="childKey"
                          class="schema-renderer__child-item"
                          :data-path="`${item.path}.${childKey}`"
                          draggable="true"
                          @dragstart="onChildDragStart($event, `${item.path}.${childKey}`)"
                        >
                          <ComponentPreview :schema="childNode" />
                        </div>
                      </template>
                      <div v-else class="schema-renderer__container-placeholder">
                        拖拽组件到此处
                      </div>
                    </div>
                  </template>
                </ComponentPreview>
              </div>
            </DesignableShell>
          </div>

          <!-- 左侧竖线指示器 -->
          <div
            v-if="dragOverPath === item.path && dragPosition === 'before'"
            class="schema-renderer__vertical-line schema-renderer__vertical-line--left"
          />

          <!-- 右侧竖线指示器 -->
          <div
            v-if="dragOverPath === item.path && dragPosition === 'after'"
            class="schema-renderer__vertical-line schema-renderer__vertical-line--right"
          />
        </div>
      </div>

      <!-- 每行下方的拖拽插入线 -->
      <div
        class="schema-renderer__insert-line"
        :class="{ 'schema-renderer__insert-line--active': dragOverRow === row.rowNum }"
        @dragover.prevent="onInsertRowDragOver($event, row.rowNum)"
        @dragleave="onInsertRowDragLeave"
        @drop.stop="onInsertRowDrop($event, row.rowNum)"
      />
    </template>

    <!-- 无组件时：整个画布都是拖入区域 -->
    <div
      v-if="rows.length === 0"
      class="schema-renderer__empty"
      @dragover.prevent="onEmptyDragOver"
      @drop.stop="onEmptyDrop"
    >
      从左侧拖入组件，或点击组件添加
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import type { BoField } from '@/stores/designer'
import { registry } from '@/engine/registry'
import { boFieldToSchema } from '@/ipass/bo-mapping'
import { nanoid } from 'nanoid'
import type { FormilySchema } from '@/types'
import { calcLayout, calcNewPosition } from '@/engine/layout-utils'
import DesignableShell from './DesignableShell.vue'
import ComponentPreview from './ComponentPreview.vue'

const props = defineProps<{
  schema: FormilySchema
  path: string
  isMobile?: boolean
}>()

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 拖拽状态
const draggingPath = ref<string | null>(null)

// ====== dropIntent：只在 drop/dragend 时清空，dragleave 不动 ======
type DropIntent =
  | { type: 'insert-row'; rowNum: number }
  | { type: 'insert-cell'; path: string; position: 'before' | 'after' }
  | null
const dropIntent = ref<DropIntent>(null)

// 视觉状态（用于显示指示线）
const dragOverPath = ref<string | null>(null)
const dragPosition = ref<'before' | 'after'>('after')
const dragOverRow = ref<number | null>(null)

// 标签页内拖拽状态
const childDragOverPath = ref<string | null>(null)
const childDragPosition = ref<'before' | 'after' | 'below'>('after')

// 全局清理拖拽状态（dragend 时调用）
function clearDragState() {
  draggingPath.value = null
  dragOverPath.value = null
  dragPosition.value = 'after'
  dragOverRow.value = null
  dropIntent.value = null
  childDragOverPath.value = null
  childDragPosition.value = 'after'
  designerStore.setDragging(null)
  designerStore.setDraggingPath(null)
}

onMounted(() => {
  document.addEventListener('dragend', clearDragState)
})

onUnmounted(() => {
  document.removeEventListener('dragend', clearDragState)
})

// ====== 布局计算 ======

interface RowItem {
  key: string
  path: string
  node: FormilySchema
  span: number
}

interface Row {
  rowNum: number
  items: RowItem[]
  totalCols: number
}

/** 使用通用布局算法计算行列表 */
const rows = computed<Row[]>(() => {
  // 直接从 store 读取，确保响应式
  const properties = schemaStore.root.properties
  if (!properties) return []

  let entries = Object.entries(properties)
  if (entries.length === 0) return []

  // 移动端模式：过滤隐藏组件，按 x-mobile.order 排序，单列布局
  if (props.isMobile) {
    // 过滤掉移动端隐藏的组件
    entries = entries.filter(([, node]) => {
      const mobile = node['x-mobile']
      if (mobile && mobile.visible === false) return false
      return true
    })

    // 按移动端 order 排序，没有 order 的按 x-row * 4 + x-col 排序
    entries.sort((a, b) => {
      const orderA = (a[1]['x-mobile'] as any)?.order ?? ((a[1]['x-row'] ?? 1) * 4 + (a[1]['x-col'] ?? 1))
      const orderB = (b[1]['x-mobile'] as any)?.order ?? ((b[1]['x-row'] ?? 1) * 4 + (b[1]['x-col'] ?? 1))
      return orderA - orderB
    })

    // 移动端：每个组件独立一行
    return entries.map(([key, node], idx) => ({
      rowNum: idx + 1,
      items: [{
        key,
        path: props.path ? `${props.path}.${key}` : key,
        node,
        span: 1,
      }],
      totalCols: 1,
    }))
  }

  // PC 端模式 - 使用通用布局算法
  const layout = calcLayout(properties, props.path || '')
  return layout.map(row => ({
    rowNum: row.rowNum,
    items: row.items.map(item => ({
      key: item.key,
      path: item.path,
      node: item.node,
      span: item.span,
    })),
    totalCols: row.totalCols,
  }))
})

// ====== 工具函数 ======

// 获取当前激活标签页的内容
function getActiveTabContent(tabsNode: FormilySchema, tabsPath?: string): Record<string, FormilySchema> | null {
  if (!tabsNode.properties) return null

  const tabKeys = Object.keys(tabsNode.properties)
  if (tabKeys.length === 0) return null

  // 根据激活的标签页索引返回对应TabPane的内容
  const activeIdx = tabsPath ? (tabsActiveIndices.value[tabsPath] ?? 0) : 0
  const activeKey = tabKeys[Math.min(activeIdx, tabKeys.length - 1)]
  const activeTab = tabsNode.properties[activeKey]
  return activeTab?.properties || null
}

// 获取当前激活标签页的行布局 - 使用通用布局算法
interface TabRowItem {
  key: string
  path: string
  node: FormilySchema
  span: number
  row: number
  col: number
}

interface TabRow {
  rowNum: number
  items: TabRowItem[]
  totalCols: number
}

function getActiveTabRows(tabsNode: FormilySchema, tabsNodePath?: string): TabRow[] {
  // 直接从 schemaStore 获取最新的 Tabs 节点
  const latestTabsNode = tabsNodePath ? schemaStore.getNode(tabsNodePath) : tabsNode
  if (!latestTabsNode) return []

  const content = getActiveTabContent(latestTabsNode, tabsNodePath)
  if (!content) return []

  // 获取激活TabPane的路径
  const tabKeys = Object.keys(latestTabsNode.properties || {})
  if (tabKeys.length === 0) return []
  const activeIdx = tabsNodePath ? (tabsActiveIndices.value[tabsNodePath] ?? 0) : 0
  const activeKey = tabKeys[Math.min(activeIdx, tabKeys.length - 1)]
  const tabPath = tabsNodePath ? `${tabsNodePath}.${activeKey}` : activeKey

  // 使用通用布局算法
  const layout = calcLayout(content, tabPath)
  return layout
}

// 获取当前激活标签页的路径
function getActiveTabPath(tabsPath: string): string {
  const tabsNode = schemaStore.getNode(tabsPath)
  if (!tabsNode?.properties) return tabsPath

  const tabKeys = Object.keys(tabsNode.properties)
  if (tabKeys.length === 0) return tabsPath

  const activeIdx = tabsActiveIndices.value[tabsPath] ?? 0
  const activeKey = tabKeys[Math.min(activeIdx, tabKeys.length - 1)]
  return `${tabsPath}.${activeKey}`
}

// 删除标签页内的组件
function onDeleteTabItem(path: string) {
  schemaStore.removeNode(path)
  if (designerStore.selectedPath === path) {
    designerStore.selectNode(null)
  }
}

// 复制标签页内的组件
function onCopyTabItem(path: string, source: FormilySchema) {
  const cloned = JSON.parse(JSON.stringify(source))
  cloned.name = `${source['x-component']}_${nanoid(6)}`

  // 获取父节点路径
  const segments = path.split('.')
  const parentPath = segments.slice(0, -1).join('.')
  const parentNode = schemaStore.getNode(parentPath)

  if (parentNode) {
    // 确保properties存在
    if (!parentNode.properties) {
      parentNode.properties = {}
    }

    // 获取父节点中已有的行号
    const properties = parentNode.properties as Record<string, FormilySchema>
    const rowNums = Object.keys(properties).length > 0
      ? [...new Set(Object.values(properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
      : []

    // 根据已有行数决定插入位置
    if (rowNums.length > 0) {
      cloned['x-row'] = Math.max(...rowNums) + 1
      cloned['x-col'] = 1
    } else {
      cloned['x-row'] = 1
      cloned['x-col'] = 1
    }

    properties[cloned.name] = cloned
    schemaStore.triggerUpdate()

    designerStore.selectNode(`${parentPath}.${cloned.name}`)
  }
}

// 删除布局容器内的组件
function onDeleteContainerItem(path: string) {
  schemaStore.removeNode(path)
  if (designerStore.selectedPath === path) {
    designerStore.selectNode(null)
  }
}

// 复制布局容器内的组件
function onCopyContainerItem(path: string, source: FormilySchema) {
  const cloned = JSON.parse(JSON.stringify(source))
  cloned.name = `${source['x-component']}_${nanoid(6)}`

  // 获取父节点路径
  const segments = path.split('.')
  const parentPath = segments.slice(0, -1).join('.')
  const parentNode = schemaStore.getNode(parentPath)

  if (parentNode) {
    // 确保properties存在
    if (!parentNode.properties) {
      parentNode.properties = {}
    }

    // 获取父节点中已有的行号
    const properties = parentNode.properties as Record<string, FormilySchema>
    const rowNums = Object.keys(properties).length > 0
      ? [...new Set(Object.values(properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
      : []

    // 根据已有行数决定插入位置
    if (rowNums.length > 0) {
      cloned['x-row'] = Math.max(...rowNums) + 1
      cloned['x-col'] = 1
    } else {
      cloned['x-row'] = 1
      cloned['x-col'] = 1
    }

    properties[cloned.name] = cloned
    schemaStore.triggerUpdate()

    designerStore.selectNode(`${parentPath}.${cloned.name}`)
  }
}

// 获取标签页的key列表
function getTabKeys(tabsNode: FormilySchema): string[] {
  return Object.keys(tabsNode.properties || {})
}

// 获取标签页标题
function getTabTitle(tabsNode: FormilySchema, tabIdx: number): string {
  const keys = getTabKeys(tabsNode)
  if (tabIdx >= keys.length) return '标签页'
  const tabNode = tabsNode.properties?.[keys[tabIdx]]
  return tabNode?.['x-component-props']?.tab || tabNode?.title || keys[tabIdx]
}

// 切换标签页
function switchTab(tabsPath: string, tabIdx: number) {
  tabsActiveIndices.value = { ...tabsActiveIndices.value, [tabsPath]: tabIdx }
  // 重置当前标签页的拖放状态
  tabsRowIndex.value = -1
  tabsColAbsX.value = 0
  tabsColAbsY.value = 0
  tabsRowHeight.value = 0
}

// ====== 布局容器函数 ======

// 获取布局容器的行布局（使用与页签组件相同的逻辑）
function getLayoutContainerRows(layoutNode: FormilySchema, containerPath: string): TabRow[] {
  // 直接从 schemaStore 获取最新的 LayoutContainer 节点
  const latestNode = schemaStore.getNode(containerPath)
  if (!latestNode) return []

  const content = latestNode.properties
  if (!content || Object.keys(content).length === 0) return []

  // 使用通用布局算法，与页签组件完全一致
  const layout = calcLayout(content, containerPath)
  return layout
}

// 布局容器拖拽处理（与页签组件完全一致）
function onLayoutContainerDragOver(e: DragEvent, layoutPath: string) {
  e.stopPropagation()
  // 只要有拖拽材料或拖拽路径，就允许放置
  if (designerStore.draggingMaterial || designerStore.draggingPath) {
    e.dataTransfer!.dropEffect = 'copy'
  }

  // 清除外部的辅助线状态
  dragOverPath.value = null
  dragOverRow.value = null
  dragPosition.value = 'after'

  // 获取布局容器节点
  const layoutNode = schemaStore.getNode(layoutPath)
  if (!layoutNode?.properties) return

  // 获取所有行号并排序
  const rowNums = [...new Set(Object.values(layoutNode.properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
  if (rowNums.length === 0) return

  // 更新标记线位置
  const target = e.currentTarget as HTMLElement
  updateLayoutMarkerPositions(layoutPath, target)
  const containerRect = target.getBoundingClientRect()

  // 先检测鼠标是否在某一行内部
  const rowEls = Array.from(target.querySelectorAll('.schema-renderer__layout-row')) as HTMLElement[]
  let foundInRow = false
  for (let i = 0; i < rowEls.length; i++) {
    const r = rowEls[i].getBoundingClientRect()
    // 检查鼠标是否在行范围内（带2px容差，避免边界误判）
    if (e.clientY >= r.top - 2 && e.clientY <= r.bottom + 2) {
      // 在行内部 - 使用实际行号
      layoutRowIndex.value = rowNums[i]

      // 获取该行内的所有子组件（layout-cell）
      const cellEls = rowEls[i].querySelectorAll('.schema-renderer__layout-cell')
      const relX = e.clientX - r.left

      // 查找最近的组件边界
      let nearestBoundary = relX
      for (const cell of Array.from(cellEls)) {
        const cellRect = cell.getBoundingClientRect()
        const cellLeft = cellRect.left - r.left
        const cellRight = cellRect.right - r.left
        // 如果鼠标在组件内部，计算离左侧还是右侧更近
        if (relX >= cellLeft && relX <= cellRight) {
          if (relX - cellLeft < cellRight - relX) {
            nearestBoundary = cellLeft
          } else {
            nearestBoundary = cellRight
          }
          break
        }
      }

      // 列辅助线相对于容器的坐标
      layoutColAbsX.value = (r.left + nearestBoundary) - containerRect.left
      layoutColAbsY.value = r.top - containerRect.top
      layoutRowHeight.value = r.height
      layoutRowRelX.value = nearestBoundary
      foundInRow = true
      break
    }
  }

  if (!foundInRow) {
    // 不在任何行内 - 保留 insertIdx 作为索引（用于显示标记线）
    let insertIdx = 0
    for (let i = 0; i < rowEls.length; i++) {
      const r = rowEls[i].getBoundingClientRect()
      if (e.clientY < r.top) {
        insertIdx = i
        break
      }
      insertIdx = i + 1
    }
    layoutRowIndex.value = insertIdx
    layoutColAbsX.value = 0
    layoutColAbsY.value = 0
    layoutRowHeight.value = 0
  }
}

function onLayoutContainerDragLeave(e: DragEvent) {
  e.stopPropagation()
  layoutRowIndex.value = -1
  layoutColAbsX.value = 0
  layoutColAbsY.value = 0
  layoutRowHeight.value = 0
  layoutRowRelX.value = 0
}

function onLayoutContainerDrop(e: DragEvent, layoutPath: string) {
  e.stopPropagation()

  const materialName = designerStore.draggingMaterial
  const fromPath = designerStore.draggingPath
  const targetRowIdx = layoutRowIndex.value
  const targetColAbsX = layoutColAbsX.value
  const targetRowHeight = layoutRowHeight.value
  const targetRowRelX = layoutRowRelX.value

  // 重置标记
  layoutRowIndex.value = -1
  layoutRowHeight.value = 0
  layoutColAbsX.value = 0
  layoutColAbsY.value = 0
  layoutRowRelX.value = 0

  // 获取布局容器节点
  const layoutNode = schemaStore.getNode(layoutPath)
  if (!layoutNode) return

  // 确保properties存在
  if (!layoutNode.properties) {
    layoutNode.properties = {}
  }

  const properties = layoutNode.properties as Record<string, FormilySchema>

  // 获取所有行号
  const rowNums = Object.keys(properties).length > 0
    ? [...new Set(Object.values(properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
    : []

  // 从组件区拖入新组件
  if (materialName) {
    const material = registry.get(materialName)
    if (!material) return

    const name = `${materialName}_${nanoid(6)}`
    const node: FormilySchema = {
      name,
      ...JSON.parse(JSON.stringify(material.schema)),
      'x-label-placement': 'left',
    }

    // 判断是插入到行内还是行之间
    if (targetColAbsX > 0 && targetRowHeight > 0 && rowNums.includes(targetRowIdx)) {
      // 插入到已有行中（列插入）
      const targetRow = targetRowIdx
      const target = e.currentTarget as HTMLElement
      const containerRect = target.getBoundingClientRect()
      const rowIndex = rowNums.indexOf(targetRow)
      const rowEl = (target.querySelectorAll('.schema-renderer__layout-row')[rowIndex]) as HTMLElement
      const rowWidth = rowEl?.getBoundingClientRect().width || containerRect.width
      const colWidth = rowWidth / 4
      const colIdx = Math.min(Math.max(Math.floor(targetRowRelX / colWidth), 0), 3)

      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) === targetRow && (n['x-col'] ?? 1) > colIdx) {
          n['x-col'] = (n['x-col'] ?? 1) + 1
        }
      }
      node['x-row'] = targetRow
      node['x-col'] = colIdx + 1
    } else if (rowNums.length > 0 && targetRowIdx >= 0 && targetRowIdx < rowNums.length) {
      // 在两行之间插入新行
      const targetRowNum = rowNums[targetRowIdx]
      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) >= targetRowNum) {
          n['x-row'] = (n['x-row'] ?? 1) + 1
        }
      }
      node['x-row'] = targetRowNum
      node['x-col'] = 1
    } else if (rowNums.length > 0) {
      // 插入到最后一行之后
      node['x-row'] = Math.max(...rowNums) + 1
      node['x-col'] = 1
    } else {
      // 没有已有组件
      node['x-row'] = 1
      node['x-col'] = 1
    }

    properties[name] = node
    schemaStore.triggerUpdate()

    designerStore.selectNode(`${layoutPath}.${name}`)
  } else if (fromPath && fromPath !== layoutPath && !layoutPath.startsWith(fromPath)) {
    // 画布内拖拽
    const fromNode = schemaStore.getNode(fromPath)
    if (!fromNode) return

    // 移动组件
    schemaStore.removeNode(fromPath)
    const fromName = fromPath.split('.').pop()!
    const clonedNode = JSON.parse(JSON.stringify(fromNode))
    clonedNode.name = fromName

    // 判断插入位置
    if (targetColAbsX > 0 && targetRowHeight > 0 && rowNums.includes(targetRowIdx)) {
      const targetRow = targetRowIdx
      const target = e.currentTarget as HTMLElement
      const containerRect = target.getBoundingClientRect()
      const rowIndex = rowNums.indexOf(targetRow)
      const rowEl = (target.querySelectorAll('.schema-renderer__layout-row')[rowIndex]) as HTMLElement
      const rowWidth = rowEl?.getBoundingClientRect().width || containerRect.width
      const colWidth = rowWidth / 4
      const colIdx = Math.min(Math.max(Math.floor(targetRowRelX / colWidth), 0), 3)

      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) === targetRow && (n['x-col'] ?? 1) > colIdx) {
          n['x-col'] = (n['x-col'] ?? 1) + 1
        }
      }
      clonedNode['x-row'] = targetRow
      clonedNode['x-col'] = colIdx + 1
    } else if (rowNums.length > 0 && targetRowIdx >= 0 && targetRowIdx < rowNums.length) {
      const targetRowNum = rowNums[targetRowIdx]
      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) >= targetRowNum) {
          n['x-row'] = (n['x-row'] ?? 1) + 1
        }
      }
      clonedNode['x-row'] = targetRowNum
      clonedNode['x-col'] = 1
    } else if (rowNums.length > 0) {
      clonedNode['x-row'] = Math.max(...rowNums) + 1
      clonedNode['x-col'] = 1
    } else {
      clonedNode['x-row'] = 1
      clonedNode['x-col'] = 1
    }

    properties[fromName] = clonedNode
    schemaStore.triggerUpdate()
  }

  // 清空状态
  draggingPath.value = null
  designerStore.setDragging(null)
  designerStore.setDraggingPath(null)
}

function fullPath(key: string): string {
  return props.path ? `${props.path}.${key}` : key
}

function onDelete(path: string) {
  schemaStore.removeNode(path)
  adjustRowNumbers()
  if (designerStore.selectedPath === path) {
    designerStore.selectNode(null)
  }
}

function onCopy(path: string, source: FormilySchema) {
  const cloned = JSON.parse(JSON.stringify(source))
  cloned.name = `${source['x-component']}_${nanoid(6)}`
  cloned['x-row'] = source['x-row']
  cloned['x-col'] = (source['x-col'] ?? 1) + 1
  const segments = path.split('.')
  segments.pop()
  const parentPath = segments.join('.')
  schemaStore.addNode(parentPath, cloned)
  adjustRowNumbers()
}

/** 将指定行号之后的所有行号 +1 */
function shiftRowsDown(fromRowNum: number) {
  const properties = schemaStore.root.properties
  if (!properties) return
  for (const [, node] of Object.entries(properties)) {
    const row = node['x-row']
    if (typeof row === 'number' && row >= fromRowNum) {
      node['x-row'] = row + 1
    }
  }
  schemaStore.triggerUpdate()
}

/** 清理空行并重新编号 */
function cleanEmptyRows() {
  const properties = schemaStore.root.properties
  if (!properties) return
  const entries = Object.entries(properties)
  if (entries.length === 0) return

  const usedRows = new Set<number>()
  for (const [, node] of entries) {
    const row = node['x-row']
    if (typeof row === 'number') {
      usedRows.add(row)
    }
  }

  const sortedRows = [...usedRows].sort((a, b) => a - b)
  const rowMapping = new Map<number, number>()
  sortedRows.forEach((oldRow, idx) => {
    rowMapping.set(oldRow, idx + 1)
  })

  for (const [, node] of entries) {
    const oldRow = node['x-row']
    if (typeof oldRow === 'number' && rowMapping.has(oldRow)) {
      node['x-row'] = rowMapping.get(oldRow)!
    }
  }
  schemaStore.triggerUpdate()
}

/** 重新整理行号和列号 */
function adjustRowNumbers() {
  const properties = schemaStore.root.properties
  if (!properties) return
  const entries = Object.entries(properties)
  if (entries.length === 0) return

  const items = entries.map(([key, node]) => ({
    key,
    row: node['x-row'] ?? -1,
    col: node['x-col'] ?? -1,
  }))

  const withRow = items.filter(i => i.row > 0).sort((a, b) => a.row - b.row || a.col - b.col)
  const withoutRow = items.filter(i => i.row <= 0)
  const sorted = [...withRow, ...withoutRow]

  const rowGroups = new Map<number, typeof sorted>()
  for (const item of sorted) {
    const effectiveRow = item.row > 0 ? item.row : (sorted.indexOf(item) + 1)
    if (!rowGroups.has(effectiveRow)) rowGroups.set(effectiveRow, [])
    rowGroups.get(effectiveRow)!.push(item)
  }

  let rowNum = 1
  for (const [, group] of [...rowGroups.entries()].sort((a, b) => a[0] - b[0])) {
    group.forEach((item, colIdx) => {
      const node = properties[item.key]
      if (node) {
        node['x-row'] = rowNum
        node['x-col'] = colIdx + 1
      }
    })
    rowNum++
  }

  schemaStore.triggerUpdate()
}

/** 在目标节点前插入 */
function insertNodeBefore(targetPath: string, newNode: FormilySchema) {
  const targetNode = schemaStore.getNode(targetPath)
  if (!targetNode) return

  const targetRow = targetNode['x-row'] ?? 1
  const segments = targetPath.split('.')
  segments.pop()
  const parentPath = segments.join('.')

  newNode['x-row'] = targetRow
  newNode['x-col'] = 999
  schemaStore.addNode(parentPath, newNode)
  adjustRowNumbers()
}

/** 在目标节点后插入 */
function insertNodeAfter(targetPath: string, newNode: FormilySchema) {
  const targetNode = schemaStore.getNode(targetPath)
  if (!targetNode) return

  const targetRow = targetNode['x-row'] ?? 1
  const segments = targetPath.split('.')
  segments.pop()
  const parentPath = segments.join('.')

  newNode['x-row'] = targetRow
  newNode['x-col'] = 999
  schemaStore.addNode(parentPath, newNode)
  adjustRowNumbers()
}

// ====== 拖拽 ======

function onDragStart(e: DragEvent, path: string) {
  draggingPath.value = path
  designerStore.setDraggingPath(path)
  e.dataTransfer!.effectAllowed = 'move'
  const target = e.target as HTMLElement
  if (target) {
    e.dataTransfer!.setDragImage(target, target.offsetWidth / 2, 20)
  }
}

// 确保拖拽结束后清空状态
function onDragEnd() {
  draggingPath.value = null
  designerStore.setDraggingPath(null)
}

function onDragOver(e: DragEvent, path: string) {
  if (draggingPath.value === path) return

  const target = e.currentTarget as HTMLElement
  if (!target) return

  const rect = target.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width
  const y = e.clientY - rect.top
  const height = rect.height

  // 底部 30% → 新增行
  if (y > height * 0.7) {
    const node = schemaStore.getNode(path)
    if (node) {
      const rowNum = node['x-row'] ?? 1
      dragOverRow.value = rowNum
      dragOverPath.value = null
      dragPosition.value = 'after'
      dropIntent.value = { type: 'insert-row', rowNum }
      return
    }
  }

  // 如果当前已经是 insert-row 意图，只有鼠标明确在上半部分才覆盖
  // 避免鼠标在 insert-line 附近时被意外覆盖（hysteresis: 0.7 进入, 0.2 退出）
  if (dropIntent.value?.type === 'insert-row' && y < height * 0.2) {
    return
  }

  // 水平位置 → before/after
  const pos = x < width / 2 ? 'before' : 'after'
  dragOverPath.value = path
  dragPosition.value = pos
  dragOverRow.value = null
  dropIntent.value = { type: 'insert-cell', path, position: pos }
}

function onDragLeave(e: DragEvent) {
  const relatedTarget = e.relatedTarget as HTMLElement
  const currentTarget = e.currentTarget as HTMLElement
  if (relatedTarget && currentTarget?.contains(relatedTarget)) return

  // 只清视觉状态，不清 dropIntent
  dragOverPath.value = null
  dragPosition.value = 'after'
  dragOverRow.value = null
}

function onDrop(e: DragEvent, targetPath: string) {
  // 先读取需要的数据
  const intent = dropIntent.value
  const materialName = designerStore.draggingMaterial
  const fromPath = designerStore.draggingPath

  // 清空所有状态
  dragOverPath.value = null
  dragOverRow.value = null
  dragPosition.value = 'after'
  dropIntent.value = null
  draggingPath.value = null
  designerStore.setDraggingPath(null)

  // ====== 根据意图执行 ======

  // 意图：插入新行
  if (intent?.type === 'insert-row') {
    onInsertRowDrop(e, intent.rowNum)
    designerStore.setDragging(null)
    return
  }

  // 从组件区拖入新组件
  if (materialName) {
    const material = registry.get(materialName)
    if (!material) return
    const targetNode = schemaStore.getNode(targetPath)
    if (!targetNode) return
    const targetRow = targetNode['x-row'] ?? 1
    const targetCol = targetNode['x-col'] ?? 1

    const name = `${materialName}_${nanoid(6)}`
    const node: FormilySchema = {
      name,
      ...JSON.parse(JSON.stringify(material.schema)),
      'x-row': targetRow,
      'x-col': targetCol,
      'x-label-placement': 'left',
    }

    // 意图：插入到组件前/后
    const pos = intent?.type === 'insert-cell' ? intent.position : 'after'
    if (pos === 'before') {
      insertNodeBefore(targetPath, node)
    } else {
      insertNodeAfter(targetPath, node)
    }

    designerStore.selectNode(fullPath(name))
    designerStore.setDragging(null)
    return
  }

  // 画布内拖拽排序
  if (fromPath && fromPath !== targetPath) {
    const fromNode = schemaStore.getNode(fromPath)
    if (!fromNode) return

    schemaStore.removeNode(fromPath)
    const fromName = fromPath.split('.').pop()!
    const clonedNode = JSON.parse(JSON.stringify(fromNode))
    clonedNode.name = fromName

    const pos = intent?.type === 'insert-cell' ? intent.position : 'after'
    if (pos === 'before') {
      insertNodeBefore(targetPath, clonedNode)
    } else {
      insertNodeAfter(targetPath, clonedNode)
    }

    designerStore.setDraggingPath(null)
    return
  }

  // 3. BO 字段拖入
  const boFieldJson = e.dataTransfer?.getData('bo-field')
  if (boFieldJson) {
    try {
      const field: BoField = JSON.parse(boFieldJson)
      const node = boFieldToSchema(field)
      const targetNode = schemaStore.getNode(targetPath)
      if (!targetNode) return
      const targetRow = targetNode['x-row'] ?? 1

      node['x-row'] = targetRow
      node['x-label-placement'] = 'left'

      const pos = intent?.type === 'insert-cell' ? intent.position : 'after'
      if (pos === 'before') {
        insertNodeBefore(targetPath, node)
      } else {
        insertNodeAfter(targetPath, node)
      }

      designerStore.selectNode(fullPath(field.name))
    } catch {
      console.warn('[SchemaRenderer] BO 字段解析失败')
    }
  }
}

// ====== 插入行 ======

function getRowItems(rowNum: number): Array<{ key: string; col: number }> {
  const properties = schemaStore.root.properties
  if (!properties) return []
  return Object.entries(properties)
    .filter(([, node]) => node['x-row'] === rowNum)
    .map(([key, node]) => ({ key, col: node['x-col'] ?? 999 }))
}

function onInsertRowDragOver(e: DragEvent, rowNum: number) {
  // 视觉
  dragOverRow.value = rowNum
  dragOverPath.value = null
  dragPosition.value = 'after'
  // 意图
  dropIntent.value = { type: 'insert-row', rowNum }
}

function onInsertRowDragLeave() {
  // 不清空 dropIntent！只清视觉
  dragOverRow.value = null
}

function onInsertRowDrop(e: DragEvent, afterRowNum: number) {
  // 先读取需要的数据
  const materialName = designerStore.draggingMaterial
  const fromPath = designerStore.draggingPath

  // 清空状态
  dragOverPath.value = null
  dragOverRow.value = null
  draggingPath.value = null
  designerStore.setDraggingPath(null)

  // 1. 从组件区拖入新组件
  if (materialName) {
    const material = registry.get(materialName)
    if (!material) return
    const name = `${materialName}_${nanoid(6)}`
    const node: FormilySchema = {
      name,
      ...JSON.parse(JSON.stringify(material.schema)),
      'x-row': afterRowNum + 1,
      'x-col': 1,
      'x-label-placement': 'left',
    }
    schemaStore.addNode(props.path, node)
    shiftRowsDown(afterRowNum + 1)
    designerStore.selectNode(fullPath(name))
    designerStore.setDragging(null)
    return
  }

  // 2. 画布内拖拽
  if (fromPath) {
    const fromNodeData = JSON.parse(JSON.stringify(schemaStore.getNode(fromPath)))
    schemaStore.removeNode(fromPath)
    shiftRowsDown(afterRowNum + 1)
    fromNodeData['x-row'] = afterRowNum + 1
    fromNodeData['x-col'] = 1
    schemaStore.addNode(props.path, fromNodeData)
    cleanEmptyRows()
    designerStore.setDraggingPath(null)
    return
  }

  // 3. BO 字段
  const boFieldJson = e.dataTransfer?.getData('bo-field')
  if (boFieldJson) {
    try {
      const field: BoField = JSON.parse(boFieldJson)
      const node = boFieldToSchema(field)
      node['x-row'] = afterRowNum + 1
      node['x-col'] = 1
      schemaStore.addNode(props.path, node)
      shiftRowsDown(afterRowNum + 1)
      designerStore.selectNode(fullPath(field.name))
    } catch {
      console.warn('[SchemaRenderer] BO 字段解析失败')
    }
  }
}

// ====== 容器拖放 ======

// 容器拖放函数
function onContainerDragOver(e: DragEvent, containerPath: string) {
  e.stopPropagation()
  if (designerStore.draggingMaterial || designerStore.draggingPath) {
    e.dataTransfer!.dropEffect = 'copy'
  }
}

function onContainerDragLeave(e: DragEvent) {
  e.stopPropagation()
}

function onContainerDrop(e: DragEvent, containerPath: string) {
  e.stopPropagation()

  const materialName = designerStore.draggingMaterial
  const fromPath = designerStore.draggingPath

  // 清空状态
  draggingPath.value = null
  designerStore.setDragging(null)
  designerStore.setDraggingPath(null)

  // 从组件区拖入新组件
  if (materialName) {
    const material = registry.get(materialName)
    if (!material) return

    const name = `${materialName}_${nanoid(6)}`
    const node: FormilySchema = {
      name,
      ...JSON.parse(JSON.stringify(material.schema)),
      'x-row': 1,
      'x-col': 1,
      'x-label-placement': 'left',
    }

    // 找到容器节点
    const containerNode = schemaStore.getNode(containerPath)
    if (!containerNode) return

    // 确保properties存在
    if (!containerNode.properties) {
      containerNode.properties = {}
    }

    // 添加到容器的properties中
    containerNode.properties[name] = node
    schemaStore.triggerUpdate()

    designerStore.selectNode(`${containerPath}.${name}`)
    return
  }

  // 画布内拖拽
  if (fromPath && fromPath !== containerPath) {
    const fromNode = schemaStore.getNode(fromPath)
    if (!fromNode) return

    // 检查是否是拖到自己的子组件中
    if (containerPath.startsWith(fromPath)) return

    // 移动组件
    schemaStore.removeNode(fromPath)
    const fromName = fromPath.split('.').pop()!
    const clonedNode = JSON.parse(JSON.stringify(fromNode))
    clonedNode.name = fromName

    // 确保目标容器的properties存在
    const containerNode = schemaStore.getNode(containerPath)
    if (!containerNode) return
    if (!containerNode.properties) {
      containerNode.properties = {}
    }

    containerNode.properties[fromName] = clonedNode
    schemaStore.triggerUpdate()
  }
}

// ====== 标签页内容区域拖放 ======

// 标签页插入索引（行索引，-1表示不显示）
const tabsRowIndex = ref(-1)
// 标签页列插入索引
const tabsColIndex = ref(-1)
// 标签页行高（用于列辅助线）
const tabsRowHeight = ref(0)
// 标签页的激活标签页索引
const tabsActiveIndices = ref<Record<string, number>>({})
// 列辅助线的绝对位置（固定定位）
const tabsColAbsX = ref(0)
const tabsColAbsY = ref(0)
// 行内相对位置（用于列索引计算）
const tabsRowRelX = ref(0)

// 获取行标记线数量
function getMarkerCount(tabsNode: FormilySchema, tabsPath: string): number {
  // 优先使用预先计算好的标记线数量
  const tops = tabsMarkerPositions.value[tabsPath]
  if (tops && tops.length > 0) return tops.length
  const rows = getActiveTabRows(tabsNode, tabsPath)
  if (rows.length === 0) return 1
  return rows.length + 1
}

// 存储每个标签页的标记线位置
const tabsMarkerPositions = ref<Record<string, number[]>>({})

// 更新指定标签页的标记线位置
function updateMarkerPositions(tabsPath: string, containerEl: HTMLElement) {
  const markersEl = containerEl.querySelector('.schema-renderer__tabs-markers')
  if (!markersEl) return
  const markersRect = markersEl.getBoundingClientRect()

  const rowEls = containerEl.querySelectorAll('.schema-renderer__tabs-row')
  const rowRects = Array.from(rowEls).map(el => el.getBoundingClientRect())
  const tops: number[] = []

  if (rowRects.length === 0) {
    tops.push(20)
  } else {
    tops.push(0) // 第一行之前 = markers顶部
    for (let i = 0; i < rowRects.length - 1; i++) {
      // 两行之间 = 上一行底部 + 间距(12px)/2
      tops.push(rowRects[i].bottom - markersRect.top + 2)
    }
    // 最后一行之后
    tops.push(rowRects[rowRects.length - 1].bottom - markersRect.top + 4)
  }

  tabsMarkerPositions.value = { ...tabsMarkerPositions.value, [tabsPath]: tops }
}

// 获取指定标签页的标记线top位置
function getMarkerTop(idx: number, tabsPath: string): number {
  const tops = tabsMarkerPositions.value[tabsPath]
  if (!tops || tops.length === 0) return 10
  if (idx < 0) return 0
  if (idx >= tops.length) return tops[tops.length - 1]
  return tops[idx]
}

function onTabsContentDragOver(e: DragEvent, tabsPath: string) {
  e.stopPropagation()
  // 只要有拖拽材料或拖拽路径，就允许放置
  if (designerStore.draggingMaterial || designerStore.draggingPath) {
    e.dataTransfer!.dropEffect = 'copy'
  }

  // 清除外部的辅助线状态
  dragOverPath.value = null
  dragOverRow.value = null
  dragPosition.value = 'after'

  // 获取当前激活的TabPane
  const activeTabPath = getActiveTabPath(tabsPath)
  const tabNode = schemaStore.getNode(activeTabPath)
  if (!tabNode?.properties) return

  // 获取所有行号并排序
  const rowNums = [...new Set(Object.values(tabNode.properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
  if (rowNums.length === 0) return

  // 更新标记线位置
  const target = e.currentTarget as HTMLElement
  updateMarkerPositions(tabsPath, target)
  const containerRect = target.getBoundingClientRect()

  // 先检测鼠标是否在某一行内部
  const rowEls = Array.from(target.querySelectorAll('.schema-renderer__tabs-row')) as HTMLElement[]
  let foundInRow = false
  for (let i = 0; i < rowEls.length; i++) {
    const r = rowEls[i].getBoundingClientRect()
    // 检查鼠标是否在行范围内（带2px容差，避免边界误判）
    if (e.clientY >= r.top - 2 && e.clientY <= r.bottom + 2) {
      // 在行内部 - 使用实际行号
      tabsRowIndex.value = rowNums[i]

      // 获取该行内的所有子组件（tabs-cell）
      const cellEls = rowEls[i].querySelectorAll('.schema-renderer__tabs-cell')
      const relX = e.clientX - r.left

      // 查找最近的组件边界
      let nearestBoundary = relX
      for (const cell of Array.from(cellEls)) {
        const cellRect = cell.getBoundingClientRect()
        const cellLeft = cellRect.left - r.left
        const cellRight = cellRect.right - r.left
        // 如果鼠标在组件内部，计算离左侧还是右侧更近
        if (relX >= cellLeft && relX <= cellRight) {
          if (relX - cellLeft < cellRight - relX) {
            nearestBoundary = cellLeft
          } else {
            nearestBoundary = cellRight
          }
          break
        }
      }

      // 列辅助线相对于容器的坐标（不用fixed定位）
      tabsColAbsX.value = (r.left + nearestBoundary) - containerRect.left
      tabsColAbsY.value = r.top - containerRect.top
      tabsRowHeight.value = r.height
      tabsRowRelX.value = nearestBoundary
      foundInRow = true
      break
    }
  }

  if (!foundInRow) {
    // 不在任何行内 - 保留 insertIdx 作为索引（用于显示标记线）
    let insertIdx = 0
    for (let i = 0; i < rowEls.length; i++) {
      const r = rowEls[i].getBoundingClientRect()
      if (e.clientY < r.top) {
        insertIdx = i
        break
      }
      insertIdx = i + 1
    }
    tabsRowIndex.value = insertIdx  // 索引，用于标记线显示
    tabsColAbsX.value = 0
    tabsColAbsY.value = 0
    tabsRowHeight.value = 0
  }
}

function onTabsContentDragLeave(e: DragEvent) {
  e.stopPropagation()
  // 重置标签页内所有辅助线状态
  tabsRowIndex.value = -1
  tabsColAbsX.value = 0
  tabsColAbsY.value = 0
  tabsRowHeight.value = 0
  tabsRowRelX.value = 0
}

function onTabsContentDrop(e: DragEvent, tabsPath: string) {
  e.stopPropagation()

  const materialName = designerStore.draggingMaterial
  const targetRowIdx = tabsRowIndex.value
  const targetColAbsX = tabsColAbsX.value
  const targetRowHeight = tabsRowHeight.value
  const targetRowRelX = tabsRowRelX.value

  // 重置标记
  tabsRowIndex.value = -1
  tabsColIndex.value = -1
  tabsRowHeight.value = 0
  tabsColAbsX.value = 0
  tabsColAbsY.value = 0
  tabsRowRelX.value = 0

  // 获取当前激活的TabPane路径
  const activeTabPath = getActiveTabPath(tabsPath)
  const tabNode = schemaStore.getNode(activeTabPath)
  if (!tabNode) return

  // 确保TabPane的properties存在
  if (!tabNode.properties) {
    tabNode.properties = {}
  }

  const properties = tabNode.properties as Record<string, FormilySchema>

  // 从组件区拖入新组件
  if (materialName) {
    const material = registry.get(materialName)
    if (!material) return

    const name = `${materialName}_${nanoid(6)}`
    const node: FormilySchema = {
      name,
      ...JSON.parse(JSON.stringify(material.schema)),
      'x-label-placement': 'left',
    }

    // 获取所有行号
    const rowNums = Object.keys(properties).length > 0
      ? [...new Set(Object.values(properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
      : []

    // 判断是插入到行内还是行之间
    console.log('[SchemaRenderer] 插入决策:', { targetColAbsX, targetRowHeight, targetRowIdx, rowNums })

    if (targetColAbsX > 0 && targetRowHeight > 0 && rowNums.includes(targetRowIdx)) {
      // 插入到已有行中（列插入）
      const targetRow = targetRowIdx
      const target = e.currentTarget as HTMLElement
      const containerRect = target.getBoundingClientRect()
      const rowIndex = rowNums.indexOf(targetRow)
      const rowEl = (target.querySelectorAll('.schema-renderer__tabs-row')[rowIndex]) as HTMLElement
      const rowWidth = rowEl?.getBoundingClientRect().width || containerRect.width
      const colWidth = rowWidth / 4
      const colIdx = Math.min(Math.max(Math.floor(targetRowRelX / colWidth), 0), 3)

      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) === targetRow && (n['x-col'] ?? 1) > colIdx) {
          n['x-col'] = (n['x-col'] ?? 1) + 1
        }
      }
      node['x-row'] = targetRow
      node['x-col'] = colIdx + 1
    } else if (rowNums.length > 0 && targetRowIdx >= 0 && targetRowIdx < rowNums.length) {
      // 在两行之间插入新行（targetRowIdx是索引，转换为行号）
      const targetRowNum = rowNums[targetRowIdx]
      console.log('[SchemaRenderer] 行间插入:', { targetRowIdx, targetRowNum, beforeRows: [...rowNums] })
      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) >= targetRowNum) {
          n['x-row'] = (n['x-row'] ?? 1) + 1
        }
      }
      node['x-row'] = targetRowNum
      node['x-col'] = 1
    } else if (rowNums.length > 0) {
      // 插入到最后一行之后（新增一行）
      node['x-row'] = Math.max(...rowNums) + 1
      node['x-col'] = 1
    } else {
      // 没有已有组件
      node['x-row'] = 1
      node['x-col'] = 1
    }

    properties[name] = node
    schemaStore.triggerUpdate()

    designerStore.selectNode(`${activeTabPath}.${name}`)
  } else if (designerStore.draggingPath) {
    // 画布内拖拽（从页签组件内或其他位置拖拽组件）
    const fromPath = designerStore.draggingPath
    const fromNode = schemaStore.getNode(fromPath)
    if (!fromNode) return

    // 检查是否是拖到自己的子组件中
    if (activeTabPath.startsWith(fromPath)) return

    // 获取源组件的父节点路径
    const fromSegments = fromPath.split('.')
    const fromParentPath = fromSegments.slice(0, -1).join('.')
    const fromName = fromSegments[fromSegments.length - 1]

    // 从源父节点中移除组件
    const fromParentNode = schemaStore.getNode(fromParentPath)
    if (fromParentNode?.properties) {
      delete fromParentNode.properties[fromName]
    }

    // 计算目标位置
    const rowNums = Object.keys(properties).length > 0
      ? [...new Set(Object.values(properties).map((n: any) => n['x-row'] ?? 1))].sort((a, b) => a - b)
      : []

    const clonedNode = JSON.parse(JSON.stringify(fromNode))
    clonedNode.name = fromName

    // 判断是插入到行内还是行之间
    if (targetColAbsX > 0 && targetRowHeight > 0 && rowNums.includes(targetRowIdx)) {
      // 插入到已有行中（列插入）
      const targetRow = targetRowIdx
      const target = e.currentTarget as HTMLElement
      const containerRect = target.getBoundingClientRect()
      const rowIndex = rowNums.indexOf(targetRow)
      const rowEl = (target.querySelectorAll('.schema-renderer__tabs-row')[rowIndex]) as HTMLElement
      const rowWidth = rowEl?.getBoundingClientRect().width || containerRect.width
      const colWidth = rowWidth / 4
      const colIdx = Math.min(Math.max(Math.floor(targetRowRelX / colWidth), 0), 3)

      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) === targetRow && (n['x-col'] ?? 1) > colIdx) {
          n['x-col'] = (n['x-col'] ?? 1) + 1
        }
      }
      clonedNode['x-row'] = targetRow
      clonedNode['x-col'] = colIdx + 1
    } else if (rowNums.length > 0 && targetRowIdx >= 0 && targetRowIdx < rowNums.length) {
      // 在两行之间插入新行
      const targetRowNum = rowNums[targetRowIdx]
      for (const n of Object.values(properties)) {
        if ((n['x-row'] ?? 1) >= targetRowNum) {
          n['x-row'] = (n['x-row'] ?? 1) + 1
        }
      }
      clonedNode['x-row'] = targetRowNum
      clonedNode['x-col'] = 1
    } else if (rowNums.length > 0) {
      // 插入到最后一行之后
      clonedNode['x-row'] = Math.max(...rowNums) + 1
      clonedNode['x-col'] = 1
    } else {
      // 没有已有组件
      clonedNode['x-row'] = 1
      clonedNode['x-col'] = 1
    }

    properties[fromName] = clonedNode
    schemaStore.triggerUpdate()

    designerStore.selectNode(`${activeTabPath}.${fromName}`)
  }

  // 清空状态
  draggingPath.value = null
  designerStore.setDragging(null)
  designerStore.setDraggingPath(null)
}

function onChildDragStart(e: DragEvent, path: string) {
  draggingPath.value = path
  designerStore.setDraggingPath(path)
  e.dataTransfer!.effectAllowed = 'copyMove'
  // 设置拖拽图片为当前元素，而不是整个父容器
  const target = e.target as HTMLElement
  if (target) {
    // 找到最近的可拖拽元素作为拖拽图片
    const dragElement = target.closest('[draggable="true"]') || target
    e.dataTransfer!.setDragImage(dragElement, dragElement.offsetWidth / 2, 20)
  }
}

// ====== 布局容器拖拽状态 ======

// 布局容器行索引（-1表示不显示）
const layoutRowIndex = ref(-1)
// 布局容器行高（用于列辅助线）
const layoutRowHeight = ref(0)
// 列辅助线的绝对位置
const layoutColAbsX = ref(0)
const layoutColAbsY = ref(0)
// 行内相对位置（用于列索引计算）
const layoutRowRelX = ref(0)
// 存储每个布局容器的标记线位置
const layoutMarkerPositions = ref<Record<string, number[]>>({})

// 获取布局容器行标记线数量
function getLayoutMarkerCount(layoutNode: FormilySchema, layoutPath: string): number {
  const tops = layoutMarkerPositions.value[layoutPath]
  if (tops && tops.length > 0) return tops.length
  const rows = getLayoutContainerRows(layoutNode, layoutPath)
  if (rows.length === 0) return 1
  return rows.length + 1
}

// 更新布局容器标记线位置
function updateLayoutMarkerPositions(layoutPath: string, containerEl: HTMLElement) {
  const markersEl = containerEl.querySelector('.schema-renderer__layout-markers')
  if (!markersEl) return
  const markersRect = markersEl.getBoundingClientRect()

  const rowEls = containerEl.querySelectorAll('.schema-renderer__layout-row')
  const rowRects = Array.from(rowEls).map(el => el.getBoundingClientRect())
  const tops: number[] = []

  if (rowRects.length === 0) {
    tops.push(20)
  } else {
    tops.push(0)
    for (let i = 0; i < rowRects.length - 1; i++) {
      tops.push(rowRects[i].bottom - markersRect.top + 2)
    }
    tops.push(rowRects[rowRects.length - 1].bottom - markersRect.top + 4)
  }

  layoutMarkerPositions.value = { ...layoutMarkerPositions.value, [layoutPath]: tops }
}

// 获取布局容器标记线top位置
function getLayoutMarkerTop(idx: number, layoutPath: string): number {
  const tops = layoutMarkerPositions.value[layoutPath]
  if (!tops || tops.length === 0) return 10
  if (idx < 0) return 0
  if (idx >= tops.length) return tops[tops.length - 1]
  return tops[idx]
}

// ====== 空画布 ======

function onEmptyDragOver(e: DragEvent) {
  if (designerStore.draggingMaterial && e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

function onEmptyDrop(e: DragEvent) {
  // 先读取 materialName
  const materialName = designerStore.draggingMaterial

  // 清空状态（在读取之后）
  draggingPath.value = null
  designerStore.setDraggingPath(null)

  if (materialName) {
    const material = registry.get(materialName)
    if (!material) return
    const name = `${materialName}_${nanoid(6)}`
    const node: FormilySchema = {
      name,
      ...JSON.parse(JSON.stringify(material.schema)),
      'x-row': 1,
      'x-col': 1,
      'x-label-placement': 'left',
    }
    schemaStore.addNode(props.path, node)
    designerStore.selectNode(fullPath(name))
    designerStore.setDragging(null)
    return
  }

  // BO 字段拖入
  const boFieldJson = e.dataTransfer?.getData('bo-field')
  if (boFieldJson) {
    try {
      const field: BoField = JSON.parse(boFieldJson)
      const node = boFieldToSchema(field)
      node['x-row'] = 1
      node['x-col'] = 1
      schemaStore.addNode(props.path, node)
      designerStore.selectNode(fullPath(field.name))
    } catch {
      console.warn('[SchemaRenderer] BO 字段解析失败')
    }
  }
}
</script>

<style scoped lang="less">
.schema-renderer {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  min-height: 100%;

  &__row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 12px;
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;

    &:hover {
      border-color: #cbd5e1;
      box-shadow: var(--shadow-sm);
    }
  }

  // 移动端样式
  .canvas__mobile-frame & {
    &__row {
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 8px 0;
      background: transparent;
      border: none;
    }

    &__cell-wrapper {
      grid-column: span 1 !important;
    }

    &__cell {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 12px;
    }

    &__insert-line {
      display: none;
    }
  }

  &__cell-wrapper {
    position: relative;
  }

  &__cell {
    position: relative;
    min-height: 52px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    cursor: grab;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
    }

    &:active {
      cursor: grabbing;
      box-shadow: var(--shadow-lg);
    }

    &--dragging {
      opacity: 0.4;
      transform: scale(0.98);
      border-style: dashed;
    }

    &--drag-over {
      border-color: var(--primary-color);
      border-style: dashed;
      background: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
    }
  }

  // 竖线指示器
  &__vertical-line {
    position: absolute;
    top: 4px;
    bottom: 4px;
    width: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
    animation: pulse-vertical 1s ease-in-out infinite;
    z-index: 10;
    pointer-events: none;

    &--left {
      left: -2px;
    }

    &--right {
      right: -2px;
    }
  }

  // 横线指示器（下方添加新行）
  &__horizontal-line {
    position: absolute;
    left: 4px;
    right: 4px;
    bottom: 0;
    height: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
    animation: pulse-horizontal 1s ease-in-out infinite;
    z-index: 10;
    pointer-events: none;
  }

  // 插入行横线
  &__insert-line {
    height: 24px;
    transition: all 0.15s ease;

    &::after {
      content: '';
      display: block;
      height: 3px;
      margin: 10px 16px;
      border-radius: 2px;
      background: transparent;
      transition: all 0.15s ease;
    }

    &--active {
      &::after {
        background: var(--primary-color);
        box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
      }
    }
  }

  // 容器拖放区域样式
  &__container-dropzone {
    min-height: 80px;
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
    padding: 12px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }
  }

  &__container-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    color: var(--text-tertiary);
    font-size: 13px;
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-primary);
  }

  // 布局容器样式
  &__layout-container {
    width: 100%;
    min-height: 100px;
    border: 2px dashed var(--primary-color);
    border-radius: var(--radius-md);
    background: var(--primary-light);
    padding: 16px;
    box-sizing: border-box;
    position: relative;
  }

  &__layout-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: var(--radius-md);
    border: 2px solid transparent;
    transition: all 0.2s;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__layout-cell {
    position: relative;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    padding: 10px;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      border-color: var(--primary-color);
    }

    &--selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
    }

    &--dragging {
      opacity: 0.4;
      border-style: dashed;
    }
  }

  // 布局容器标记线样式
  &__layout-markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
    overflow: hidden;
  }

  &__layout-marker {
    position: absolute;
    left: 16px;
    right: 16px;
    height: 4px;
    display: flex;
    align-items: center;
    transition: all 0.2s;

    &--active &-line {
      background: var(--primary-color);
      box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
    }

    &-line {
      width: 100%;
      height: 3px;
      background: transparent;
      border-radius: 2px;
      transition: all 0.2s;
    }
  }

  // 布局容器列标记线样式
  &__layout-col-marker {
    position: absolute;
    width: 4px;
    height: 20px;
    transform: translateX(-2px);
    z-index: 11;

    &-line {
      width: 3px;
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
      animation: pulse-vertical 1s ease-in-out infinite;
    }
  }

  &__child-item {
    padding: 8px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    margin-bottom: 8px;
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  // 标签页内容区域样式
  &__tabs-content {
    position: relative;
    width: 100%;
    min-height: 100px;
    border: 2px dashed var(--primary-color);
    border-radius: var(--radius-md);
    background: var(--primary-light);
    padding: 16px;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  &__tabs-pane {
    width: 100%;
    min-height: 80px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    padding: 12px;
    box-sizing: border-box;
  }

  // 标签页标题样式
  &__tabs-header {
    display: flex;
    gap: 0;
    margin-bottom: 8px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  &__tabs-tab {
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;

    &:hover {
      color: var(--primary-color);
      background: var(--bg-primary);
    }

    &--active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      background: var(--bg-primary);
    }
  }

  &__tabs-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: var(--radius-md);
    border: 2px solid transparent;
    transition: all 0.2s;

    &:last-child {
      margin-bottom: 0;
    }

    &--target {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }
  }

  &__tabs-cell {
    position: relative;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    padding: 10px;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      border-color: var(--primary-color);
    }

    &--selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
      box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
    }

    &--dragging {
      opacity: 0.4;
      border-style: dashed;
    }
  }

  // 标记线样式
  &__tabs-markers {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
    overflow: hidden;
  }

  &__tabs-marker {
    position: absolute;
    left: 16px;
    right: 16px;
    height: 4px;
    display: flex;
    align-items: center;
    transition: all 0.2s;

    &--active &-line {
      background: var(--primary-color);
      box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
    }

    &-line {
      width: 100%;
      height: 3px;
      background: transparent;
      border-radius: 2px;
      transition: all 0.2s;
    }
  }

  // 列标记线样式
  &__tabs-col-marker {
    position: absolute;
    width: 4px;
    height: 20px;
    transform: translateX(-2px);
    z-index: 11;

    &-line {
      width: 3px;
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
      animation: pulse-vertical 1s ease-in-out infinite;
    }
  }

  &__empty {
    min-height: 300px;
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text-tertiary);
    font-size: 14px;
    transition: all 0.3s ease;
    background: var(--bg-primary);

    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--primary-light);
      box-shadow: inset 0 0 30px rgba(79, 110, 247, 0.05);
    }

    &::before {
      content: '+';
      font-size: 40px;
      font-weight: 300;
      line-height: 1;
      opacity: 0.3;
      transition: all 0.3s;
    }

    &:hover::before {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }
}

@keyframes pulse-vertical {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 12px rgba(79, 110, 247, 0.7);
  }
}

@keyframes pulse-horizontal {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(79, 110, 247, 0.5);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 12px rgba(79, 110, 247, 0.7);
  }
}
</style>

<!-- 移动端全局样式（非 scoped，确保覆盖子组件样式） -->
<style>
/* 移动端：每层容器都撑满宽度 */
.canvas__mobile-frame .schema-renderer__preview-wrap {
  width: 100%;
}

.canvas__mobile-frame .schema-renderer__preview-wrap .component-preview {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  width: 100% !important;
}

.canvas__mobile-frame .schema-renderer__preview-wrap .component-preview--inline {
  flex-direction: column !important;
  align-items: stretch !important;
}

.canvas__mobile-frame .schema-renderer__preview-wrap .component-preview__label {
  font-size: 14px !important;
  width: 100% !important;
}

.canvas__mobile-frame .schema-renderer__preview-wrap .component-preview__control {
  width: 100% !important;
}

/* 移动端：所有输入控件撑满 */
.canvas__mobile-frame .schema-renderer__preview-wrap input.ant-input,
.canvas__mobile-frame .schema-renderer__preview-wrap .ant-input-number,
.canvas__mobile-frame .schema-renderer__preview-wrap .ant-select,
.canvas__mobile-frame .schema-renderer__preview-wrap .ant-picker,
.canvas__mobile-frame .schema-renderer__preview-wrap textarea.ant-input,
.canvas__mobile-frame .schema-renderer__preview-wrap .ant-input-affix-wrapper {
  width: 100% !important;
  max-width: 100% !important;
}

/* 移动端：DesignableShell 去掉多余 padding */
.canvas__mobile-frame .designable-shell {
  padding: 0 !important;
}
</style>
