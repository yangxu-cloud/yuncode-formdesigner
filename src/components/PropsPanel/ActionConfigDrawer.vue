<template>
  <a-drawer
    :open="open"
    title="配置动作"
    :width="400"
    @close="onClose"
  >
    <div class="action-config">
      <!-- 动作类型选择 -->
      <div class="action-config__section">
        <div class="action-config__label">动作类型</div>
        <a-select
          v-model:value="formData.type"
          placeholder="请选择动作类型"
          style="width: 100%"
          @change="onTypeChange"
        >
          <a-select-option v-for="action in actionTypes" :key="action.type" :value="action.type">
            {{ action.icon }} {{ action.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 目标组件选择 -->
      <div v-if="currentActionType?.hasTarget" class="action-config__section">
        <div class="action-config__label">目标组件</div>
        <a-select
          v-model:value="formData.target"
          placeholder="请选择目标组件"
          style="width: 100%"
          show-search
          :filter-option="filterOption"
        >
          <a-select-option v-for="comp in allComponents" :key="comp.path" :value="comp.path">
            {{ comp.label }} ({{ comp.name }})
          </a-select-option>
        </a-select>
      </div>

      <!-- 设置值 -->
      <div v-if="currentActionType?.hasValue" class="action-config__section">
        <div class="action-config__label">设置值</div>
        <a-input
          v-model:value="formData.value"
          placeholder="请输入要设置的值"
        />
      </div>

      <!-- 显示消息 -->
      <div v-if="currentActionType?.hasMessage" class="action-config__section">
        <div class="action-config__label">消息内容</div>
        <a-textarea
          v-model:value="formData.message"
          placeholder="请输入消息内容"
          :rows="3"
        />
        <div class="action-config__label" style="margin-top: 12px">消息类型</div>
        <a-select v-model:value="formData.messageType" style="width: 100%">
          <a-select-option value="success">成功</a-select-option>
          <a-select-option value="info">信息</a-select-option>
          <a-select-option value="warning">警告</a-select-option>
          <a-select-option value="error">错误</a-select-option>
        </a-select>
      </div>

      <!-- 延迟执行 -->
      <div class="action-config__section">
        <div class="action-config__label">延迟执行（毫秒）</div>
        <a-input-number
          v-model:value="formData.delay"
          :min="0"
          :step="100"
          placeholder="0"
          style="width: 100%"
        />
      </div>
    </div>

    <template #footer>
      <div class="action-config__footer">
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSave">确定</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ACTION_TYPES } from '@/types'
import type { ActionType, ActionConfig, ActionTypeConfig } from '@/types'

const props = defineProps<{
  open: boolean
  eventType: string
  action: ActionConfig | null
  actionIndex: number
  allComponents: Array<{ path: string; name: string; label: string }>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [action: ActionConfig]
}>()

const actionTypes = ACTION_TYPES

const formData = ref<ActionConfig>({
  type: 'setValue',
  target: undefined,
  value: undefined,
  message: undefined,
  messageType: 'info',
  delay: 0,
})

// 当前选择的动作类型配置
const currentActionType = computed<ActionTypeConfig | undefined>(() => {
  return actionTypes.find(a => a.type === formData.value.type)
})

// 监听 props 变化，初始化表单
watch(() => props.action, (newAction) => {
  if (newAction) {
    formData.value = { ...newAction }
  } else {
    formData.value = {
      type: 'setValue',
      target: undefined,
      value: undefined,
      message: undefined,
      messageType: 'info',
      delay: 0,
    }
  }
}, { immediate: true })

// 动作类型变化时，清空相关字段
function onTypeChange() {
  formData.value.target = undefined
  formData.value.value = undefined
  formData.value.message = undefined
  formData.value.messageType = 'info'
}

// 下拉框搜索过滤
function filterOption(input: string, option: any) {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
    option.children?.[0]?.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// 关闭抽屉
function onClose() {
  emit('update:open', false)
}

// 保存动作
function onSave() {
  emit('save', { ...formData.value })
  emit('update:open', false)
}
</script>

<style scoped lang="less">
.action-config {
  padding: 0;

  &__section {
    margin-bottom: 20px;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
