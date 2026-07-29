import type { MaterialDescriptor, MaterialGroup, PropsConfigGroup } from '@/types'

/**
 * 物料注册中心
 * 所有组件物料（内置 + 自定义）通过此注册中心统一管理
 * 设计器本身不硬编码任何组件
 */
export class MaterialRegistry {
  private materials: Map<string, MaterialDescriptor> = new Map()
  /** 按组件名存储扩展属性组 */
  private propsExtensions: Map<string, PropsConfigGroup[]> = new Map()

  /** 注册单个物料 */
  register(material: MaterialDescriptor): void {
    if (this.materials.has(material.name)) {
      console.warn(`[Registry] 物料 "${material.name}" 已存在，将被覆盖`)
    }
    this.materials.set(material.name, material)
  }

  /** 批量注册 */
  registerAll(materials: MaterialDescriptor[]): void {
    materials.forEach((m) => this.register(m))
  }

  /** 获取物料 */
  get(name: string): MaterialDescriptor | undefined {
    return this.materials.get(name)
  }

  /** 获取全部物料 */
  getAll(): MaterialDescriptor[] {
    return Array.from(this.materials.values())
  }

  /** 按分组获取物料 */
  getGroups(): Map<string, MaterialDescriptor[]> {
    const groups = new Map<string, MaterialDescriptor[]>()
    for (const material of this.materials.values()) {
      const list = groups.get(material.group) || []
      list.push(material)
      groups.set(material.group, list)
    }
    // 每组内按 order 排序
    for (const [key, list] of groups) {
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      groups.set(key, list)
    }
    return groups
  }

  /** 判断是否为容器组件 */
  isContainer(name: string): boolean {
    return this.materials.get(name)?.isContainer ?? false
  }

  /** 向指定组件注入扩展属性组 */
  registerPropsGroup(targetComponent: string, group: PropsConfigGroup): void {
    const list = this.propsExtensions.get(targetComponent) || []
    list.push(group)
    this.propsExtensions.set(targetComponent, list)
  }

  /** 获取组件的全部属性配置（物料自带 + 扩展注入） */
  getPropsConfig(name: string): PropsConfigGroup[] {
    const material = this.materials.get(name)
    if (!material) return []
    const builtIn = material.propsConfig || []
    const extensions = this.propsExtensions.get(name) || []
    return [...builtIn, ...extensions]
  }
}

/** 全局单例 */
export const registry = new MaterialRegistry()
