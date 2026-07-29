<template>
  <div
    class="designable-shell"
    :class="{
      'designable-shell--selected': isSelected,
      'designable-shell--hovered': isHovered && !isSelected,
    }"
    @click.stop="onSelect"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 操作按钮（选中时显示） -->
    <div v-if="isSelected" class="designable-shell__actions">
      <span class="designable-shell__label">{{ componentLabel }}</span>
      <button class="designable-shell__btn" title="复制" @click.stop="$emit('copy')">
        <CopyOutlined />
      </button>
      <button class="designable-shell__btn designable-shell__btn--danger" title="删除" @click.stop="$emit('delete')">
        <DeleteOutlined />
      </button>
    </div>
    <!-- 组件渲染插槽 -->
    <div class="designable-shell__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import { registry } from '@/engine/registry'
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  path: string
  componentName?: string
}>()

defineEmits<{
  copy: []
  delete: []
}>()

const designerStore = useDesignerStore()

const isSelected = computed(() => designerStore.selectedPath === props.path)
const isHovered = computed(() => designerStore.hoveredPath === props.path)

const componentLabel = computed(() => {
  if (!props.componentName) return ''
  return registry.get(props.componentName)?.label ?? props.componentName
})

function onSelect() {
  designerStore.selectNode(props.path)
}

function onMouseEnter() {
  designerStore.hoverNode(props.path)
}

function onMouseLeave() {
  if (designerStore.hoveredPath === props.path) {
    designerStore.hoverNode(null)
  }
}
</script>

<style scoped lang="less">
.designable-shell {
  position: relative;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    border-color: #cbd5e1;
  }

  &--hovered {
    border-color: #94a3b8;
    background: rgba(148, 163, 184, 0.05);
  }

  &--selected {
    border-color: var(--primary-color);
    background: var(--primary-light);
    box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
  }

  &__actions {
    position: absolute;
    top: -36px;
    left: 0;
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--primary-color);
    color: #fff;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    padding: 4px 8px;
    font-size: 12px;
    z-index: 10;
    box-shadow: var(--shadow-md);
    animation: slideDown 0.15s ease;
  }

  &__label {
    margin-right: 8px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0.9;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: #fff;
    cursor: pointer;
    border-radius: var(--radius-sm);
    font-size: 12px;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    &--danger:hover {
      background: var(--error-color);
    }
  }

  &__content {
    // 确保拖拽事件正常传递
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
