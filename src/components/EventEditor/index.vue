<template>
  <div class="event-editor">
    <!-- 事件类型选择 -->
    <div v-if="showEventTypeSelector" class="event-editor__type-selector">
      <span class="event-editor__type-label">事件类型：</span>
      <a-select
        v-model:value="currentEventType"
        size="small"
        style="width: 150px"
        @change="onEventTypeChange"
      >
        <a-select-option v-for="event in eventTypes" :key="event.type" :value="event.type">
          {{ event.label }}
        </a-select-option>
      </a-select>
    </div>

    <!-- 代码编辑器 -->
    <div class="event-editor__code-wrapper">
      <div class="event-editor__code-header">
        <span class="event-editor__code-func">function {{ functionName }}($inject) {</span>
        <a-tooltip title="代码提示">
          <a-button size="small" type="text" class="event-editor__help-btn" @click="showCodeTips = true">
            <template #icon><QuestionCircleOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
      <div class="event-editor__code-body">
        <CodeEditor
          :model-value="code || ''"
          language="javascript"
          :height="height"
          :placeholder="placeholder"
          @update:model-value="onCodeChange"
        />
      </div>
      <div class="event-editor__code-footer">}</div>
    </div>

    <!-- 代码提示弹窗 -->
    <a-modal
      v-model:open="showCodeTips"
      title="代码提示"
      :footer="null"
      width="480px"
    >
      <div class="event-editor__tips-modal">
        <div class="event-editor__tips-section">
          <div class="event-editor__tips-title">可用方法</div>
          <div class="event-editor__tips-list">
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.formData()</code>
              <span class="event-editor__tips-desc">获取表单数据</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.setValue(field, value)</code>
              <span class="event-editor__tips-desc">设置字段值</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.setVisible(field, visible)</code>
              <span class="event-editor__tips-desc">设置可见性</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.setDisabled(field, disabled)</code>
              <span class="event-editor__tips-desc">设置禁用状态</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.validate()</code>
              <span class="event-editor__tips-desc">验证表单</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.submit()</code>
              <span class="event-editor__tips-desc">提交表单</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.reset()</code>
              <span class="event-editor__tips-desc">重置表单</span>
            </div>
            <div class="event-editor__tips-item">
              <code class="event-editor__tips-code">$inject.api.request({ url, method, data })</code>
              <span class="event-editor__tips-desc">发起 HTTP 请求</span>
            </div>
          </div>
        </div>
        <div class="event-editor__tips-section">
          <div class="event-editor__tips-title">使用示例</div>
          <div class="event-editor__tips-example">
            <pre class="event-editor__tips-pre">// 获取 api 对象
const api = $inject.api

// 获取表单数据
const data = api.formData()

// 设置字段值
api.setValue('username', '张三')

// 发起请求
api.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  onSuccess: (data) => {
    console.log('成功:', data)
  }
})</pre>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import CodeEditor from '@/components/CodeEditor/index.vue'

export interface EventTypeOption {
  type: string
  label: string
  description?: string
  functionName?: string
}

const props = withDefaults(defineProps<{
  /** 事件类型 */
  eventType?: string
  /** 代码内容 */
  code?: string
  /** 事件类型列表 */
  eventTypes?: EventTypeOption[]
  /** 是否显示事件类型选择器 */
  showEventTypeSelector?: boolean
  /** 编辑器高度 */
  height?: number
  /** 占位文本 */
  placeholder?: string
}>(), {
  eventType: 'change',
  code: '',
  eventTypes: () => [
    { type: 'change', label: '值变化', description: '当值改变时触发', functionName: 'change' },
    { type: 'focus', label: '获得焦点', description: '当获得焦点时触发', functionName: 'focus' },
    { type: 'blur', label: '失去焦点', description: '当失去焦点时触发', functionName: 'blur' },
    { type: 'pressEnter', label: '按下回车', description: '当按下回车键时触发', functionName: 'pressEnter' },
    { type: 'mounted', label: '组件加载', description: '组件挂载后触发', functionName: 'mounted' },
    { type: 'submit', label: '表单提交', description: '表单提交时触发', functionName: 'submit' },
  ],
  showEventTypeSelector: true,
  height: 300,
  placeholder: '// 在此编写代码',
})

const emit = defineEmits<{
  'update:eventType': [value: string]
  'update:code': [value: string]
  change: [eventType: string, code: string]
}>()

// 当前事件类型
const currentEventType = ref(props.eventType)

// 代码提示弹窗
const showCodeTips = ref(false)

// 当前事件类型的配置
const currentEventConfig = computed(() => {
  return props.eventTypes.find(e => e.type === currentEventType.value) || props.eventTypes[0]
})

// 函数名 - 直接从 props.eventType 计算
const functionName = computed(() => {
  const eventConfig = props.eventTypes.find(e => e.type === props.eventType)
  return eventConfig?.functionName || props.eventType
})

// 监听 eventType 变化
watch(() => props.eventType, (newVal) => {
  currentEventType.value = newVal
})

// 监听 code 变化，确保 CodeEditor 更新
watch(() => props.code, (newVal) => {
  // code prop 变化时，CodeEditor 会通过 modelValue watch 自动更新
  console.log('[EventEditor] code changed:', newVal)
})

// 事件类型变化
function onEventTypeChange(type: string) {
  emit('update:eventType', type)
  emit('change', type, props.code)
}

// 代码变化
function onCodeChange(newCode: string) {
  emit('update:code', newCode)
  emit('change', currentEventType.value, newCode)
}
</script>

<style scoped lang="less">
.event-editor {
  display: flex;
  flex-direction: column;
  height: 100%;

  &__type-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  &__type-label {
    font-size: 13px;
    color: #595959;
    white-space: nowrap;
  }

  &__code-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    overflow: hidden;
    background: #1e1e1e;
    min-height: 0;
  }

  &__code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #2d2d2d;
    border-bottom: 1px solid #404040;
    flex-shrink: 0;
  }

  &__code-func {
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 13px;
    color: #c586c0;
  }

  &__help-btn {
    color: #8c8c8c;

    &:hover {
      color: #1890ff;
    }
  }

  &__code-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    height: 100%;
    position: relative;
  }

  &__loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #8c8c8c;
    font-size: 14px;
  }

  &__code-footer {
    padding: 10px 16px;
    background: #2d2d2d;
    border-top: 1px solid #404040;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 13px;
    color: #d4d4d4;
    flex-shrink: 0;
  }

  // 代码提示弹窗样式
  &__tips-modal {
    padding: 0;
  }

  &__tips-section {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__tips-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 12px;
  }

  &__tips-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__tips-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    background: #f6f8fa;
    border-radius: 6px;
  }

  &__tips-code {
    background: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 12px;
    color: #1890ff;
    border: 1px solid #e8e8e8;
    white-space: nowrap;
  }

  &__tips-desc {
    font-size: 13px;
    color: #595959;
    line-height: 1.4;
  }

  &__tips-example {
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
  }

  &__tips-pre {
    margin: 0;
    padding: 16px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    color: #d4d4d4;
    overflow-x: auto;
  }
}
</style>
