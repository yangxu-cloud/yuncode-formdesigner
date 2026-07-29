<template>
  <div class="code-editor">
    <div class="code-editor__header">
      <a-select
        v-model:value="currentLanguage"
        size="small"
        class="code-editor__lang-select"
        @change="onLanguageChange"
      >
        <a-select-option value="javascript">JavaScript</a-select-option>
        <a-select-option value="typescript">TypeScript</a-select-option>
        <a-select-option value="json">JSON</a-select-option>
      </a-select>
      <div class="code-editor__actions">
        <a-tooltip title="格式化">
          <a-button size="small" @click="formatCode">
            <template #icon><FormatPainterOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="复制">
          <a-button size="small" @click="copyCode">
            <template #icon><CopyOutlined /></template>
          </a-button>
        </a-tooltip>
        <a-tooltip title="清空">
          <a-button size="small" @click="clearCode">
            <template #icon><DeleteOutlined /></template>
          </a-button>
        </a-tooltip>
      </div>
    </div>
    <div class="code-editor__container">
      <div ref="editorContainer" class="code-editor__monaco"></div>
      <div v-if="placeholder && !modelValue" class="code-editor__placeholder">
        {{ placeholder }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import { FormatPainterOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons-vue'
// 必须先导入 worker 配置
import '@/monaco-worker'
import type { CodeLanguage } from '@/types'

// 消息提示（简单实现）
const message = {
  success: (text: string) => console.log('[Success]', text),
  warning: (text: string) => console.warn('[Warning]', text),
  info: (text: string) => console.log('[Info]', text),
  error: (text: string) => console.error('[Error]', text),
}

const props = withDefaults(defineProps<{
  modelValue?: string
  language?: CodeLanguage
  height?: number
  placeholder?: string
  readOnly?: boolean
  minimap?: boolean
}>(), {
  modelValue: '',
  language: 'javascript',
  height: 150,
  placeholder: '',
  readOnly: false,
  minimap: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const editorContainer = ref<HTMLElement>()
const currentLanguage = ref(props.language)
const editor = shallowRef<any>(null)

// 动态导入 Monaco Editor
let monaco: any = null

async function loadMonaco() {
  if (monaco) return monaco
  monaco = await import('monaco-editor')
  return monaco
}

// 注册自定义提示
function setupCompletionProvider(monaco: any) {
  // 移除之前的注册（如果有的话）
  try {
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordAtPosition(position)
        const range = word
          ? {
              startLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: word.endColumn,
            }
          : {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            }

        return {
          suggestions: [
            // $inject 对象
            {
              label: '$inject',
              kind: monaco.languages.CompletionItemKind.Module,
              documentation: '注入对象，包含 api 子对象',
              insertText: '$inject',
              range,
            },
            // $inject.api - FormCreate 风格
            {
              label: '$inject.api',
              kind: monaco.languages.CompletionItemKind.Property,
              documentation: '获取 api 对象\n用法: const api = $inject.api',
              insertText: '$inject.api',
              range,
            },
            {
              label: '$inject.api.formData',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '获取表单数据\n用法: const formData = $inject.api.formData()',
              insertText: '$inject.api.formData()',
              range,
            },
            {
              label: '$inject.api.setValue',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '设置字段值\n用法: $inject.api.setValue("fieldName", value)',
              insertText: '$inject.api.setValue("${1:field}", ${2:value})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: '$inject.api.setVisible',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '设置字段可见性\n用法: $inject.api.setVisible("fieldName", true)',
              insertText: '$inject.api.setVisible("${1:field}", ${2:true})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: '$inject.api.setDisabled',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '设置字段禁用状态\n用法: $inject.api.setDisabled("fieldName", false)',
              insertText: '$inject.api.setDisabled("${1:field}", ${2:false})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: '$inject.api.validate',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '验证表单\n用法: const valid = $inject.api.validate()',
              insertText: '$inject.api.validate()',
              range,
            },
            {
              label: '$inject.api.submit',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '提交表单\n用法: $inject.api.submit()',
              insertText: '$inject.api.submit()',
              range,
            },
            {
              label: '$inject.api.reset',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '重置表单\n用法: $inject.api.reset()',
              insertText: '$inject.api.reset()',
              range,
            },
            {
              label: '$inject.api.clear',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '清空表单\n用法: $inject.api.clear()',
              insertText: '$inject.api.clear()',
              range,
            },
            {
              label: '$inject.api.request',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '发起 HTTP 请求\n用法: $inject.api.request({ url, method, data, onSuccess, onError })',
              insertText: '$inject.api.request({\n\turl: "${1:url}",\n\tmethod: "${2|GET,POST,PUT,DELETE|}",\n\tonSuccess: (data) => {\n\t\t$0\n\t},\n\tonError: (error) => {\n\t\tconsole.error(error)\n\t}\n})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            // 兼容写法 - 直接调用
            {
              label: '$inject.formData',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '获取表单数据（兼容写法）',
              insertText: '$inject.formData()',
              range,
            },
            {
              label: '$inject.setValue',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '设置字段值（兼容写法）',
              insertText: '$inject.setValue("${1:field}", ${2:value})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: '$inject.setVisible',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '设置可见性（兼容写法）',
              insertText: '$inject.setVisible("${1:field}", ${2:true})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: '$inject.setDisabled',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '设置禁用状态（兼容写法）',
              insertText: '$inject.setDisabled("${1:field}", ${2:false})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: '$inject.validate',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '触发表单验证（兼容写法）',
              insertText: '$inject.validate()',
              range,
            },
            {
              label: '$inject.submit',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '提交表单（兼容写法）',
              insertText: '$inject.submit()',
              range,
            },
            {
              label: '$inject.reset',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '重置表单（兼容写法）',
              insertText: '$inject.reset()',
              range,
            },
            {
              label: '$inject.request',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '发起 HTTP 请求（兼容写法）',
              insertText: '$inject.request({\n\turl: "${1:url}",\n\tmethod: "${2|GET,POST,PUT,DELETE|}",\n\tonSuccess: (data) => {\n\t\t$0\n\t}\n})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            // JavaScript 关键字
            {
              label: 'function',
              kind: monaco.languages.CompletionItemKind.Keyword,
              documentation: '定义函数',
              insertText: 'function ${1:name}(${2:params}) {\n\t$0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: 'const',
              kind: monaco.languages.CompletionItemKind.Keyword,
              documentation: '定义常量',
              insertText: 'const ${1:name} = ${2:value}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: 'let',
              kind: monaco.languages.CompletionItemKind.Keyword,
              documentation: '定义变量',
              insertText: 'let ${1:name} = ${2:value}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Keyword,
              documentation: '条件语句',
              insertText: 'if (${1:condition}) {\n\t$0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
            {
              label: 'console.log',
              kind: monaco.languages.CompletionItemKind.Function,
              documentation: '打印日志',
              insertText: 'console.log(${1:value})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            },
          ],
        }
      },
    })
  } catch (e) {
    console.log('Provider already registered')
  }
}

// 初始化编辑器
async function initEditor() {
  if (!editorContainer.value) return

  const monacoLib = await loadMonaco()

  // 定义主题
  monacoLib.editor.defineTheme('form-designer', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editorLineNumber.foreground': '#858585',
      'editorCursor.foreground': '#aeafad',
      'editor.selectionBackground': '#264f78',
    },
  })

  // 注册提示
  setupCompletionProvider(monacoLib)

  // 创建编辑器
  editor.value = monacoLib.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'form-designer',
    minimap: { enabled: props.minimap },
    readOnly: props.readOnly,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 13,
    lineHeight: 20,
    padding: { top: 10, bottom: 10 },
    renderLineHighlight: 'gutter',
    bracketPairColorization: { enabled: true },
    tabSize: 2,
    wordWrap: 'on',
    quickSuggestions: true,
    suggestOnTriggerCharacters: true,
    tabCompletion: 'on',
  })

  // 监听内容变化
  editor.value.onDidChangeModelContent(() => {
    const value = editor.value?.getValue() || ''
    emit('update:modelValue', value)
    emit('change', value)
  })
}

// 格式化代码
async function formatCode() {
  if (!editor.value) return
  try {
    await editor.value.getAction('editor.action.formatDocument')?.run()
    message.success('格式化成功')
  } catch {
    message.warning('格式化失败')
  }
}

// 复制代码
async function copyCode() {
  const code = editor.value?.getValue() || props.modelValue
  try {
    await navigator.clipboard.writeText(code)
    message.success('已复制到剪贴板')
  } catch {
    message.info('已输出到控制台')
    console.log('[Code Editor]', code)
  }
}

// 清空代码
function clearCode() {
  if (editor.value) {
    editor.value.setValue('')
  }
  emit('update:modelValue', '')
  emit('change', '')
}

// 语言变化
function onLanguageChange(lang: CodeLanguage) {
  if (editor.value) {
    const model = editor.value.getModel()
    if (model) {
      // 动态导入设置语言
      import('monaco-editor').then((m) => {
        m.editor.setModelLanguage(model, lang)
      })
    }
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  console.log('[CodeEditor] modelValue changed:', newVal?.substring(0, 50))
  if (editor.value) {
    const currentValue = editor.value.getValue()
    console.log('[CodeEditor] current value:', currentValue?.substring(0, 50))
    if (currentValue !== (newVal || '')) {
      console.log('[CodeEditor] setting new value')
      editor.value.setValue(newVal || '')
    }
  }
})

// 监听 language 变化
watch(() => props.language, (newLang) => {
  currentLanguage.value = newLang
  onLanguageChange(newLang)
})

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  editor.value?.dispose()
  editor.value = null
})
</script>

<style scoped lang="less">
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #2d2d2d;
    border-bottom: 1px solid #404040;
    flex-shrink: 0;
  }

  &__lang-select {
    width: 120px;

    :deep(.ant-select-selector) {
      background: #3d3d3d !important;
      border-color: #505050 !important;
      color: #d4d4d4 !important;
    }
  }

  &__actions {
    display: flex;
    gap: 6px;

    .ant-btn {
      background: #3d3d3d;
      border-color: #505050;
      color: #d4d4d4;

      &:hover {
        background: #4d4d4d;
        border-color: #606060;
        color: #fff;
      }
    }
  }

  &__container {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__monaco {
    width: 100%;
    height: 100%;
    min-height: 100px;
  }

  &__placeholder {
    position: absolute;
    top: 40px;
    left: 20px;
    color: #6b6b6b;
    font-size: 13px;
    font-family: 'SF Mono', Monaco, Consolas, monospace;
    pointer-events: none;
    white-space: pre-wrap;
    line-height: 1.6;
    z-index: 1;
  }
}
</style>
