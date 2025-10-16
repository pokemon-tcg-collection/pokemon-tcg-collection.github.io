import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef, toRaw, triggerRef } from 'vue'

import type { Transaction } from '@/model/interfaces'
import { toRawDeep } from './utils'

export const useTransactionsStore = defineStore('transactions', () => {
  // -----------------------------------------------------------------------
  // state

  const transactions = shallowRef<Map<string, Transaction>>(new Map())

  // TODO: lookup by date/type?

  // -----------------------------------------------------------------------
  // actions

  function add(
    transaction: Transaction,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): boolean {
    if (!overwrite && has(transaction)) {
      console.debug('Transaction with ID exists already!', transaction.id, transaction)
      return false
    }

    transactions.value.set(transaction.id, structuredClone(toRawDeep(transaction)))
    return true
  }

  function get(id: string): Transaction | undefined {
    return structuredClone(toRaw(transactions.value.get(id)))
  }

  function has(idOrTransaction: Transaction | string): boolean {
    const id = typeof idOrTransaction === 'string' ? idOrTransaction : idOrTransaction.id
    return transactions.value.has(id)
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(transactions.value.values()).map((transaction) => toRaw(transaction))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Transaction[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Transaction[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(transactions)

    return true
  }

  function _reset() {
    transactions.value = new Map()
  }

  // -----------------------------------------------------------------------

  return {
    // state
    transactions,
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
  import.meta.hot.accept(acceptHMRUpdate(useTransactionsStore, import.meta.hot))
}
