import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, toRaw, triggerRef } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Item } from '@/model/interfaces'
import { toRawDeep } from '@/utils/reactivity'

export const useItemsStore = defineStore('items', () => {
  const { put: idbPut, getAll: idbGetAll, delete: idbDelete } = usePokemonTCGCollectionIDB('items')

  // -----------------------------------------------------------------------
  // state

  const items = ref<Map<string, Item>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  async function add(
    item: Item,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(item)) {
      console.debug('Item with ID exists already!', item.id, item)
      return false
    }

    const copy = structuredClone(toRawDeep(item))
    items.value.set(item.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Item | undefined {
    return structuredClone(toRaw(items.value.get(id)))
  }

  function has(idOrItem: Item | string): boolean {
    if (idOrItem === undefined) return false
    const id = typeof idOrItem === 'string' ? idOrItem : idOrItem.id
    return items.value.has(id)
  }

  async function remove(idOrItem: Item | string) {
    if (idOrItem === undefined) return false
    const id = typeof idOrItem === 'string' ? idOrItem : idOrItem.id
    const removed = items.value.delete(id)
    if (removed) await idbDelete(id)
    return removed
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(items.value.values()).map((item) => toRaw(item))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Item[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Item[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(items)

    return true
  }

  function _reset() {
    items.value = new Map()
  }

  // -----------------------------------------------------------------------

  const _isHydrating = ref<boolean>(false)
  const _isHydrated = ref<boolean>(false)

  async function _hydrate({
    clearBefore = false,
    overwriteExisting = false,
  }: { clearBefore?: boolean; overwriteExisting?: boolean } = {}) {
    if (_isHydrating.value) return
    _isHydrating.value = true

    if (clearBefore) _reset()

    const values = await idbGetAll()
    if (!values) return

    values.forEach((entry) => {
      if (!overwriteExisting && has(entry)) return
      items.value.set(entry.id, entry)
    })

    _isHydrated.value = true
    _isHydrating.value = false
  }

  // -----------------------------------------------------------------------

  return {
    // state
    items,
    // actions
    add,
    get,
    has,
    remove,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $reset: _reset,
    $hydrate: _hydrate,
    $isHydrated: readonly(_isHydrated),
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemsStore, import.meta.hot))
}
