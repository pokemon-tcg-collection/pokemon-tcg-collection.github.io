import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef, toRaw, triggerRef } from 'vue'

import usePokeTCGCollectorIDB from '@/composables/usePokeTCGCollectorIDB'
import type { Place } from '@/model/interfaces'
import { toRawDeep } from './utils'

export const usePlacesStore = defineStore('places', () => {
  const { put: idbPut, getAll: idbGetAll } = usePokeTCGCollectorIDB('places')

  // -----------------------------------------------------------------------
  // state

  const places = shallowRef<Map<string, Place>>(new Map())

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
    places.value.set(place.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Place | undefined {
    return structuredClone(toRaw(places.value.get(id)))
  }

  function has(idOrPlace: Place | string): boolean {
    const id = typeof idOrPlace === 'string' ? idOrPlace : idOrPlace.id
    return places.value.has(id)
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

  async function _hydrate({
    clearBefore = false,
    overwriteExisting = false,
  }: { clearBefore?: boolean; overwriteExisting?: boolean } = {}) {
    if (clearBefore) _reset()

    const values = await idbGetAll()
    if (!values) return

    values.forEach((entry) => {
      if (!overwriteExisting && has(entry)) return
      places.value.set(entry.id, entry)
    })
  }

  function _reset() {
    places.value = new Map()
  }

  // -----------------------------------------------------------------------

  return {
    // state
    places,
    // actions
    add,
    get,
    has,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $hydrate: _hydrate,
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlacesStore, import.meta.hot))
}
