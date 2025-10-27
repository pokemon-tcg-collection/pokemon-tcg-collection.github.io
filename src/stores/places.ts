import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, toRaw, triggerRef } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Place } from '@/model/interfaces'
import { sanitizePlace } from '@/model/utils'
import { toRawDeep } from '@/utils/reactivity'

export const usePlacesStore = defineStore('places', () => {
  const { put: idbPut, getAll: idbGetAll, delete: idbDelete } = usePokemonTCGCollectionIDB('places')

  // -----------------------------------------------------------------------
  // state

  const places = ref<Map<string, Place>>(new Map())

  // TODO: lookup by date/type?

  // -----------------------------------------------------------------------
  // actions

  async function add(
    place: Place,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(place)) {
      console.debug('Place with ID exists already!', place.id, place)
      return false
    }

    const copy = structuredClone(toRawDeep(place))

    // NOTE: sanitize fields that should not exist based on type
    sanitizePlace(copy)

    places.value.set(place.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Place | undefined {
    return structuredClone(toRaw(places.value.get(id)))
  }

  function has(idOrPlace: Place | string): boolean {
    if (idOrPlace === undefined) return false
    const id = typeof idOrPlace === 'string' ? idOrPlace : idOrPlace.id
    return places.value.has(id)
  }

  async function remove(idOrPlace: Place | string) {
    if (idOrPlace === undefined) return false
    const id = typeof idOrPlace === 'string' ? idOrPlace : idOrPlace.id
    const removed = places.value.delete(id)
    if (removed) await idbDelete(id)
    return removed
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(places.value.values()).map((place) => toRaw(place))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Place[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Place[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(places)

    return true
  }

  function _reset() {
    places.value = new Map()
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
      places.value.set(entry.id, entry)
    })

    _isHydrated.value = true
    _isHydrating.value = false
  }

  // -----------------------------------------------------------------------

  return {
    // state
    places: readonly(places),
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
  import.meta.hot.accept(acceptHMRUpdate(usePlacesStore, import.meta.hot))
}
