import { EventExecutor } from '@/engine/event-executor'
import { useSchemaStore } from '@/stores/schema'
import { message } from 'ant-design-vue'

let executor: EventExecutor | null = null

/**
 * 获取事件执行器单例
 */
export function useEventExecutor() {
  if (!executor) {
    const schemaStore = useSchemaStore()
    executor = new EventExecutor(schemaStore, message)
  }
  return executor
}
