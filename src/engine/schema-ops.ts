import type { FormilySchema } from '@/types'

/**
 * Schema 操作工具函数
 * 通过路径定位节点，支持增删改查
 */

/** 根据文档路径获取节点 */
export function getNode(root: FormilySchema, path: string): FormilySchema | undefined {
  if (!path) return root
  const segments = path.split('.')
  let current: FormilySchema = root
  for (const seg of segments) {
    if (!current.properties || !current.properties[seg]) {
      return undefined
    }
    current = current.properties[seg]
  }
  return current
}

/** 获取节点的父节点和 key */
export function getParent(
  root: FormilySchema,
  path: string
): { parent: FormilySchema; key: string } | undefined {
  if (!path) return undefined
  const segments = path.split('.')
  const key = segments.pop()!
  let current: FormilySchema = root
  for (const seg of segments) {
    if (!current.properties || !current.properties[seg]) {
      return undefined
    }
    current = current.properties[seg]
  }
  return { parent: current, key }
}

/** 向指定层级添加叶子节点 */
export function addNode(
  root: FormilySchema,
  parentPath: string,
  node: FormilySchema
): boolean {
  const parent = parentPath ? getNode(root, parentPath) : root
  if (!parent) return false
  if (!parent.properties) parent.properties = {}
  if (!node.name) {
    console.warn('[addNode] 节点缺少 name，将在添加时使用默认名称')
    node.name = 'unknown'
  }
  parent.properties[node.name] = node
  return true
}

/** 删除节点 */
export function removeNode(root: FormilySchema, path: string): boolean {
  const result = getParent(root, path)
  if (!result) return false
  const { parent, key } = result
  if (!parent.properties) return false
  delete parent.properties[key]
  return true
}

/** 更新节点属性（包括嵌套） */
export function updateNode(
  root: FormilySchema,
  path: string,
  patch: Partial<FormilySchema>
): boolean {
  const node = getNode(root, path)
  if (!node) return false
  Object.assign(node, patch)
  return true
}

/** 更新节点嵌套属性（如 x-component-props.placeholder） */
export function updateNestedProp(
  root: FormilySchema,
  path: string,
  propPath: string,
  value: any
): boolean {
  const node = getNode(root, path)
  if (!node) return false
  const keys = propPath.split('.')
  let target: any = node
  for (let i = 0; i < keys.length - 1; i++) {
    if (target[keys[i]] === undefined) {
      target[keys[i]] = {}
    }
    target = target[keys[i]]
  }
  target[keys[keys.length - 1]] = value
  return true
}

/** 读取节点嵌套属性 */
export function getNestedProp(
  root: FormilySchema,
  path: string,
  propPath: string
): any {
  const node = getNode(root, path)
  if (!node) return undefined
  const keys = propPath.split('.')
  let target: any = node
  for (const key of keys) {
    if (target === undefined || target === null) return undefined
    target = target[key]
  }
  return target
}

/**
 * 同级节点重新排序（拖拽排序）
 * 仅处理同级节点的顺序调整，不支持跨级移动
 */
export function reorderNode(
  root: FormilySchema,
  fromPath: string,
  toPath: string,
  position: 'before' | 'after'
): boolean {
  // 必须是同级节点
  const fromResult = getParent(root, fromPath)
  const toResult = getParent(root, toPath)
  if (!fromResult || !toResult) return false

  // 必须是同一个父节点
  if (fromResult.parent !== toResult.parent) return false
  if (!fromResult.parent.properties) return false

  // 如果是同一个节点，不做处理
  if (fromResult.key === toResult.key) return true

  // 重建 properties 排序
  const entries = Object.entries(fromResult.parent.properties)
  const fromIndex = entries.findIndex(([k]) => k === fromResult.key)
  const toIndex = entries.findIndex(([k]) => k === toResult.key)

  // 提取要移动的节点
  const [movedEntry] = entries.splice(fromIndex, 1)

  // 计算插入位置（删除后索引可能变化）
  let insertIndex = entries.findIndex(([k]) => k === toResult.key)
  if (insertIndex === -1) insertIndex = entries.length
  if (position === 'after') insertIndex += 1

  entries.splice(insertIndex, 0, movedEntry)

  // 重建 properties
  const newProps: Record<string, FormilySchema> = {}
  for (const [k, v] of entries) {
    newProps[k] = v as FormilySchema
  }
  fromResult.parent.properties = newProps

  return true
}

/** 移动节点（包括拖拽布局） */
export function moveNode(
  root: FormilySchema,
  fromPath: string,
  toPath: string,
  position: 'before' | 'after' | 'inside'
): boolean {
  const fromResult = getParent(root, fromPath)
  const fromNode = getNode(root, fromPath)
  if (!fromResult || !fromNode) return false
  
  // 先复制待移动的节点
  const clonedNode = JSON.parse(JSON.stringify(fromNode))
  
  if (position === 'inside') {
    // 插入到容器
    const container = getNode(root, toPath)
    if (!container) return false
    if (!container.properties) container.properties = {}
    if (!clonedNode.name) clonedNode.name = 'unknown'
    container.properties[clonedNode.name] = clonedNode
    return true
  }
  
  // 同级排序
  const toResult = getParent(root, toPath)
  if (!toResult) return false
  const { parent: toParent, key: toKey } = toResult
  if (!toParent.properties) return false
  
  // 重建 properties 排序
  const entries = Object.entries(toParent.properties)
  const toIndex = entries.findIndex(([k]) => k === toKey)
  
  // 先删除原节点
  if (fromResult.parent.properties) delete fromResult.parent.properties[fromResult.key]
  
  // 插入到目标位置
  const insertIndex = position === 'after' ? toIndex + 1 : toIndex
  entries.splice(insertIndex, 0, [clonedNode.name, clonedNode])
  
  // 重建 properties
  const newProps: Record<string, FormilySchema> = {}
  for (const [k, v] of entries) {
    newProps[k] = k === clonedNode.name ? clonedNode : (v as FormilySchema)
  }
  toParent.properties = newProps
  return true
}
