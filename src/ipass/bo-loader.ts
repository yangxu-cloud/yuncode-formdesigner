import type { BoFieldMeta } from './bo-mapping'

/** BO 加载器接口预留 */
export interface BoLoader {
  /** 加载指定 BO 的字段元数据 */
  loadFields(boName: string): Promise<BoFieldMeta[]>
  /** 获取可用的 BO 列表 */
  loadBoList(): Promise<{ name: string; label: string }[]>
}

/** 默认空实现，实际对接 IPASS 时替换 */
export const defaultBoLoader: BoLoader = {
  async loadFields() {
    console.warn('[IPASS] BoLoader 未实现，请替换为真实实现')
    return []
  },
  async loadBoList() {
    console.warn('[IPASS] BoLoader 未实现，请替换为真实实现')
    return []
  },
}
