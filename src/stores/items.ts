import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef, toRaw, triggerRef } from 'vue'

import type { Item } from '@/model/interfaces'
import { toRawDeep } from './utils'

export const useItemsStore = defineStore('items', () => {
  // -----------------------------------------------------------------------
  // state

  const items = shallowRef<Map<string, Item>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  function add(item: Item, { overwrite = true }: { overwrite?: boolean } = {}): boolean {
    if (!overwrite && has(item)) {
      console.debug('Item with ID exists already!', item.id, item)
      return false
    }

    items.value.set(item.id, structuredClone(toRawDeep(item)))
    return true
  }

  function get(id: string): Item | undefined {
    return structuredClone(toRaw(items.value.get(id)))
  }

  function has(idOrItem: Item | string): boolean {
    const id = typeof idOrItem === 'string' ? idOrItem : idOrItem.id
    return items.value.has(id)
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

  return {
    // state
    items,
    // actions
    add,
    get,
    has,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useItemsStore, import.meta.hot))
}
