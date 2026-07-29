import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface BoField {
  name: string
  label: string
  type: string
  required?: boolean
  children?: BoField[]
}

export interface BoTable {
  name: string
  label: string
  isMain: boolean
  fields: BoField[]
}

export const useDesignerStore = defineStore('designer', () => {
  const selectedPath = ref<string | null>(null)
  const hoveredPath = ref<string | null>(null)
  const draggingMaterial = ref<string | null>(null)
  const draggingPath = ref<string | null>(null)
  const boTables = ref<BoTable[]>([])
  const selectedBoName = ref<string | null>(null)

  function selectNode(path: string | null) {
    selectedPath.value = path
  }

  function hoverNode(path: string | null) {
    hoveredPath.value = path
  }

  function setDragging(name: string | null) {
    draggingMaterial.value = name
  }

  function setDraggingPath(path: string | null) {
    draggingPath.value = path
  }

  function setBoTables(tables: BoTable[]) {
    boTables.value = tables
    if (tables.length > 0 && !selectedBoName.value) {
      selectedBoName.value = tables[0].name
    }
  }

  function selectBo(name: string | null) {
    selectedBoName.value = name
  }

  return {
    selectedPath,
    hoveredPath,
    draggingMaterial,
    draggingPath,
    boTables,
    selectedBoName,
    selectNode,
    hoverNode,
    setDragging,
    setDraggingPath,
    setBoTables,
    selectBo,
  }
})
