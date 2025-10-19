import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef, toRaw } from 'vue'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import type { Card, Item, Place, Transaction } from '@/model/interfaces'
import type { EditRouteNames } from '@/router/routes'
import { toRawDeep } from './utils'

export type WIPObjectType = 'card-edit' | 'transaction-edit' | 'item-edit' | 'place-edit'
export type WIPObjectData = Transaction | Card | Place | Item
export interface WIPObject {
  /** global unique internal id (no duplicates across different object types) */
  id: string
  /** route name to finish editing the object */
  type: WIPObjectType
  /** date when object was created/saved-for-later */
  date: Date
  /** object data */
  data: WIPObjectData
}

export const useWorkInProgressStore = defineStore('workInProgress', () => {
  const {
    put: idbPut,
    getAll: idbGetAll,
    delete: idbDelete,
    clear: idbClear,
  } = usePokemonTCGCollectionIDB('workInProgress')

  // -----------------------------------------------------------------------
  // state

  const objects = shallowRef<Map<string, WIPObject>>(new Map())

  // -------------------------------------------------------------------------
  // actions

  async function add(id: string, editRouteName: EditRouteNames, wip: WIPObjectData) {
    if (objects.value.has(id)) {
      console.warn('Already has object with same id!', id, { old: objects.value.get(id), new: wip })
    }

    const obj = {
      id,
      type: editRouteName,
      date: new Date(),
      data: structuredClone(toRawDeep(wip)),
    } satisfies WIPObject
    objects.value.set(id, obj)
    await idbPut(obj)
  }

  function has(id: string): boolean {
    return objects.value.has(id)
  }

  function getWithInfo(id: string): WIPObject | undefined {
    return objects.value.get(id) as WIPObject
  }

  function get<T>(id: string): T | undefined {
    return structuredClone(toRaw(getWithInfo(id)?.data)) as T
  }

  async function finish(id: string) {
    if (!objects.value.has(id)) {
      console.warn('No WIP object found!', id)
      // return
    }

    const deleted = objects.value.delete(id)
    await idbDelete(id)
    return deleted
  }

  async function clear() {
    objects.value.clear()
    await idbClear()
  }

  // -------------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(objects.value.values()).map((card) => toRaw(card))
    return JSON.stringify(data)
  }

  async function _hydrate({
    clearBefore = false,
    overwriteExisting = false,
  }: { clearBefore?: boolean; overwriteExisting?: boolean } = {}) {
    if (clearBefore) _reset()

    const values = await idbGetAll()
    if (!values) return

    values.forEach((entry) => {
      if (!overwriteExisting && has(entry.id)) return
      objects.value.set(entry.id, entry)
    })
  }

  function _reset() {
    objects.value = new Map()
  }

  // -------------------------------------------------------------------------

  return {
    // state
    objects,
    // actions
    add,
    has,
    getWithInfo,
    get,
    finish,
    clear,
    // internals
    $serialize: _serialize,
    $hydrate: _hydrate,
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkInProgressStore, import.meta.hot))
}
