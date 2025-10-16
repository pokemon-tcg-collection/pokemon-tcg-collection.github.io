import { acceptHMRUpdate, defineStore } from 'pinia'
import { readonly, ref, toRaw } from 'vue'
import { useRoute } from 'vue-router'

import { toRawDeep } from './utils'

export interface AuditMessage {
  date: Date
  msg: string
  path: string
  params?: unknown
}

export const useAuditLogStore = defineStore('auditLog', () => {
  const route = useRoute()

  // -----------------------------------------------------------------------
  // state

  const logs = ref<AuditMessage[]>([])
  const logsPublic = readonly(logs)

  // -----------------------------------------------------------------------
  // actions

  async function add(msg: string, params?: unknown) {
    const entry = {
      msg,
      params: structuredClone(toRawDeep(params)),
      date: new Date(),
      path: route.path,
    } satisfies AuditMessage

    logs.value.push(entry)
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(logs.value.values()).map((entry) => toRaw(entry))
    return JSON.stringify(data)
  }

  // -----------------------------------------------------------------------

  return {
    // state
    logs: logsPublic,
    // actions
    add,
    // internals
    $serialize: _serialize,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuditLogStore, import.meta.hot))
}
