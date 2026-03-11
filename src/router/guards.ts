import { until } from '@vueuse/core'
import type {
  RouteLocationNormalizedGeneric,
  RouteLocationNormalizedLoadedGeneric,
} from 'vue-router'

import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const GUARDS = [
  { names: ['card', 'card-edit'], storeFn: useCardsStore, fallback: { name: 'card-list' } },
  { names: ['place', 'place-edit'], storeFn: usePlacesStore, fallback: { name: 'place-list' } },
  { names: ['item', 'item-edit'], storeFn: useItemsStore, fallback: { name: 'item-list' } },
  {
    names: ['transaction', 'transaction-edit'],
    storeFn: useTransactionsStore,
    fallback: { name: 'transaction-list' },
  },
] as const

// guard navigation to hang on pages without valid/existing object, redirect back to overview pages
export async function beforeEachCheckValidObjectIDs(
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedLoadedGeneric,
) {
  console.debug('[beforeEach]', { to, from })

  const target = to.name
  if (typeof target === 'string') {
    for (const guard of GUARDS) {
      if ((guard.names as unknown as string[]).includes(target)) {
        // get store and wait until fully loaded
        const store = guard.storeFn()
        await until(() => store.$isHydrated).toBeTruthy()
        // check if invalid
        const objId = to.params.id
        if (objId === undefined || !store.has(objId as string)) {
          console.warn('No object found with ID', objId)

          // try to check work-in-progess store (may be a new object)
          const wipStore = useWorkInProgressStore()
          await until(() => wipStore.$isHydrated).toBeTruthy()
          if (!wipStore.has(objId as string)) {
            console.warn('No object (work-in-progress state) found with ID', objId)
            return guard.fallback
          }
          // TODO: do we want to type-check?
        }
        // is valid, do navigate
        return true
      }
    }
  }
}
