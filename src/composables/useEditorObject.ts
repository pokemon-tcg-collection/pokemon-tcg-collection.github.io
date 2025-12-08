import { until } from '@vueuse/core'
import type { defineStore } from 'pinia'
import { computed, onMounted, readonly, ref, toRaw } from 'vue'
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
  RouteParamsRawGeneric,
} from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

import type { Card, Item, Place, Set, Transaction } from '@/model/interfaces'
import {
  createNewCard,
  createNewItem,
  createNewPlace,
  createNewSet,
  createNewTransaction,
  isCardChanged,
  isItemChanged,
  isPlaceChanged,
  isSetChanged,
  isTransactionChanged,
} from '@/model/utils'
import type { EditRouteNames } from '@/router/routes'
import { useAuditLogStore } from '@/stores/auditLog'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useSetsStore } from '@/stores/sets'
import { useTemplatesStore } from '@/stores/templates'
import { useTransactionsStore } from '@/stores/transactions'
import { useWorkInProgressStore } from '@/stores/workInProgress'
import { toRawDeep } from '@/utils/reactivity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PiniaStore<T extends (...args: any) => any> = Omit<
  ReturnType<T>,
  keyof ReturnType<typeof defineStore>
>

// see: https://github.com/vuejs/pinia/discussions/1054#discussioncomment-2172110
type UseNullStore = ReturnType<typeof defineStore>
type NullStore = ReturnType<UseNullStore>
type ItemsStore = ReturnType<typeof useItemsStore>
type ItemsStoreSGA = Omit<ItemsStore, keyof NullStore>
type TransactionsStore = ReturnType<typeof useTransactionsStore>
type TransactionsStoreSGA = Omit<TransactionsStore, keyof NullStore>
type PlacesStore = ReturnType<typeof usePlacesStore>
type PlacesStoreSGA = Omit<PlacesStore, keyof NullStore>
type CardsStore = ReturnType<typeof useCardsStore>
type CardsStoreSGA = Omit<CardsStore, keyof NullStore>
type SetsStore = ReturnType<typeof useSetsStore>
type SetsStoreSGA = Omit<SetsStore, keyof NullStore>

interface TypeMap {
  item: {
    object: Item
    store: ItemsStoreSGA
  }
  transaction: {
    object: Transaction
    store: TransactionsStoreSGA
  }
  place: {
    object: Place
    store: PlacesStoreSGA
  }
  card: {
    object: Card
    store: CardsStoreSGA
  }
  set: {
    object: Set
    store: SetsStoreSGA
  }
}

// TODO: how to access dynamic return of "navigateTo"
// NOTE: only works with: ReturnType<typeof useEditorObject<"item", Item, ItemsStore>>
// export type useEditorObjectReturn<
//   TN extends keyof TypeMap,
//   TC extends TypeMap[TN]['object'],
//   TS extends TypeMap[TN]['store'],
// > = ReturnType<typeof useEditorObject<TN, TC, TS>>

export type RouteLocation =
  | string
  | RouteLocationAsRelativeGeneric
  | RouteLocationAsPathGeneric
  | undefined
export type NavigateToName =
  | EditRouteNames
  | 'set-new'
  | 'item-new'
  | 'transaction-new'
  | 'place-new'
export type NavigateToFunc = (
  name: NavigateToName,
  params?: RouteParamsRawGeneric | undefined,
) => Promise<void>
export type ReloadFunc = (opts?: { ignoreTemplate?: boolean }) => Promise<void>

export type ObjectSource = 'store' | 'wip' | 'template' | 'new'

// TODO: refactor into Pinia store to share state between components?
export default function useEditorObject<
  TN extends keyof TypeMap,
  TC extends TypeMap[TN]['object'],
  TS extends TypeMap[TN]['store'],
