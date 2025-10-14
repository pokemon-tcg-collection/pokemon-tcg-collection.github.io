import { readonly, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'

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

  const logs = shallowRef<AuditMessage[]>([])
  const logsPublic = readonly(logs)

  // -----------------------------------------------------------------------
  // actions

  async function add(msg: string, params?: unknown) {
    const entry = {
      msg,
      params,
      date: new Date(),
      path: route.path,
    } satisfies AuditMessage

    logs.value.push(entry)
  }

  // -----------------------------------------------------------------------

  return {
    // state
    logsPublic,
    // actions
    add,
  }
})
