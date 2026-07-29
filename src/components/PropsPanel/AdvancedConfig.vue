<template>
  <div class="advanced-config">
    <!-- 高级配置标题 -->
    <div class="advanced-config__header" @click="isExpanded = !isExpanded">
      <span class="advanced-config__header-icon">
        <SettingOutlined />
      </span>
      <span class="advanced-config__header-title">高级配置</span>
      <span class="advanced-config__header-arrow">
        <DownOutlined v-if="isExpanded" />
        <RightOutlined v-else />
      </span>
    </div>

    <!-- 配置内容 -->
    <div v-if="isExpanded" class="advanced-config__content">
      <!-- 隐藏条件 -->
      <div class="advanced-config__item">
        <ConditionConfig
          v-model="hideConditionConfig"
          title="隐藏条件"
          :show-visibility="true"
          :show-availability="false"
          :show-required="false"
          @change="onHideConditionChange"
        />
        <div class="advanced-config__item-hint">
          当条件满足时，控制组件的显示/隐藏状态
        </div>
      </div>

      <!-- 禁用条件 -->
      <div class="advanced-config__item">
        <ConditionConfig
          v-model="disabledConditionConfig"
          title="禁用条件"
          :show-visibility="false"
          :show-availability="true"
          :show-required="false"
          @change="onDisabledConditionChange"
        />
        <div class="advanced-config__item-hint">
          当条件满足时，控制组件的启用/禁用/只读状态
        </div>
      </div>

      <!-- 必填条件 -->
      <div class="advanced-config__item">
        <ConditionConfig
          v-model="requiredConditionConfig"
          title="必填条件"
          :show-visibility="false"
          :show-availability="false"
          :show-required="true"
          @change="onRequiredConditionChange"
        />
        <div class="advanced-config__item-hint">
          当条件满足时，控制组件的必填/非必填状态
        </div>
      </div>

      <!-- 数据联动 -->
      <div class="advanced-config__item">
        <DataLinkageConfig
          v-model="dataLinkageConfig"
          title="数据联动"
          @change="onDataLinkageChange"
        />
        <div class="advanced-config__item-hint">
          当条件满足时，自动更新其他字段的值或状态
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import {
  SettingOutlined,
  DownOutlined,
  RightOutlined,
  SwapOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons-vue'
import ConditionConfig from './ConditionConfig.vue'
import DataLinkageConfig from './DataLinkageConfig.vue'
import type { ConditionConfigValue } from './ConditionConfig.vue'
import type { DataLinkageConfigValue } from './DataLinkageConfig.vue'

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 展开状态
const isExpanded = ref(true)

const selectedNode = computed(() => {
  if (!designerStore.selectedPath) return null
  return schemaStore.getNode(designerStore.selectedPath)
})

// 条件配置值
const hideConditionConfig = ref<ConditionConfigValue>({ type: 'logic', groups: [], formula: '' })
const requiredConditionConfig = ref<ConditionConfigValue>({ type: 'logic', groups: [], formula: '' })
const disabledConditionConfig = ref<ConditionConfigValue>({ type: 'logic', groups: [], formula: '' })
const readonlyConditionConfig = ref<ConditionConfigValue>({ type: 'logic', groups: [], formula: '' })
const visibleConditionConfig = ref<ConditionConfigValue>({ type: 'logic', groups: [], formula: '' })
const dataLinkageConfig = ref<DataLinkageConfigValue>({ type: 'linkage', conditionGroups: [], actions: [], formula: '' })
const valueChangeLinkage = ref('')

// 初始化配置值
watch(selectedNode, (node) => {
  if (!node) return

  const advancedConfig = node['x-advanced-config'] || {}

  // 解析条件配置（支持旧格式和新格式）
  hideConditionConfig.value = parseConditionConfig(advancedConfig.hideCondition, advancedConfig.hideConditionConfig)
  requiredConditionConfig.value = parseConditionConfig(advancedConfig.requiredCondition, advancedConfig.requiredConditionConfig)
  disabledConditionConfig.value = parseConditionConfig(advancedConfig.disabledCondition, advancedConfig.disabledConditionConfig)
  readonlyConditionConfig.value = parseConditionConfig(advancedConfig.readonlyCondition, advancedConfig.readonlyConditionConfig)
  visibleConditionConfig.value = parseConditionConfig(advancedConfig.visibleCondition, advancedConfig.visibleConditionConfig)
  valueChangeLinkage.value = advancedConfig.valueChangeLinkage || ''

  // 解析数据联动配置
  if (advancedConfig.dataLinkageConfig) {
    dataLinkageConfig.value = advancedConfig.dataLinkageConfig
  } else {
    dataLinkageConfig.value = { type: 'linkage', conditionGroups: [], actions: [], formula: '' }
  }
}, { immediate: true })

// 解析条件配置
function parseConditionConfig(formula?: string, config?: ConditionConfigValue): ConditionConfigValue {
  if (config) return config
  if (formula) {
    return { type: 'formula', groups: [], formula }
  }
  return { type: 'logic', groups: [], formula: '' }
}

// 将条件配置转换为公式字符串
function configToFormula(config: ConditionConfigValue): string {
  if (config.type === 'formula') {
    return config.formula
  }

  // 逻辑条件转换为公式
  if (!config.groups || config.groups.length === 0) return ''

  const groupFormulas = config.groups.map(group => {
    if (!group.conditions || group.conditions.length === 0) return ''

    const conditionFormulas = group.conditions.map(condition => {
      if (!condition.field) return ''

      const { field, operator, value } = condition
      switch (operator) {
        case '==': return `formData['${field}'] == '${value}'`
        case '!=': return `formData['${field}'] != '${value}'`
        case '>': return `formData['${field}'] > '${value}'`
        case '>=': return `formData['${field}'] >= '${value}'`
        case '<': return `formData['${field}'] < '${value}'`
        case '<=': return `formData['${field}'] <= '${value}'`
        case 'includes': return `formData['${field}'].includes('${value}')`
        case 'notIncludes': return `!formData['${field}'].includes('${value}')`
        case 'empty': return `!formData['${field}']`
        case 'notEmpty': return `!!formData['${field}']`
        default: return `formData['${field}'] == '${value}'`
      }
    }).filter(f => f)

    if (conditionFormulas.length === 0) return ''
    if (conditionFormulas.length === 1) return conditionFormulas[0]
    return `(${conditionFormulas.join(` ${group.relation} `)})`
  }).filter(f => f)

  if (groupFormulas.length === 0) return ''
  if (groupFormulas.length === 1) return groupFormulas[0]
  return groupFormulas.join(' || ')
}

// 更新配置
function updateAdvancedConfig(key: string, formula: string, config?: ConditionConfigValue) {
  if (!selectedNode.value) return

  const existingConfig = selectedNode.value['x-advanced-config'] || {}
  selectedNode.value['x-advanced-config'] = {
    ...existingConfig,
    [key]: formula,
    [`${key}Config`]: config,
  }
  schemaStore.triggerUpdate()
}

// 事件处理函数
function onHideConditionChange(config: ConditionConfigValue) {
  updateAdvancedConfig('hideCondition', configToFormula(config), config)
}

function onRequiredConditionChange(config: ConditionConfigValue) {
  updateAdvancedConfig('requiredCondition', configToFormula(config), config)
}

function onDisabledConditionChange(config: ConditionConfigValue) {
  updateAdvancedConfig('disabledCondition', configToFormula(config), config)
}

function onReadonlyConditionChange(config: ConditionConfigValue) {
  updateAdvancedConfig('readonlyCondition', configToFormula(config), config)
}

function onVisibleConditionChange(config: ConditionConfigValue) {
  updateAdvancedConfig('visibleCondition', configToFormula(config), config)
}

function onValueChangeLinkageChange() {
  updateAdvancedConfig('valueChangeLinkage', valueChangeLinkage.value)
}

function onDataLinkageChange(config: DataLinkageConfigValue) {
  if (!selectedNode.value) return

  const existingConfig = selectedNode.value['x-advanced-config'] || {}
  selectedNode.value['x-advanced-config'] = {
    ...existingConfig,
    dataLinkageConfig: config,
  }
  schemaStore.triggerUpdate()
}
</script>

<style scoped lang="less">
.advanced-config {
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--bg-tertiary);
    }
  }

  &__header-icon {
    font-size: 14px;
    color: var(--primary-color);
  }

  &__header-title {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__header-arrow {
    font-size: 10px;
    color: var(--text-tertiary);
  }

  &__content {
    margin-top: 12px;
  }

  &__item {
    margin-bottom: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 12px;
    background: var(--bg-primary);

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__item-hint {
    margin-top: 8px;
    font-size: 11px;
    color: var(--text-tertiary);
    line-height: 1.4;
  }

  &__help-btn {
    color: var(--text-tertiary);

    &:hover {
      color: var(--primary-color);
    }
  }
}
</style>
