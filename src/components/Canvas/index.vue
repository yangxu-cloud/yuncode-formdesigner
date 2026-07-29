<template>
  <div class="canvas">
    <div class="canvas__header">
      <div class="canvas__title">
        <FormOutlined class="canvas__title-icon" />
        表单设计区
      </div>

      <!-- 撤销/重做 -->
      <a-tooltip title="撤销">
        <a-button
          size="small"
          :disabled="!schemaStore.canUndo()"
          @click="schemaStore.undo()"
        >
          <template #icon><UndoOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="重做">
        <a-button
          size="small"
          :disabled="!schemaStore.canRedo()"
          @click="schemaStore.redo()"
        >
          <template #icon><RedoOutlined /></template>
        </a-button>
      </a-tooltip>

      <div class="canvas__divider"></div>

      <!-- 设备切换 -->
      <a-segmented v-model:value="deviceMode" :options="deviceOptions" size="small" />

      <div class="canvas__divider"></div>

      <!-- 操作按钮 -->
      <a-tooltip title="预览">
        <a-button size="small" @click="showPreview = true">
          <template #icon><EyeOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="查看源码">
        <a-button size="small" @click="showSourceCode = true">
          <template #icon><CodeOutlined /></template>
        </a-button>
      </a-tooltip>
      <a-tooltip title="导出 Schema">
        <a-button size="small" type="primary" @click="onExport">
          <template #icon><ExportOutlined /></template>
          导出
        </a-button>
      </a-tooltip>
    </div>
    <div class="canvas__body" :class="{ 'canvas__body--mobile': isMobile }">
      <div v-if="isMobile" class="canvas__mobile-frame">
        <SchemaRenderer :schema="schemaStore.root" path="" :is-mobile="true" />
      </div>
      <SchemaRenderer v-else :schema="schemaStore.root" path="" />
    </div>

    <!-- 预览弹窗 -->
    <FormPreview v-model:open="showPreview" :schema="schemaStore.root" :is-mobile="isMobile" />

    <!-- 源码弹窗 -->
    <SourceCode v-model:open="showSourceCode" :schema="schemaStore.root" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import SchemaRenderer from './SchemaRenderer.vue'
import FormPreview from '../Preview/index.vue'
import SourceCode from '../SourceCode/index.vue'
import {
  UndoOutlined,
  RedoOutlined,
  EyeOutlined,
  CodeOutlined,
  ExportOutlined,
  DesktopOutlined,
  MobileOutlined,
  FormOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const schemaStore = useSchemaStore()
const showPreview = ref(false)
const showSourceCode = ref(false)
const deviceMode = ref('pc')

const isMobile = computed(() => deviceMode.value === 'mobile')

// 设备选项
const deviceOptions = [
  { label: () => h('span', [h(DesktopOutlined), ' PC端']), value: 'pc' },
  { label: () => h('span', [h(MobileOutlined), ' 移动端']), value: 'mobile' },
]

function onExport() {
  const json = schemaStore.exportSchema()
  navigator.clipboard.writeText(json).then(() => {
    message.success('Schema 已复制到剪贴板')
  }).catch(() => {
    console.log('[Schema Export]', json)
    message.info('Schema 已输出到控制台')
  })
}
</script>

<style scoped lang="less">
.canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: visible;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    //background: linear-gradient(135deg, #4f6ef7 0%, #6b5ce7 100%);
    background: linear-gradient(135deg, #8ac6c4 0%, #6b5ce7 100%);
    border-bottom: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-right: auto;
    white-space: nowrap;
  }

  &__title-icon {
    font-size: 14px;
  }

  &__divider {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 2px;
  }

  &__segment-label {
    font-size: 11px;
  }

  &__body {
    flex: 1;
    width: 100%;
    overflow: auto;
    padding: 16px;
    background: var(--bg-tertiary);

    &--mobile {
      display: flex;
      justify-content: center;
      padding: 24px;
    }
  }

  &__mobile-frame {
    width: 375px;
    min-height: 667px;
    background: #fff;
    border: 8px solid #1a1a2e;
    border-radius: 32px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    overflow-y: auto;
  }
}

// 工具栏按钮样式优化
:deep(.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  padding: 0 10px;
  height: 28px;
  min-width: 28px;
  transition: all 0.2s ease;
  border: none;
}

:deep(.ant-btn-default) {
  background: rgba(255, 255, 255, 0.9);
  color: #4f6ef7;

  &:hover {
    background: #fff;
    color: #3d5bd9;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.5);
    color: rgba(79, 110, 247, 0.4);
  }
}

:deep(.ant-btn-primary) {
  background: #fff;
  color: #4f6ef7;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #f5f5f5;
    color: #3d5bd9;
  }
}

:deep(.ant-segmented) {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px;
  border-radius: 6px;

  :deep(.ant-segmented-item) {
    color: #4f6ef7;
    min-height: 26px;
    line-height: 26px;
    font-size: 12px;
    border-radius: 5px;
    padding: 0 12px;
    transition: all 0.2s ease;

    &:hover {
      color: #3d5bd9;
    }

    &-selected {
      background: #4f6ef7;
      color: #fff;
      box-shadow: 0 2px 4px rgba(79, 110, 247, 0.3);
    }
  }
}

:deep(.ant-tooltip-inner) {
  font-size: 12px;
}
</style>
