import { defineStore } from "pinia"
import { ref } from "vue"
import type { FormilySchema, CodeConfig } from "@/types"
import { addNode, removeNode, updateNode, updateNestedProp, getNode, getNestedProp, moveNode, reorderNode } from "@/engine/schema-ops"
import { HistoryManager } from "@/engine/history"

export const useSchemaStore = defineStore("schema", () => {
  const root = ref<FormilySchema>({
    name: "root",
    type: "object",
    properties: {},
  })

  const history = new HistoryManager()

  function pushHistory() {
    history.push(root.value)
  }

  function addNodeAction(parentPath: string, schema: FormilySchema): boolean {
    pushHistory()
    const result = addNode(root.value, parentPath, schema)
    if (result) {
      root.value = JSON.parse(JSON.stringify(root.value))
    }
    return result
  }

  function removeNodeAction(path: string): boolean {
    pushHistory()
    const result = removeNode(root.value, path)
    if (result) {
      root.value = JSON.parse(JSON.stringify(root.value))
    }
    return result
  }

  function moveNodeAction(fromPath: string, toPath: string, position: "before" | "after" | "inside"): boolean {
    pushHistory()
    const result = moveNode(root.value, fromPath, toPath, position)
    if (result) {
      root.value = JSON.parse(JSON.stringify(root.value))
    }
    return result
  }

  function reorderNodeAction(fromPath: string, toPath: string, position: "before" | "after"): boolean {
    pushHistory()
    const result = reorderNode(root.value, fromPath, toPath, position)
    // 触发响应式更新：重新赋值
    if (result) {
      root.value = JSON.parse(JSON.stringify(root.value))
    }
    return result
  }

  function updateNodeAction(path: string, patch: Partial<FormilySchema>): boolean {
    pushHistory()
    const result = updateNode(root.value, path, patch)
    if (result) {
      root.value = JSON.parse(JSON.stringify(root.value))
    }
    return result
  }

  function updateNestedPropAction(path: string, propPath: string, value: any): boolean {
    pushHistory()
    const result = updateNestedProp(root.value, path, propPath, value)
    if (result) {
      root.value = JSON.parse(JSON.stringify(root.value))
    }
    return result
  }

  function getNodeAction(path: string): FormilySchema | undefined {
    return getNode(root.value, path)
  }

  function getNestedPropAction(path: string, propPath: string): any {
    return getNestedProp(root.value, path, propPath)
  }

  function exportSchema(): string {
    return JSON.stringify(root.value, null, 2)
  }

  function importSchema(json: string) {
    pushHistory()
    root.value = JSON.parse(json)
  }

  function undo() {
    const snapshot = history.undo()
    if (snapshot) root.value = snapshot
  }

  function redo() {
    const snapshot = history.redo()
    if (snapshot) root.value = snapshot
  }

  const canUndo = () => history.canUndo
  const canRedo = () => history.canRedo

  /** 强制触发响应式更新（直接修改节点属性后调用） */
  function triggerUpdate() {
    root.value = JSON.parse(JSON.stringify(root.value))
  }

  /** 更新代码配置 */
  function updateCodeConfig(path: string, config: Partial<CodeConfig>) {
    pushHistory()
    const node = getNode(root.value, path)
    if (node) {
      const existing = node['x-code-config'] || {}
      node['x-code-config'] = { ...existing, ...config }
      root.value = JSON.parse(JSON.stringify(root.value))
    }
  }

  /** 获取代码配置 */
  function getCodeConfig(path: string): CodeConfig | undefined {
    const node = getNode(root.value, path)
    return node?.['x-code-config']
  }

  /** 清除代码配置 */
  function clearCodeConfig(path: string) {
    pushHistory()
    const node = getNode(root.value, path)
    if (node) {
      delete node['x-code-config']
      root.value = JSON.parse(JSON.stringify(root.value))
    }
  }

  return {
    root,
    addNode: addNodeAction,
    removeNode: removeNodeAction,
    moveNode: moveNodeAction,
    reorderNode: reorderNodeAction,
    updateNode: updateNodeAction,
    updateNestedProp: updateNestedPropAction,
    getNode: getNodeAction,
    getNestedProp: getNestedPropAction,
    triggerUpdate,
    exportSchema,
    importSchema,
    undo,
    redo,
    canUndo,
    canRedo,
    updateCodeConfig,
    getCodeConfig,
    clearCodeConfig,
  }
})
