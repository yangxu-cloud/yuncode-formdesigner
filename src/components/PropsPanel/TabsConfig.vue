<template>
  <div class="tabs-config">
    <div class="tabs-config__header">
      <span class="tabs-config__title">标签页管理</span>
      <a-button size="small" type="primary" @click="addTab">
        <template #icon><PlusOutlined /></template>
        添加标签页
      </a-button>
    </div>

    <!-- 标签页列表 -->
    <div class="tabs-config__list">
      <div
        v-for="(tab, index) in tabsList"
        :key="tab.key"
        class="tabs-config__item"
      >
        <div class="tabs-config__item-content">
          <span class="tabs-config__item-icon">
            <TableOutlined />
          </span>
          <a-input
            v-model:value="tab.title"
            size="small"
            class="tabs-config__item-input"
            @change="onTabTitleChange(index)"
          />
        </div>
        <a-button
          v-if="tabsList.length > 1"
          size="small"
          type="text"
          danger
          @click="removeTab(index)"
        >
          <template #icon><DeleteOutlined /></template>
        </a-button>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="tabs-config__tip">
      <a-alert
        message="标签页配置说明"
        type="info"
        show-icon
        :closable="false"
      >
        <template #description>
          <ul class="tabs-config__tip-list">
            <li>修改标签页名称后按回车确认</li>
            <li>可以添加或删除标签页</li>
            <li>删除标签页会同时删除该标签页下的所有组件</li>
          </ul>
        </template>
      </a-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import { PlusOutlined, DeleteOutlined, TableOutlined } from '@ant-design/icons-vue'
import { nanoid } from 'nanoid'

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 标签页列表
const tabsList = ref<Array<{ key: string; title: string }>>([])

// 当前选中的节点
const selectedNode = computed(() => {
  if (!designerStore.selectedPath) return null
  return schemaStore.getNode(designerStore.selectedPath)
})

// 初始化标签页列表
function initTabsList() {
  if (!selectedNode.value?.properties) {
    tabsList.value = []
    return
  }

  const properties = selectedNode.value.properties as Record<string, any>
  const tabs: Array<{ key: string; title: string }> = []
  for (const [key, node] of Object.entries(properties)) {
    if (node['x-component'] === 'TabPane') {
      tabs.push({
        key,
        title: node['x-component-props']?.tab || node.title || key,
      })
    }
  }
  tabsList.value = tabs
}

// 监听节点变化
watch(selectedNode, () => {
  initTabsList()
}, { immediate: true })

// 添加标签页
function addTab() {
  if (!selectedNode.value) return

  const tabNum = tabsList.value.length + 1
  const tabKey = `tab${tabNum}_${nanoid(6)}`

  // 添加到properties
  if (!selectedNode.value.properties) {
    selectedNode.value.properties = {}
  }

  const properties = selectedNode.value.properties as Record<string, any>
  properties[tabKey] = {
    type: 'object',
    title: `标签页${tabNum}`,
    'x-component': 'TabPane',
    'x-component-props': {
      tab: `标签页${tabNum}`,
    },
    properties: {},
  }

  schemaStore.triggerUpdate()
  initTabsList()
}

// 删除标签页
function removeTab(index: number) {
  if (!selectedNode.value) return

  const tabKey = tabsList.value[index].key
  const properties = selectedNode.value.properties as Record<string, any>
  delete properties[tabKey]

  schemaStore.triggerUpdate()
  initTabsList()
}

// 修改标签页名称
function onTabTitleChange(index: number) {
  if (!selectedNode.value) return

  const tab = tabsList.value[index]
  const properties = selectedNode.value.properties as Record<string, any>
  const node = properties[tab.key]
  if (node) {
    node.title = tab.title
    if (node['x-component-props']) {
      node['x-component-props'].tab = tab.title
    }
    schemaStore.triggerUpdate()
  }
}
</script>

<style scoped lang="less">
.tabs-config {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    transition: all 0.2s;

    &:hover {
      border-color: var(--primary-color);
    }
  }

  &__item-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__item-icon {
    color: var(--primary-color);
  }

  &__item-input {
    flex: 1;
  }

  &__tip {
    margin-top: 12px;
  }

  &__tip-list {
    margin: 8px 0 0 0;
    padding-left: 16px;
    font-size: 12px;
    color: var(--text-secondary);

    li {
      margin-bottom: 4px;
    }
  }
}
</style>
