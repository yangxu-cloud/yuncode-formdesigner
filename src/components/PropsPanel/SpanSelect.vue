<template>
  <div class="span-select">
    <div
      v-for="option in options"
      :key="option.value"
      class="span-select__item"
      :class="{ 'span-select__item--active': modelValue === option.value }"
      @click="onChange(option.value)"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const options = [
  { label: '1/4', value: 1 },
  { label: '1/2', value: 2 },
  { label: '3/4', value: 3 },
  { label: '整行', value: 4 },
]

function onChange(value: number) {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.span-select {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  &__item {
    flex: 1;
    min-width: 40px;
    padding: 6px 4px;
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    &--active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: #fff;
      font-weight: 500;
    }
  }
}
</style>
