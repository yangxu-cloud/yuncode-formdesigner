import type { FormilySchema } from '@/types'

/**
 * 通用组件布局算法
 * 用于计算容器组件内的行布局
 */

export interface LayoutItem {
  key: string
  path: string
  node: FormilySchema
  span: number
  row: number
  col: number
}

export interface LayoutRow {
  rowNum: number
  items: LayoutItem[]
  totalCols: number
}

/**
 * 根据行内组件数计算每个组件的 span
 *
 * 布局规则：
 * - 1个组件：4/4（占满整行）
 * - 2个组件：2/4, 2/4（各占一半）
 * - 3个组件：1/4, 1/4, 2/4（两个1/4，一个1/2）
 * - 4个及以上：每个1/4
 *
 * @param count 组件数量
 * @returns span 数组
 */
export function calcSpans(count: number): number[] {
  if (count <= 0) return []
  if (count === 1) return [4]        // 1个组件：占满整行
  if (count === 2) return [2, 2]     // 2个组件：各占一半
  if (count === 3) return [1, 1, 2]  // 3个组件：两个1/4，一个1/2
  return Array(Math.min(count, 4)).fill(1)  // 4个及以上：每个1/4
}

/**
 * 通用布局计算函数
 * 根据 properties 计算行布局
 * @param properties 组件属性对象
 * @param basePath 基础路径（用于拼接完整路径）
 * @returns 行布局数组
 */
export function calcLayout(properties: Record<string, FormilySchema>, basePath: string = ''): LayoutRow[] {
  if (!properties || Object.keys(properties).length === 0) return []

  // 按 x-row 分组、按 x-col 排序
  let maxRow = 0
  const itemsWithPos: Array<{ key: string; node: FormilySchema; row: number; col: number }> = []

  for (const [key, node] of Object.entries(properties)) {
    const row = node['x-row'] ?? (maxRow + 1)
    const col = node['x-col'] ?? (itemsWithPos.filter(i => i.row === row).length + 1)
    if (row > maxRow) maxRow = row
    itemsWithPos.push({ key, node, row, col })
  }

  const rowMap = new Map<number, typeof itemsWithPos>()
  for (const item of itemsWithPos) {
    if (!rowMap.has(item.row)) rowMap.set(item.row, [])
    rowMap.get(item.row)!.push(item)
  }

  const result: LayoutRow[] = []
  const sortedRows = [...rowMap.keys()].sort((a, b) => a - b)

  for (let i = 0; i < sortedRows.length; i++) {
    const rowNum = sortedRows[i]
    const rowItems = rowMap.get(rowNum)!
    rowItems.sort((a, b) => a.col - b.col)

    // 计算每个组件的 span
    const autoSpans = calcSpans(rowItems.length)

    result.push({
      rowNum: i + 1,
      items: rowItems.map((item, idx) => ({
        key: item.key,
        path: basePath ? `${basePath}.${item.key}` : item.key,
        node: item.node,
        span: (item.node['x-span'] as number) || autoSpans[idx] || 1,
        row: item.row,
        col: item.col,
      })),
      totalCols: 4,
    })
  }

  return result
}

/**
 * 计算新组件应该插入的行号和列号
 *
 * 布局规则：
 * - 1个组件：占满整行（1行 x 4列）
 * - 2个组件：两行，每行2个（2行 x 2列）
 * - 3个组件：三行（1+1+2 或 1+1+1+1）
 * - 4个组件：四行，每行1个（4行 x 1列）
 * - 5个及以上：每行4个，最后一行可能不满
 *
 * @param properties 已有的组件属性
 * @param targetRow 目标行号（可选，如果不提供则自动计算）
 * @returns 新组件的行号和列号
 */
export function calcNewPosition(properties: Record<string, FormilySchema>, targetRow?: number): { row: number; col: number } {
  if (!properties || Object.keys(properties).length === 0) {
    return { row: 1, col: 1 }
  }

  // 如果指定了目标行，就在目标行添加
  if (targetRow !== undefined) {
    const rowItems = Object.entries(properties).filter(([, node]) => (node['x-row'] ?? 1) === targetRow)
    const col = rowItems.length + 1

    // 如果目标行已有2个组件，则添加到下一行
    if (rowItems.length >= 2) {
      return { row: targetRow + 1, col: 1 }
    }

    return { row: targetRow, col }
  }

  // 统计当前组件数量
  const totalComponents = Object.keys(properties).length

  // 根据组件数量决定布局
  switch (totalComponents) {
    case 0:
      // 第1个组件：占满整行
      return { row: 1, col: 1 }
    case 1:
      // 第2个组件：变成2行，每行2个
      return { row: 2, col: 1 }
    case 2:
      // 第3个组件：变成3行（1+1+2）
      return { row: 3, col: 1 }
    case 3:
      // 第4个组件：变成4行，每行1个
      return { row: 4, col: 1 }
    default:
      // 第5个及以后：每行4个，添加到最后一行
      let maxRow = 0
      const rowCounts = new Map<number, number>()

      for (const [, node] of Object.entries(properties)) {
        const row = node['x-row'] ?? 1
        if (row > maxRow) maxRow = row
        rowCounts.set(row, (rowCounts.get(row) ?? 0) + 1)
      }

      const lastRow = rowCounts.get(maxRow) ?? 0
      if (lastRow < 4) {
        // 当前行还有空间
        return { row: maxRow, col: lastRow + 1 }
      } else {
        // 当前行已满，添加到下一行
        return { row: maxRow + 1, col: 1 }
      }
  }
}

/**
 * 获取容器的子组件属性
 * @param containerNode 容器节点
 * @returns 子组件属性对象
 */
export function getContainerProperties(containerNode: FormilySchema): Record<string, FormilySchema> {
  return containerNode.properties || {}
}
