import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, toRaw, triggerRef } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Set } from '@/model/interfaces'
import { toRawDeep } from '@/utils/reactivity'

export const useSetsStore = defineStore('sets', () => {
  const idbName = 'sets'
  const {
    put: idbPut,
    getAll: idbGetAll,
    delete: idbDelete,
    clear: idbClear,
  } = usePokemonTCGCollectionIDB(idbName)

  // -----------------------------------------------------------------------
  // state

  const sets = ref<Map<string, Set>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  async function add(
    card: Set,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(card)) {
      console.debug('Set with ID exists already!', card.id, card)
      return false
    }

    const copy = structuredClone(toRawDeep(card))
    sets.value.set(card.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Set | undefined {
    return structuredClone(toRaw(sets.value.get(id)))
  }

  function has(idOrSet: Set | string): boolean {
    if (idOrSet === undefined) return false
    const id = typeof idOrSet === 'string' ? idOrSet : idOrSet.id
    return sets.value.has(id)
  }

  async function remove(idOrSet: Set | string) {
    if (idOrSet === undefined) return false
    const id = typeof idOrSet === 'string' ? idOrSet : idOrSet.id
    const removed = sets.value.delete(id)
    if (removed) await idbDelete(id)
    return removed
  }

  async function clear() {
    sets.value.clear()
    await idbClear()
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(sets.value.values()).map((set) => toRaw(set))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Set[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Set[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(sets)

    return true
  }

  function _reset() {
    sets.value = new Map()
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
      sets.value.set(entry.id, entry)
    })

    _isHydrated.value = true
    _isHydrating.value = false
  }

  // -----------------------------------------------------------------------

  return {
    // state
    sets: readonly(sets),
    // actions
    add,
    get,
    has,
    remove,
    clear,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $reset: _reset,
    $hydrate: _hydrate,
    $isHydrated: readonly(_isHydrated),
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSetsStore, import.meta.hot))
}
