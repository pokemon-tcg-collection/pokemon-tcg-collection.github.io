import { computed } from 'vue'

import type { ItemType, ItemTypeTypes } from '@/model/interfaces'
import { ITEM_TYPES } from '@/model/interfaces'
import { useItemsStore } from '@/stores/items'

export default function useItemsStats() {
  const itemsStore = useItemsStore()

  const numItems = computed(() => itemsStore.items.size)

  const numItemsPerType = computed(() =>
    Array.from(itemsStore.items.values())
      .map((item) => item.type)
      .filter((typeType) => typeType !== undefined)
      .reduce((map, cur) => map.set(cur, map.get(cur) ?? 0 + 1), new Map<ItemType, number>()),
  )

  const numItemsPerTypeType = computed(() =>
    Array.from(itemsStore.items.values())
      .map((item) => item.type)
      .map((type) => ITEM_TYPES.find((item) => item.id === type)?.type)
      .filter((typeType) => typeType !== undefined)
      .reduce(
        (map, cur) => map.set(cur, (map.get(cur) ?? 0) + 1),
        new Map<ItemTypeTypes, number>(),
      ),
  )

  return { numItems, numItemsPerType, numItemsPerTypeType }
}
