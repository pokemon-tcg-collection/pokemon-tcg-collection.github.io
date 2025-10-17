import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef, toRaw, triggerRef } from 'vue'

import usePokeTCGCollectorIDB from '@/composables/usePokeTCGCollectorIDB'
import type { Card } from '@/model/interfaces'
import { toRawDeep } from './utils'

export const useCardsStore = defineStore('cards', () => {
  const { put: idbPut, getAll: idbGetAll } = usePokeTCGCollectorIDB('cards')

  // -----------------------------------------------------------------------
  // state

  const cards = shallowRef<Map<string, Card>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  async function add(
    card: Card,
    { overwrite = true }: { overwrite?: boolean } = {},
  ): Promise<boolean> {
    if (!overwrite && has(card)) {
      console.debug('Card with ID exists already!', card.id, card)
      return false
    }

    const copy = structuredClone(toRawDeep(card))
    cards.value.set(card.id, copy)
    await idbPut(copy)

    return true
  }

  function get(id: string): Card | undefined {
    return structuredClone(toRaw(cards.value.get(id)))
  }

  function has(idOrCard: Card | string): boolean {
    const id = typeof idOrCard === 'string' ? idOrCard : idOrCard.id
    return cards.value.has(id)
  }

  async function fetchInfo(idOrCard: Card | string) {
    const id = typeof idOrCard === 'string' ? idOrCard : idOrCard.id
    // TODO ...
    console.warn('[fetchInfo]', 'Not implemented', id)
  }

  // -----------------------------------------------------------------------

  function _serialize(): string {
    const data = Array.from(cards.value.values()).map((card) => toRaw(card))
    return JSON.stringify(data)
  }

  function _deserialize(
    data: string,
    {
      clearBefore = false,
      overwriteExisting = false,
    }: { clearBefore?: boolean; overwriteExisting?: boolean } = {},
  ) {
    let dataDeser: Card[] | undefined = undefined
    try {
      dataDeser = JSON.parse(data) satisfies Card[]
    } catch (err) {
      console.error('Unable to deserialize data', err)
      return false
    }

    if (!dataDeser || !Array.isArray(dataDeser)) return false

    if (clearBefore) _reset()

    dataDeser.forEach((entry) => add(entry, { overwrite: overwriteExisting }))

    // trigger a refresh
    triggerRef(cards)

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
      cards.value.set(entry.id, entry)
    })
  }

  function _reset() {
    cards.value = new Map()
  }

  // -----------------------------------------------------------------------

  return {
    // state
    cards,
    // actions
    add,
    get,
    has,
    fetchInfo,
    // internals
    $serialize: _serialize,
    $deserialize: _deserialize,
    $hydrate: _hydrate,
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCardsStore, import.meta.hot))
}
