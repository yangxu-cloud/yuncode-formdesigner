<template>
  <div class="designer">
    <div class="designer__source">
      <SourcePanel />
    </div>
    <div class="designer__canvas">
      <Canvas />
    </div>
    <div class="designer__props" :class="{ 'designer__props--collapsed': isPropsCollapsed }">
      <PropsPanel v-show="!isPropsCollapsed" />
    </div>
    <!-- 展开/折叠按钮 - 放在面板外面 -->
    <div class="designer__props-toggle" @click="isPropsCollapsed = !isPropsCollapsed">
      <RightOutlined v-if="!isPropsCollapsed" />
      <LeftOutlined v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SourcePanel from './SourcePanel/index.vue'
import Canvas from './Canvas/index.vue'
import PropsPanel from './PropsPanel/index.vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'

const isPropsCollapsed = ref(false)
</script>

<style scoped lang="less">
.designer {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  position: relative;

  &__source {
    width: 280px;
    min-width: 280px;
    background: var(--bg-primary);
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  }

  &__canvas {
    flex: 1;
    overflow: auto;
    padding: 20px;
    min-width: 0;
  }

  &__props {
    width: 320px;
    min-width: 320px;
    background: var(--bg-primary);
    border-left: 1px solid var(--border-color);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;

    &--collapsed {
      width: 0;
      min-width: 0;
      border-left: none;
      overflow: hidden;
    }
  }

  &__props-toggle {
    position: fixed;
    right: 320px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-left: none;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    z-index: 10;
    transition: right 0.3s ease, background 0.2s;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);

    &:hover {
      background: var(--primary-light);
      color: var(--primary-color);
    }

    :deep(.anticon) {
      font-size: 12px;
    }
  }

  // 面板折叠时，按钮移动到最右侧
  &__props--collapsed ~ &__props-toggle {
    right: 0;
  }
}
</style>
