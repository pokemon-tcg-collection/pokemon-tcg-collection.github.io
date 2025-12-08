import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, toRaw } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Card, Item, Place, Set, Transaction } from '@/model/interfaces'
import { makeObjectUniqueCopy } from '@/model/utils'
import { toRawDeep } from '@/utils/reactivity'

export type TemplateObjectType = 'transaction' | 'card' | 'set' | 'place' | 'item'
export type TemplateObjectData = Transaction | Card | Set | Place | Item

export interface TemplateObject {
  /** template object type */
  type: TemplateObjectType
  /** template object */
  data: TemplateObjectData
}

export const useTemplatesStore = defineStore('templates', () => {
  const idbName = 'templates'
  const {
    put: idbPut,
    getAll: idbGetAll,
    delete: idbDelete,
    clear: idbClear,
  } = usePokemonTCGCollectionIDB(idbName)

  // -----------------------------------------------------------------------
  // state

  const templates = ref<Map<TemplateObjectType, TemplateObjectData>>(new Map())

  // -------------------------------------------------------------------------
  // actions

  async function add(
    type: 'transaction',
    template: Transaction,
    opts?: { overwrite?: boolean },
  ): Promise<boolean>
  async function add(type: 'card', template: Card, opts?: { overwrite?: boolean }): Promise<boolean>
  async function add(type: 'set', template: Set, opts?: { overwrite?: boolean }): Promise<boolean>
  async function add(
    type: 'place',
    template: Place,
    opts?: { overwrite?: boolean },
  ): Promise<boolean>
  async function add(type: 'item', template: Item, opts?: { overwrite?: boolean }): Promise<boolean>
  async function add(
    type: TemplateObjectType,
    template: TemplateObjectData,
    opts?: { overwrite?: boolean },
  ): Promise<boolean>
  async function add(
    type: TemplateObjectType,
    template: TemplateObjectData,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(type)) {
      console.debug('Template with type exists already!', type, template)
      return false
    }

    const copy = structuredClone(toRawDeep(template))
    templates.value.set(type, copy)
    await idbPut({ type, data: copy })

    return true
  }

  function has(type: TemplateObjectType): boolean {
    return templates.value.has(type)
  }

  function get(type: 'transaction'): Transaction
  function get(type: 'card'): Card
  function get(type: 'set'): Set
  function get(type: 'place'): Place
  function get(type: 'item'): Item
  function get(type: TemplateObjectType): TemplateObjectData
  function get<T extends TemplateObjectData>(type: TemplateObjectType): T | undefined {
    const object = templates.value.get(type)
    const copy = structuredClone(toRaw(object)) as T
    // override ID/metadata, important! so each new templated object is unique
    return makeObjectUniqueCopy(copy, false)
  }

  async function remove(type: TemplateObjectType) {
    if (type === undefined) return false
    if (!templates.value.has(type)) {
      console.warn('No template object found!', type)
      // return
    }

    const removed = templates.value.delete(type)
    if (removed) await idbDelete(type)
    return removed
  }

  async function clear() {
    templates.value.clear()
    await idbClear()
  }

  // -------------------------------------------------------------------------

  function _serialize(): string {
    const data = Object.fromEntries(
      Array.from(templates.value.entries()).map(([type, obj]) => [type, toRaw(obj)]),
    )
    return JSON.stringify(data)
  }

  function _reset() {
    templates.value = new Map()
  }

  // -------------------------------------------------------------------------

  const _isHydrated = ref<boolean>(false)

  async function _hydrate({
    clearBefore = false,
    overwriteExisting = false,
  }: { clearBefore?: boolean; overwriteExisting?: boolean } = {}) {
    if (clearBefore) _reset()

    const values = await idbGetAll()
    if (!values) return

    values.forEach((entry) => {
      if (!overwriteExisting && has(entry.type)) return
      templates.value.set(entry.type, entry.data)
    })

    _isHydrated.value = true
  }

  // -------------------------------------------------------------------------

  return {
    // state
    templates: readonly(templates),
    // actions
    add,
    has,
    get,
    remove,
    clear,
    // internals
    $serialize: _serialize,
    $reset: _reset,
    $hydrate: _hydrate,
    $isHydrated: _isHydrated,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTemplatesStore, import.meta.hot))
}
