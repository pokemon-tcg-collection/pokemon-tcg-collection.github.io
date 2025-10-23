import { acceptHMRUpdate, defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { readonly, ref, toRaw } from 'vue'
import { useRoute } from 'vue-router'

import usePokemonTCGCollectionIDB from '@/composables/usePokemonTCGCollectionIDB'
import { toRawDeep } from './utils'

export interface AuditMessage {
  id: string
  date: Date
  msg: string
  path: string
  params?: unknown
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const { put: idbPut, getAll: idbGetAll } = usePokemonTCGCollectionIDB('auditLog')

  const route = useRoute()

  // -----------------------------------------------------------------------
  // state

  const logs = ref<AuditMessage[]>([])
  const logsPublic = readonly(logs)

  // -----------------------------------------------------------------------
  // actions

  async function add(msg: string, params?: unknown) {
    const entry = {
      id: uuidv4(),
      msg,
      params: structuredClone(toRawDeep(params)),
      date: new Date(),
      path: route.path,
    } satisfies AuditMessage

    logs.value.push(entry)
    await idbPut(entry)
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(logs.value.values()).map((entry) => toRaw(entry))
    return JSON.stringify(data)
  }

  // -----------------------------------------------------------------------

  // const _isHydrating = ref<boolean>(false)
  const _isHydrated = ref<boolean>(false)

  async function _hydrate() {
    // if (_isHydrating.value) return
    // _isHydrating.value = true

    const values = await idbGetAll()
    if (!values) return

    values.forEach((newEntry) => {
      const isKnown = logs.value.find((entry) => entry.id === newEntry.id)
      if (isKnown) return

      logs.value.push(newEntry)
    })
    values.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    _isHydrated.value = true
    // _isHydrating.value = false
  }

  // -----------------------------------------------------------------------

  return {
    // state
    logs: logsPublic,
    // actions
    add,
    // internals
    $serialize: _serialize,
    $hydrate: _hydrate,
    $isHydrated: readonly(_isHydrated),
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuditLogStore, import.meta.hot))
}