>(type: TN) {
  const router = useRouter()
  const route = useRoute()

  const wipStore = useWorkInProgressStore()
  const templatesStore = useTemplatesStore()
  const auditLog = useAuditLogStore()

  const objectIdFromParam = computed(() => route.params.id as string | undefined)

  function getStore(type: 'item'): ItemsStoreSGA
  function getStore(type: 'transaction'): TransactionsStoreSGA
  function getStore(type: 'place'): PlacesStoreSGA
  function getStore(type: 'card'): CardsStoreSGA
  function getStore(type: 'set'): SetsStoreSGA
  function getStore(type: TN): TS
  function getStore<TN extends keyof TypeMap>(type: TN) {
    if (type === 'item') return useItemsStore() as ItemsStoreSGA
    if (type === 'transaction') return useTransactionsStore() as TransactionsStoreSGA
    if (type === 'place') return usePlacesStore() as PlacesStoreSGA
    if (type === 'card') return useCardsStore() as CardsStoreSGA
    if (type === 'set') return useSetsStore() as SetsStoreSGA
    return undefined
  }

  function createNewObject(type: 'item', checkForTemplateFirst?: boolean): [Item, boolean]
  function createNewObject(
    type: 'transaction',
    checkForTemplateFirst?: boolean,
  ): [Transaction, boolean]
  function createNewObject(type: 'place', checkForTemplateFirst?: boolean): [Place, boolean]
  function createNewObject(type: 'card', checkForTemplateFirst?: boolean): [Card, boolean]
  function createNewObject(type: 'set', checkForTemplateFirst?: boolean): [Set, boolean]
  function createNewObject(type: TN, checkForTemplateFirst?: boolean): [TC, boolean]
  function createNewObject<TN extends keyof TypeMap>(
    type: TN,
    checkForTemplateFirst: boolean = true,
  ) {
    if (checkForTemplateFirst && templatesStore.has(type)) {
      const object = templatesStore.get(type)
      if (object !== undefined) return [object, true]
    }

    if (type === 'item') return [createNewItem(), false]
    if (type === 'transaction') return [createNewTransaction(), false]
    if (type === 'place') return [createNewPlace(), false]
    if (type === 'card') return [createNewCard(), false]
    if (type === 'set') return [createNewSet(), false]

    return [undefined, false]
  }

  const objectsStore = getStore(type)

  const existsAsDraft = computed(
    () => objectIdFromParam.value !== undefined && wipStore.has(objectIdFromParam.value),
  )
  const existsInStore = computed(
    () => objectIdFromParam.value !== undefined && objectsStore.has(objectIdFromParam.value),
  )

  const newObjectIsFromTemplate = computed(() => templatesStore.has(type))

  const objectSource = ref<ObjectSource>()
  const objectBase = ref<TC>()
  const object = ref<TC>()

  const objectChanged = computed(() => {
    if (type === 'item') {
      type OT = TypeMap['item']['object'] | undefined
      return isItemChanged(objectBase.value as OT, object.value as OT)
    }
    if (type === 'transaction') {
      type OT = TypeMap['transaction']['object'] | undefined
      return isTransactionChanged(objectBase.value as OT, object.value as OT)
    }
    if (type === 'place') {
      type OT = TypeMap['place']['object'] | undefined
      return isPlaceChanged(objectBase.value as OT, object.value as OT)
    }
    if (type === 'card') {
      type OT = TypeMap['card']['object'] | undefined
      return isCardChanged(objectBase.value as OT, object.value as OT)
    }
    if (type === 'set') {
      type OT = TypeMap['set']['object'] | undefined
      return isSetChanged(objectBase.value as OT, object.value as OT)
    }
    return false
  })

  async function _loadObject({ ignoreTemplate = false }: { ignoreTemplate?: boolean } = {}) {
    let objectGot: TC | undefined = undefined
    if (objectIdFromParam.value !== undefined) {
      await until(
        () => wipStore.$isHydrated && (objectsStore as unknown as NullStore).$isHydrated,
      ).toBeTruthy()

      // TODO: do chain with checks for undefined?
      if (existsAsDraft.value) {
        objectGot = wipStore.get<TC>(objectIdFromParam.value)!
        objectSource.value = 'wip'
      } else if (existsInStore.value) {
        objectGot = objectsStore.get(objectIdFromParam.value)! as TC
        objectSource.value = 'store'
      }
    } else {
      await until(() => templatesStore.$isHydrated).toBeTruthy()

      const [newObj, isFromTemplate] = createNewObject(type, !ignoreTemplate)
      objectGot = newObj
      objectSource.value = isFromTemplate ? 'template' : 'new'
    }
    if (objectGot !== undefined) {
      objectBase.value = structuredClone(objectGot)
      object.value = objectGot
    }
  }

  onMounted(_loadObject)

  async function save(replaceHistory: boolean = true) {
    if (!object.value) return

    // update metadata and add/update in store
    if (existsInStore.value) {
      object.value._meta.edited = new Date()
    }
    // hack, who knows how to correctly do this
    await (objectsStore as { add(object: TC): Promise<boolean> }).add(object.value)

    // finish draft
    if (wipStore.has(object.value.id)) {
      await wipStore.finish(object.value.id)
    }

    // update base version, so no edit changes should be found
    objectBase.value = structuredClone(toRawDeep(object.value))
    objectSource.value = 'store'

    if (replaceHistory && route.name !== `${type}-edit`) {
      // do a history replace with object-edit and then use the browser history?
      await router.replace({
        name: `${type}-edit`,
        params: { id: object.value.id },
        query: route.query,
      })
    }
  }

  async function saveAsDraft(replaceHistory: boolean = true) {
    if (!object.value) return

    // do temp save to allow to return back here
    await wipStore.add(object.value.id, `${type}-edit`, toRawDeep(object.value))

    // update base version, so no edit changes should be found
    objectBase.value = structuredClone(toRawDeep(object.value))
    objectSource.value = 'wip'

    if (replaceHistory) {
      // do a history replace with object-edit and then use the browser history?
      await router.replace({
        name: `${type}-edit`,
        params: { id: object.value.id },
        query: route.query,
      })
    }
  }

  async function setAsTemplate(replaceObjectBase: boolean = false) {
    if (!object.value) return

    // only update template for type
    await templatesStore.add(type, toRawDeep(object.value))

    if (replaceObjectBase) {
      // update base version?, so no edit changes should be found
      objectBase.value = structuredClone(toRawDeep(object.value))
      objectSource.value = 'template'
    }
  }

  function discardChanges() {
    // reset editable object
    object.value = structuredClone(toRawDeep(objectBase.value))
  }

  async function remove() {
    if (!object.value) return

    auditLog.add(`Delete ${type}`, { [type]: toRaw(object.value) })

    // hack type check (again)
    await (objectsStore as { remove(object: TC): Promise<boolean> }).remove(object.value)

    if (wipStore.has(object.value.id)) {
      await wipStore.finish(object.value.id)
    }
  }

  const returnLocation = computed(
    () =>
      (route.query.returnTo !== undefined
        ? JSON.parse(route.query.returnTo as string)
        : undefined) as RouteLocation,
  )

  async function navigateTo(name: NavigateToName, params?: RouteParamsRawGeneric | undefined) {
    if (!object.value) return

    await router.push({
      name: name,
      ...(params !== undefined ? { params } : {}),
      query: {
        returnTo: JSON.stringify({
          name: `${type}-edit`,
          params: { id: object.value.id },
          query: route.query,
        }),
      },
    })
  }

  return {
    store: objectsStore,
    object,
    objectBase: readonly(objectBase),
    objectSource: readonly(objectSource),
    objectChanged,
    objectIdFromParam,
    existsAsDraft,
    existsInStore,
    newObjectIsFromTemplate,
    returnLocation,
    save,
    saveAsDraft,
    setAsTemplate,
    delete: remove,
    discardChanges,
    navigateTo,
    reload: _loadObject,
  }
}
