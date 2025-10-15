import { shallowRef, toRaw } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import type { Card } from '@/model/interfaces'

export const useCardsStore = defineStore('cards', () => {
  // -----------------------------------------------------------------------
  // state

  const cards = shallowRef<Map<string, Card>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  function add(card: Card, { overwrite = true }: { overwrite?: boolean } = {}): boolean {
    if (!overwrite) {
      if (!has(card)) {
        cards.value.set(card.id, card)
        return true
      } else {
        console.debug('Card with ID exists already!', card.id, card)
        return false
      }
    }

    cards.value.set(card.id, card)
    return true
  }

  function get(id: string): Card | undefined {
    return cards.value.get(id)
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

    return true
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
    $reset: _reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCardsStore, import.meta.hot))
}
