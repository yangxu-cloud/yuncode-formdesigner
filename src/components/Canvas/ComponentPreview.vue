<template>
  <div
    class="component-preview"
    :class="{ 'component-preview--inline': labelPlacement === 'left' }"
  >
    <!-- 标签页（仅通过slot渲染内容，头部由SchemaRenderer统一处理） -->
    <template v-if="component === 'Tabs' || component === 'LayoutContainer'">
      <slot />
    </template>

    <!-- 分组卡片 -->
    <template v-else-if="component === 'Card'">
      <div class="component-preview__card">
        <div class="component-preview__card-header">
          {{ schema['x-component-props']?.title || schema.title || '分组' }}
        </div>
        <div class="component-preview__card-body">
          <slot />
        </div>
      </div>
    </template>

    <!-- 普通组件 -->
    <template v-else>
      <!-- 左侧标题布局 -->
      <template v-if="labelPlacement === 'left'">
        <div v-if="schema.title" class="component-preview__label component-preview__label--left">
          <span v-if="schema.required" class="component-preview__required">*</span>
          {{ schema.title }}
        </div>
        <div class="component-preview__control">
          <!-- 输入框 -->
          <a-input
            v-if="component === 'Input'"
            v-bind="schema['x-component-props']"
          />
          <!-- 文本域 -->
          <a-textarea
            v-else-if="component === 'TextArea'"
            v-bind="schema['x-component-props']"
          />
          <!-- 数字输入 -->
          <a-input-number
            v-else-if="component === 'NumberPicker'"
            v-bind="schema['x-component-props']"
            style="width: 100%"
          />
          <!-- 下拉选择 -->
          <a-select
            v-else-if="component === 'Select'"
            v-bind="schema['x-component-props']"
          />
          <!-- 单选 -->
          <a-radio-group
            v-else-if="component === 'Radio.Group'"
            v-bind="schema['x-component-props']"
          />
          <!-- 多选 -->
          <a-checkbox-group
            v-else-if="component === 'Checkbox.Group'"
            v-bind="schema['x-component-props']"
          />
          <!-- 日期选择 -->
          <a-date-picker
            v-else-if="component === 'DatePicker'"
            v-bind="schema['x-component-props']"
          />
          <!-- 开关 -->
          <a-switch
            v-else-if="component === 'Switch'"
            v-bind="schema['x-component-props']"
          />
          <!-- 未知组件占位 -->
          <div v-else class="component-preview__unknown">
            {{ component || '未知组件' }}
          </div>
        </div>
      </template>

      <!-- 上方标题布局 -->
      <template v-else>
        <!-- 输入框 -->
        <a-input
          v-if="component === 'Input'"
          v-bind="schema['x-component-props']"
        />
        <!-- 文本域 -->
        <a-textarea
          v-else-if="component === 'TextArea'"
          v-bind="schema['x-component-props']"
        />
        <!-- 数字输入 -->
        <a-input-number
          v-else-if="component === 'NumberPicker'"
          v-bind="schema['x-component-props']"
          style="width: 100%"
        />
        <!-- 下拉选择 -->
        <a-select
          v-else-if="component === 'Select'"
          v-bind="schema['x-component-props']"
        />
        <!-- 单选 -->
        <a-radio-group
          v-else-if="component === 'Radio.Group'"
          v-bind="schema['x-component-props']"
        />
        <!-- 多选 -->
        <a-checkbox-group
          v-else-if="component === 'Checkbox.Group'"
          v-bind="schema['x-component-props']"
        />
        <!-- 日期选择 -->
        <a-date-picker
          v-else-if="component === 'DatePicker'"
          v-bind="schema['x-component-props']"
        />
        <!-- 开关 -->
        <a-switch
          v-else-if="component === 'Switch'"
          v-bind="schema['x-component-props']"
        />
        <!-- 未知组件占位 -->
        <div v-else class="component-preview__unknown">
          {{ component || '未知组件' }}
        </div>

        <!-- 标签 -->
        <div v-if="schema.title" class="component-preview__label">
          {{ schema.title }}
          <span v-if="schema.required" class="component-preview__required">*</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormilySchema } from '@/types'

const props = defineProps<{
  schema: FormilySchema
}>()

const component = computed(() => props.schema['x-component'])

// 标题位置：left=左侧（默认），top=上方
const labelPlacement = computed(() => {
  return (props.schema['x-label-placement'] as string) || 'left'
})

</script>

<style scoped lang="less">
.component-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;

  // 左侧标题布局（PC端）
  &--inline {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  &__card {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    overflow: hidden;
    width: 100%;
  }

  &__card-header {
    padding: 10px 14px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__card-body {
    padding: 14px;
    min-height: 48px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__label {
    font-size: 13px;
    color: var(--text-primary);
    line-height: 1.4;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 2px;

    &--left {
      flex-shrink: 0;
      white-space: nowrap;
      color: var(--text-primary);
    }
  }

  &__control {
    flex: 1;
    min-width: 0;
  }

  &__required {
    color: var(--error-color);
    font-size: 13px;
    line-height: 1;
  }

  &__unknown {
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-tertiary);
    font-size: 12px;
    text-align: center;
  }
}
</style>
