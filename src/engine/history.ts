import type { FormilySchema } from '@/types'

/** 历史记录管理器，基于 Schema 快照实现撤销/重做 */
export class HistoryManager {
  private stack: FormilySchema[] = []
  private cursor = -1
  private maxSize: number

  constructor(maxSize = 50) {
    this.maxSize = maxSize
  }

  /** 推入快照 */
  push(snapshot: FormilySchema): void {
    // 截断 redo 部分
    this.stack = this.stack.slice(0, this.cursor + 1)
    // 深拷贝
    this.stack.push(JSON.parse(JSON.stringify(snapshot)))
    // 限制大小
    if (this.stack.length > this.maxSize) {
      this.stack.shift()
    }
    this.cursor = this.stack.length - 1
  }

  /** 撤销 */
  undo(): FormilySchema | undefined {
    if (!this.canUndo) return undefined
    this.cursor--
    return JSON.parse(JSON.stringify(this.stack[this.cursor]))
  }

  /** 重做 */
  redo(): FormilySchema | undefined {
    if (!this.canRedo) return undefined
    this.cursor++
    return JSON.parse(JSON.stringify(this.stack[this.cursor]))
  }

  get canUndo(): boolean {
    return this.cursor > 0
  }

  get canRedo(): boolean {
    return this.cursor < this.stack.length - 1
  }

  /** 重置 */
  reset(): void {
    this.stack = []
    this.cursor = -1
  }
}
