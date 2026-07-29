<template>
  <div class="source-panel">
    <a-tabs v-model:activeKey="activeTab" size="small" class="source-panel__tabs">
      <a-tab-pane key="components" tab="组件">
        <div class="source-panel__content">
          <div v-for="[group, items] in groups" :key="group" class="source-panel__group">
            <div class="source-panel__group-title">{{ group }}</div>
            <div class="source-panel__items">
              <div
                v-for="item in items"
                :key="item.name"
                class="source-panel__item"
                draggable="true"
                @dragstart="onDragStart($event, item)"
                @click="onItemClick(item)"
              >
                <span class="source-panel__item-icon">
                  <component :is="item.icon" v-if="item.icon" />
                  <span v-else class="source-panel__item-dot" />
                </span>
                <span class="source-panel__item-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="datasource" tab="数据源">
        <div class="source-panel__content">
          <DataSourceTree />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { registry } from '@/engine/registry'
import { useDesignerStore } from '@/stores/designer'
import { useSchemaStore } from '@/stores/schema'
import type { MaterialDescriptor } from '@/types'
import DataSourceTree from './DataSourceTree.vue'
import { nanoid } from 'nanoid'

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()
const activeTab = ref('components')

const groups = computed(() => {
  return registry.getGroups()
})

function onDragStart(e: DragEvent, item: MaterialDescriptor) {
  designerStore.setDragging(item.name)
  e.dataTransfer!.setData('material-name', item.name)
  e.dataTransfer!.effectAllowed = 'copy'
}

function onItemClick(item: MaterialDescriptor) {
  const name = generateName(item.name)
  const node: any = {
    name,
    ...JSON.parse(JSON.stringify(item.schema)),
    'x-label-placement': 'left',
  }

  // 计算新的 x-row 和 x-col
  const root = schemaStore.root
  if (!root.properties) root.properties = {}
  const existing = Object.values(root.properties)
  if (existing.length === 0) {
    node['x-row'] = 1
    node['x-col'] = 1
  } else {
    // 找到最大行号和该行的组件数
    let maxRow = 0
    const rowCounts = new Map<number, number>()
    for (const child of existing) {
      const r = child['x-row'] ?? 0
      if (r > maxRow) maxRow = r
      rowCounts.set(r, (rowCounts.get(r) ?? 0) + 1)
    }
    const lastRow = rowCounts.get(maxRow) ?? 0
    if (lastRow < 4) {
      node['x-row'] = maxRow
      node['x-col'] = lastRow + 1
    } else {
      node['x-row'] = maxRow + 1
      node['x-col'] = 1
    }
  }

  schemaStore.addNode('', node)
  designerStore.selectNode(name)
}

function generateName(base: string): string {
  return `${base}_${nanoid(6)}`
}
</script>

<style scoped lang="less">
.source-panel {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.ant-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-tabs-content-holder) {
    flex: 1;
    overflow-y: auto;
  }

  :deep(.ant-tabs-nav) {
    padding: 0 16px;
    margin-bottom: 0;
    border-bottom: 1px solid var(--border-color) !important;
  }

  :deep(.ant-tabs-tab) {
    padding: 12px 0 !important;
    margin: 0 16px 0 0 !important;
    font-size: 13px;
    color: var(--text-secondary);

    &.ant-tabs-tab-active {
      color: var(--primary-color);
    }
  }

  &__tabs {
    height: 100%;
  }

  &__content {
    padding: 16px;
  }

  &__group {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__group-title {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-bottom: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  &__items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    cursor: grab;
    font-size: 13px;
    color: var(--text-primary);
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
      border-color: var(--primary-color);
      background: var(--primary-light);
      color: var(--primary-color);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    &:active {
      cursor: grabbing;
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
  }

  &__item-icon {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--text-tertiary);

    .source-panel__item:hover & {
      color: var(--primary-color);
    }
  }

  &__item-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color) 0%, #818cf8 100%);
  }

  &__item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }
}
</style>
