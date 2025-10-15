import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'

import type { EditRouteNames } from '@/router/routes'

export interface WIPObject {
  /** global unique internal id (no duplicates across different object types) */
  id: string
  /** route name to finish editing the object */
  type: string
  /** date when object was created/saved-for-later */
  date: Date
  /** object data */
  data: unknown
}

export const useWorkInProgressStore = defineStore('workInProgress', () => {
  // -----------------------------------------------------------------------
  // state

  const objects = shallowRef<Map<string, object>>(new Map())

  // -------------------------------------------------------------------------
  // actions

  function add(id: string, editRouteName: EditRouteNames, wip: unknown) {
    if (objects.value.has(id)) {
      console.warn('Already has object with same id!', id, { old: objects.value.get(id), new: wip })
    }

    objects.value.set(id, {
      id,
      type: editRouteName,
      date: new Date(),
      data: wip,
    } satisfies WIPObject)
  }

  function has(id: string): boolean {
    return objects.value.has(id)
  }

  function getWithInfo(id: string): WIPObject | undefined {
    return objects.value.get(id) as WIPObject
  }

  function get<T>(id: string): T | undefined {
    return getWithInfo(id)?.data as T
  }

  function finish(id: string) {
    if (!objects.value.has(id)) {
      console.warn('No WIP object found!', id)
      // return
    }

    return objects.value.delete(id)
  }

  function clear() {
    objects.value.clear()
  }

  // -------------------------------------------------------------------------

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
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkInProgressStore, import.meta.hot))
}
