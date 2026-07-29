<template>
  <div class="datasource-tree">
    <!-- BO 选择器 -->
    <div class="datasource-tree__selector">
      <a-select
        :value="designerStore.selectedBoName"
        placeholder="选择业务对象"
        size="small"
        style="width: 100%"
        @change="designerStore.selectBo($event)"
      >
        <a-select-option v-for="bo in designerStore.boTables" :key="bo.name" :value="bo.name">
          <span>{{ bo.label }}</span>
          <a-tag v-if="bo.isMain" color="blue" size="small" style="margin-left: 4px; font-size: 10px">主表</a-tag>
          <a-tag v-else color="orange" size="small" style="margin-left: 4px; font-size: 10px">子表</a-tag>
        </a-select-option>
      </a-select>
    </div>

    <!-- BO 表 + 字段树 -->
    <div v-if="currentBo" class="datasource-tree__content">
      <div class="datasource-tree__bo-header">
        <DatabaseOutlined style="color: #1677ff" />
        <span class="datasource-tree__bo-name">{{ currentBo.label }}</span>
        <a-tag :color="currentBo.isMain ? 'blue' : 'orange'" size="small">
          {{ currentBo.isMain ? '主表' : '子表' }}
        </a-tag>
      </div>

      <!-- 主表字段 -->
      <div v-if="currentBo.isMain" class="datasource-tree__section">
        <div class="datasource-tree__section-title">主表字段</div>
        <div
          v-for="field in currentBo.fields"
          :key="field.name"
          class="datasource-tree__field"
          draggable="true"
          @dragstart="onFieldDragStart($event, field)"
          @dragend="onDragEnd"
        >
          <component :is="getFieldIcon(field.type)" class="datasource-tree__field-icon" />
          <span class="datasource-tree__field-label">{{ field.label }}</span>
          <span class="datasource-tree__field-name">{{ field.name }}</span>
          <a-tag v-if="field.required" color="red" size="small" style="font-size: 10px">必填</a-tag>
        </div>
      </div>

      <!-- 子表字段列表 -->
      <div v-if="childTables.length > 0" class="datasource-tree__section">
        <div class="datasource-tree__section-title">子表</div>
        <div v-for="child in childTables" :key="child.name" class="datasource-tree__child-table">
          <div class="datasource-tree__child-header" @click="toggleChild(child.name)">
            <RightOutlined v-if="!expandedChilds.has(child.name)" />
            <DownOutlined v-else />
            <TableOutlined style="color: #fa8c16" />
            <span>{{ child.label }}</span>
            <a-tag color="orange" size="small">子表</a-tag>
          </div>
          <div v-if="expandedChilds.has(child.name)" class="datasource-tree__child-fields">
            <div
              v-for="field in child.fields"
              :key="field.name"
              class="datasource-tree__field"
              draggable="true"
              @dragstart="onFieldDragStart($event, field)"
              @dragend="onDragEnd"
            >
              <component :is="getFieldIcon(field.type)" class="datasource-tree__field-icon" />
              <span class="datasource-tree__field-label">{{ field.label }}</span>
              <span class="datasource-tree__field-name">{{ field.name }}</span>
              <a-tag v-if="field.required" color="red" size="small" style="font-size: 10px">必填</a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="datasource-tree__empty">
      <DatabaseOutlined style="font-size: 32px; color: #d9d9d9" />
      <p>请选择业务对象</p>
      <p class="datasource-tree__empty-hint">选择 BO 后可拖拽字段到设计区</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDesignerStore, type BoField, type BoTable } from '@/stores/designer'
import { useSchemaStore } from '@/stores/schema'
import { registry } from '@/engine/registry'
import { boFieldToSchema } from '@/ipass/bo-mapping'
import { nanoid } from 'nanoid'
import {
  DatabaseOutlined,
  TableOutlined,
  RightOutlined,
  DownOutlined,
  FieldStringOutlined,
  FieldNumberOutlined,
  CalendarOutlined,
  SwitcherOutlined,
  SelectOutlined,
} from '@ant-design/icons-vue'

const designerStore = useDesignerStore()
const schemaStore = useSchemaStore()
const expandedChilds = ref<Set<string>>(new Set())

const currentBo = computed(() => {
  if (!designerStore.selectedBoName) return null
  return designerStore.boTables.find(t => t.name === designerStore.selectedBoName) ?? null
})

const childTables = computed(() => {
  return designerStore.boTables.filter(t => !t.isMain)
})

function toggleChild(name: string) {
  if (expandedChilds.value.has(name)) {
    expandedChilds.value.delete(name)
  } else {
    expandedChilds.value.add(name)
  }
  // trigger reactivity
  expandedChilds.value = new Set(expandedChilds.value)
}

function getFieldIcon(type: string) {
  const map: Record<string, any> = {
    STRING: FieldStringOutlined,
    TEXT: FieldStringOutlined,
    INTEGER: FieldNumberOutlined,
    DECIMAL: FieldNumberOutlined,
    DATE: CalendarOutlined,
    BOOLEAN: SwitcherOutlined,
    ENUM: SelectOutlined,
    REF: SelectOutlined,
  }
  return map[type] || FieldStringOutlined
}

function onFieldDragStart(e: DragEvent, field: BoField) {
  designerStore.setDragging('bo-field')
  e.dataTransfer!.setData('bo-field', JSON.stringify(field))
  e.dataTransfer!.effectAllowed = 'copy'
}

function onDragEnd() {
  designerStore.setDragging(null)
}
</script>

<style scoped lang="less">
.datasource-tree {
  &__selector {
    margin-bottom: 20px;
  }

  &__bo-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    margin-bottom: 20px;
    border: 1px solid var(--border-color);
  }

  &__bo-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__section {
    margin-bottom: 20px;
  }

  &__section-title {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-bottom: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-md);
    cursor: grab;
    transition: all 0.2s ease;
    font-size: 13px;
    color: var(--text-primary);

    &:hover {
      background: var(--primary-light);
      color: var(--primary-color);
      box-shadow: var(--shadow-sm);
    }

    &:active {
      cursor: grabbing;
      transform: translateY(1px);
    }
  }

  &__field-icon {
    font-size: 14px;
    color: var(--text-tertiary);

    .datasource-tree__field:hover & {
      color: var(--primary-color);
    }
  }

  &__field-label {
    font-weight: 500;
  }

  &__field-name {
    color: var(--text-tertiary);
    font-size: 11px;
    margin-left: auto;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
  }

  &__child-table {
    margin-bottom: 10px;
  }

  &__child-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 13px;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--primary-light);
      color: var(--primary-color);
      border-color: var(--primary-color);
    }
  }

  &__child-fields {
    padding-left: 20px;
    margin-top: 10px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    color: var(--text-tertiary);
    font-size: 13px;
    text-align: center;

    p {
      margin: 8px 0 0;
    }
  }

  &__empty-hint {
    font-size: 11px;
    color: var(--text-tertiary);
    opacity: 0.6;
  }
}
</style>
