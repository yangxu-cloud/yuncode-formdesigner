<template>
  <div class="prop-item" :class="{ 'prop-item--block': isBlockType }">
    <label class="prop-item__label">{{ item.label }}</label>
    <div class="prop-item__control">
      <a-input v-if="item.type === 'Input'" :value="value" size="small" :disabled="disabled" @change="onChange(($event as any).target.value)" />
      <a-textarea v-else-if="item.type === 'TextArea'" :value="value" size="small" :rows="2" :disabled="disabled" @change="onChange(($event as any).target.value)" />
      <a-input-number v-else-if="item.type === 'NumberPicker'" :value="value" v-bind="item.props" size="small" style="width: 100%" :disabled="disabled" @change="onChange($event)" />
      <a-select v-else-if="item.type === 'Select'" :value="value" :options="item.options" size="small" style="width: 100%" :disabled="disabled" @change="onChange($event)" />
      <a-switch v-else-if="item.type === 'Switch'" :checked="value" size="small" :disabled="disabled" @change="onChange($event)" />
      <SpanSelect v-else-if="item.type === 'SpanSelect'" :model-value="value" @update:model-value="onChange" />
      <a-input v-else :value="value" size="small" :disabled="disabled" @change="onChange(($event as any).target.value)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropsConfigItem } from '@/types'
import SpanSelect from './SpanSelect.vue'

const props = defineProps<{
  item: PropsConfigItem
  value: any
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [value: any]
}>()

const isBlockType = computed(() => {
  return ['SpanSelect', 'TextArea'].includes(props.item.type)
})

function onChange(val: any) {
  emit('change', val)
}
</script>

<style scoped lang="less">
.prop-item {
  display: flex;
  align-items: center;
  gap: 12px;

  &--block {
    flex-direction: column;
    align-items: stretch;

    .prop-item__label {
      min-width: auto;
    }
  }

  &__label {
    font-size: 13px;
    color: var(--text-secondary);
    min-width: 75px;
    flex-shrink: 0;
    font-weight: 500;
  }

  &__control {
    flex: 1;
    min-width: 0;

    :deep(.ant-input),
    :deep(.ant-select-selector),
    :deep(.ant-input-number) {
      border-radius: 8px !important;
      border-color: var(--border-color) !important;
      transition: all 0.2s ease !important;

      &:hover {
        border-color: var(--primary-color) !important;
      }

      &:focus,
      &-focused {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.1) !important;
      }
    }

    :deep(.ant-switch) {
      border-radius: 12px;
    }
  }
}
</style>
