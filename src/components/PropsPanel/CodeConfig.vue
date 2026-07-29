<template>
  <div class="code-config">
    <!-- 验证规则代码 -->
    <div class="code-config__section">
      <div class="code-config__section-header" @click="toggleSection('validation')">
        <span class="code-config__section-icon">📝</span>
        <span class="code-config__section-title">验证规则代码</span>
        <span class="code-config__section-arrow">{{ expandedSections.has('validation') ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expandedSections.has('validation')" class="code-config__section-content">
        <div class="code-config__tip">
          <a-alert
            message="编写自定义验证逻辑"
            description="函数签名: (value, formData) => boolean | string"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
        <CodeEditor
          :model-value="validationCode"
          language="javascript"
          :height="120"
          placeholder="// 例如:
// if (!value) return '请输入内容'
// if (value.length > 10) return '长度不能超过10'
// return true"
          @update:model-value="onValidationCodeChange"
        />
      </div>
    </div>

    <!-- 事件处理代码 -->
    <div class="code-config__section">
      <div class="code-config__section-header" @click="toggleSection('event')">
        <span class="code-config__section-icon">⚡</span>
        <span class="code-config__section-title">事件处理代码</span>
        <span class="code-config__section-arrow">{{ expandedSections.has('event') ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expandedSections.has('event')" class="code-config__section-content">
        <div class="code-config__tip">
          <a-alert
            message="编写自定义事件处理逻辑"
            description="函数签名: (event, formData) => void"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
        <CodeEditor
          :model-value="eventHandlerCode"
          language="javascript"
          :height="120"
          placeholder="// 例如:
// console.log('值变化:', event.target.value)
// formData.otherField = event.target.value"
          @update:model-value="onEventHandlerCodeChange"
        />
      </div>
    </div>

    <!-- 数据转换代码 -->
    <div class="code-config__section">
      <div class="code-config__section-header" @click="toggleSection('transform')">
        <span class="code-config__section-icon">🔄</span>
        <span class="code-config__section-title">数据转换代码</span>
        <span class="code-config__section-arrow">{{ expandedSections.has('transform') ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expandedSections.has('transform')" class="code-config__section-content">
        <div class="code-config__tip">
          <a-alert
            message="编写数据转换逻辑"
            description="函数签名: (value) => any"
            type="info"
            show-icon
            :closable="false"
          />
        </div>
        <CodeEditor
          :model-value="dataTransformerCode"
          language="javascript"
          :height="120"
          placeholder="// 例如:
// return value?.trim() || ''
// return Number(value) || 0"
          @update:model-value="onDataTransformerCodeChange"
        />
      </div>
    </div>

    <!-- API 配置 -->
    <div class="code-config__section">
      <div class="code-config__section-header" @click="toggleSection('api')">
        <span class="code-config__section-icon">🌐</span>
        <span class="code-config__section-title">API 配置</span>
        <span class="code-config__section-arrow">{{ expandedSections.has('api') ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expandedSections.has('api')" class="code-config__section-content">
        <a-tabs v-model:activeKey="apiTab" size="small">
          <a-tab-pane key="fetch" tab="数据获取">
            <a-form layout="vertical" size="small">
              <a-form-item label="请求 URL">
                <a-input
                  v-model:value="apiConfig.fetchData.url"
                  placeholder="https://api.example.com/data"
                  @change="onApiConfigChange"
                />
              </a-form-item>
              <a-form-item label="请求方法">
                <a-select
                  v-model:value="apiConfig.fetchData.method"
                  @change="onApiConfigChange"
                >
                  <a-select-option value="GET">GET</a-select-option>
                  <a-select-option value="POST">POST</a-select-option>
                  <a-select-option value="PUT">PUT</a-select-option>
                  <a-select-option value="DELETE">DELETE</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
            <div class="code-config__tip">
              <a-alert
                message="数据转换函数"
                description="对返回的数据进行转换处理"
                type="info"
                show-icon
                :closable="false"
              />
            </div>
            <CodeEditor
              :model-value="apiConfig.fetchData.transform"
              language="javascript"
              :height="100"
              placeholder="// 例如:
// return response.data.list"
              @update:model-value="(v) => onFetchTransformChange(v)"
            />
          </a-tab-pane>
          <a-tab-pane key="submit" tab="数据提交">
            <a-form layout="vertical" size="small">
              <a-form-item label="请求 URL">
                <a-input
                  v-model:value="apiConfig.submitData.url"
                  placeholder="https://api.example.com/submit"
                  @change="onApiConfigChange"
                />
              </a-form-item>
              <a-form-item label="请求方法">
                <a-select
                  v-model:value="apiConfig.submitData.method"
                  @change="onApiConfigChange"
                >
                  <a-select-option value="POST">POST</a-select-option>
                  <a-select-option value="PUT">PUT</a-select-option>
                  <a-select-option value="DELETE">DELETE</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
            <div class="code-config__tip">
              <a-alert
                message="提交前数据转换"
                description="对提交的数据进行转换处理"
                type="info"
                show-icon
                :closable="false"
              />
            </div>
            <CodeEditor
              :model-value="apiConfig.submitData.transform"
              language="javascript"
              :height="100"
              placeholder="// 例如:
// return { ...formData, timestamp: Date.now() }"
              @update:model-value="(v) => onSubmitTransformChange(v)"
            />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>

    <!-- 自定义组件代码 -->
    <div class="code-config__section">
      <div class="code-config__section-header" @click="toggleSection('custom')">
        <span class="code-config__section-icon">🧩</span>
        <span class="code-config__section-title">自定义组件代码</span>
        <span class="code-config__section-arrow">{{ expandedSections.has('custom') ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expandedSections.has('custom')" class="code-config__section-content">
        <div class="code-config__tip">
          <a-alert
            message="编写自定义组件代码"
            description="支持 Vue 3 Composition API 语法"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>
        <CodeEditor
          :model-value="customComponentCode"
          language="javascript"
          :height="150"
          placeholder="// 例如:
// export default {
//   setup(props) {
//     const value = ref(props.modelValue)
//     return { value }
//   }
// }"
          @update:model-value="onCustomComponentCodeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSchemaStore } from '@/stores/schema'
import { useDesignerStore } from '@/stores/designer'
import CodeEditor from '@/components/CodeEditor/index.vue'
import type { CodeConfig, APIConfig } from '@/types'

const schemaStore = useSchemaStore()
const designerStore = useDesignerStore()

// 展开状态
const expandedSections = ref<Set<string>>(new Set(['validation']))
const apiTab = ref('fetch')

// 默认 API 配置
const defaultApiConfig: APIConfig = {
  fetchData: {
    url: '',
    method: 'GET',
    transform: '',
  },
  submitData: {
    url: '',
    method: 'POST',
    transform: '',
  },
}

// 获取选中节点的代码配置
const codeConfig = computed<CodeConfig>(() => {
  if (!designerStore.selectedPath) return {}
  const node = schemaStore.getNode(designerStore.selectedPath)
  return node?.['x-code-config'] || {}
})

// 各项代码值
const validationCode = computed(() => codeConfig.value.validationCode || '')
const eventHandlerCode = computed(() => codeConfig.value.eventHandlerCode || '')
const dataTransformerCode = computed(() => codeConfig.value.dataTransformerCode || '')
const customComponentCode = computed(() => codeConfig.value.customComponentCode || '')
const apiConfig = computed(() => ({
  fetchData: codeConfig.value.apiConfig?.fetchData || defaultApiConfig.fetchData!,
  submitData: codeConfig.value.apiConfig?.submitData || defaultApiConfig.submitData!,
}))

// 切换展开状态
function toggleSection(section: string) {
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section)
  } else {
    expandedSections.value.add(section)
  }
  expandedSections.value = new Set(expandedSections.value)
}

// 更新代码配置
function updateCodeConfig(partial: Partial<CodeConfig>) {
  if (!designerStore.selectedPath) return
  const node = schemaStore.getNode(designerStore.selectedPath)
  if (!node) return

  const existing = node['x-code-config'] || {}
  node['x-code-config'] = { ...existing, ...partial }
  schemaStore.triggerUpdate()
}

// 验证代码变更
function onValidationCodeChange(value: string) {
  updateCodeConfig({ validationCode: value })
}

// 事件处理代码变更
function onEventHandlerCodeChange(value: string) {
  updateCodeConfig({ eventHandlerCode: value })
}

// 数据转换代码变更
function onDataTransformerCodeChange(value: string) {
  updateCodeConfig({ dataTransformerCode: value })
}

// 自定义组件代码变更
function onCustomComponentCodeChange(value: string) {
  updateCodeConfig({ customComponentCode: value })
}

// API 配置变更
function onApiConfigChange() {
  updateCodeConfig({ apiConfig: { ...apiConfig.value } })
}

// 获取数据转换函数变更
function onFetchTransformChange(value: string) {
  const newConfig = { ...apiConfig.value }
  if (newConfig.fetchData) {
    newConfig.fetchData = { ...newConfig.fetchData, transform: value }
    updateCodeConfig({ apiConfig: newConfig })
  }
}

// 提交数据转换函数变更
function onSubmitTransformChange(value: string) {
  const newConfig = { ...apiConfig.value }
  if (newConfig.submitData) {
    newConfig.submitData = { ...newConfig.submitData, transform: value }
    updateCodeConfig({ apiConfig: newConfig })
  }
}
</script>

<style scoped lang="less">
.code-config {
  &__section {
    margin-bottom: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--bg-tertiary);
    }
  }

  &__section-icon {
    font-size: 14px;
  }

  &__section-title {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }

  &__section-arrow {
    font-size: 10px;
    color: var(--text-tertiary);
  }

  &__section-content {
    padding: 12px;
    background: var(--bg-primary);
  }

  &__tip {
    margin-bottom: 12px;
  }
}
</style>
