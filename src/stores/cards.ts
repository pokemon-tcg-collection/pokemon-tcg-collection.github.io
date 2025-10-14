import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from '@/model/interfaces'

export const useCardsStore = defineStore('cards', () => {
  // -----------------------------------------------------------------------
  // state

  const cards = shallowRef<Map<string, Card>>(new Map())

  // -----------------------------------------------------------------------
  // actions

  function add(card: Card) {
    cards.value.set(card.id, card)
  }

  function get(id: string): Card | undefined {
    return cards.value.get(id)
  }

  function has(id: string): boolean {
    return cards.value.has(id)
  }

  async function fetchInfo(idOrCard: Card | string) {
    const id = typeof idOrCard === 'string' ? idOrCard : idOrCard.id
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
  }
})
