import type { Base, Card, Item, Place, Set, Transaction } from '@/model/interfaces'
import { useCardsStore } from '@/stores/cards'
import { useItemsStore } from '@/stores/items'
import { usePlacesStore } from '@/stores/places'
import { useSetsStore } from '@/stores/sets'
import { useTransactionsStore } from '@/stores/transactions'

// -------------------------------------------------------------------------

// TODO: + attachment, + image
export type ObjectType = 'card' | 'set' | 'item' | 'place' | 'transaction'

export type RelatedIDs = {
  id: string
  type: ObjectType
  name: string | undefined
  direction: 'incoming' | 'outgoing'
  outgoingTargetExists?: boolean
}

// -------------------------------------------------------------------------

// NOTE: only work with active application/pinia context

// <item> --> item
export function gatherItemOutgoingRelations(
  item: Item,
  checkOutgoingTargetExists: boolean = true,
  objectTypes?: ObjectType[],
) {
  const objectId = item.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // item --> n items
  if (objectTypes === undefined || objectTypes.includes('item')) {
    const itemsStore = useItemsStore()

    item.contents?.forEach((itemContent) => {
      if (!itemContent.item_id) return
      const relItem = itemsStore.get(itemContent.item_id)
      if (!relItem) {
        if (!checkOutgoingTargetExists) {
          related.push({
            id: itemContent.item_id,
            name: undefined,
            type: 'item',
            direction: 'outgoing',
            outgoingTargetExists: false,
          })
        }
        return
      }
      related.push({ id: relItem.id, name: relItem.name, type: 'item', direction: 'outgoing' })
    })
  }

  // TODO: item --> n sets

  return related
}

// item|transaction|card --> <item>
export function gatherItemIncomingRelations(item: Item, objectTypes?: ObjectType[]) {
  const objectId = item.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // item --> n items
  if (objectTypes === undefined || objectTypes.includes('item')) {
    const itemsStore = useItemsStore()

    Array.from(itemsStore.items.values())
      .filter(
        (item) =>
          item.id !== objectId &&
          item.contents?.some((contentItem) => contentItem.item_id === objectId),
      )
      .forEach((item) =>
        related.push({ id: item.id, name: item.name, type: 'item', direction: 'incoming' }),
      )
  }

  // transaction --> n items
  if (objectTypes === undefined || objectTypes.includes('transaction')) {
    const transactionsStore = useTransactionsStore()

    Array.from(transactionsStore.transactions.values())
      .filter((transaction) =>
        transaction.items?.some((transactionItem) => transactionItem.item_id === objectId),
      )
      .forEach((transaction) =>
        related.push({
          id: transaction.id,
          name: transaction.name,
          type: 'transaction',
          direction: 'incoming',
        }),
      )
  }

  // card --> n items
  if (objectTypes === undefined || objectTypes.includes('card')) {
    const cardsStore = useCardsStore()

    Array.from(cardsStore.cards.values())
      .filter((card) => card.item_ids?.includes(objectId))
      .forEach((card) =>
        related.push({ id: card.id, name: card.name, type: 'card', direction: 'incoming' }),
      )
  }

  return related
}

// <place> --> ?
export function gatherPlaceOutgoingRelations(
  place: Place,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _checkOutgoingTargetExists: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _objectTypes?: ObjectType[],
) {
  const objectId = place.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // place --> ? ?

  return related
}

// transaction --> <place>
export function gatherPlaceIncomingRelations(place: Place, objectTypes?: ObjectType[]) {
  const objectId = place.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // transaction --> 1 place
  if (objectTypes === undefined || objectTypes.includes('transaction')) {
    const transactionsStore = useTransactionsStore()

    Array.from(transactionsStore.transactions.values())
      .filter((transaction) => transaction.place_id === objectId)
      .forEach((transaction) =>
        related.push({
          id: transaction.id,
          name: transaction.name,
          type: 'transaction',
          direction: 'incoming',
        }),
      )
  }

  return related
}

// <transaction> --> place|item
export function gatherTransactionOutgoingRelations(
  transaction: Transaction,
  checkOutgoingTargetExists: boolean = true,
  objectTypes?: ObjectType[],
) {
  const objectId = transaction.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // transaction --> 1 place
  if (objectTypes === undefined || objectTypes.includes('place')) {
    if (transaction.place_id) {
      const placesStore = usePlacesStore()

      const place = placesStore.get(transaction.place_id)
      if (place) {
        related.push({ id: place.id, name: place.name, type: 'place', direction: 'outgoing' })
      } else {
        if (!checkOutgoingTargetExists) {
          related.push({
            id: transaction.place_id,
            name: undefined,
            type: 'place',
            direction: 'outgoing',
            outgoingTargetExists: false,
          })
        }
      }
    }
  }

  // transaction --> n items
  if (objectTypes === undefined || objectTypes.includes('item')) {
    const itemsStore = useItemsStore()

    transaction.items?.forEach((transactionItem) => {
      const item = itemsStore.get(transactionItem.item_id)
      if (!item) {
        if (!checkOutgoingTargetExists) {
          related.push({
            id: transactionItem.item_id,
            name: undefined,
            type: 'item',
            direction: 'outgoing',
            outgoingTargetExists: false,
          })
        }
        return
      }
      related.push({ id: item.id, name: item.name, type: 'item', direction: 'outgoing' })
    })
  }

  return related
}

// card --> <transaction>
export function gatherTransactionIncomingRelations(
  transaction: Transaction,
  objectTypes?: ObjectType[],
) {
  const objectId = transaction.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // card --> n transactions
  if (objectTypes === undefined || objectTypes.includes('card')) {
    const cardsStore = useCardsStore()

    Array.from(cardsStore.cards.values())
      .filter((card) => card.transaction_ids?.includes(objectId))
      .forEach((card) =>
        related.push({ id: card.id, name: card.name, type: 'card', direction: 'incoming' }),
      )
  }

  return related
}

// <card> --> item|transaction|set
export function gatherCardOutgoingRelations(
  card: Card,
  checkOutgoingTargetExists: boolean = true,
  objectTypes?: ObjectType[],
) {
  const objectId = card.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // card --> n items
  if (objectTypes === undefined || objectTypes.includes('item')) {
    const itemsStore = useItemsStore()

    card.item_ids?.forEach((id) => {
      const item = itemsStore.get(id)
      if (!item) {
        if (!checkOutgoingTargetExists) {
          related.push({
            id: id,
            name: undefined,
            type: 'item',
            direction: 'outgoing',
            outgoingTargetExists: false,
          })
        }
        return
      }
      related.push({ id: item.id, name: item.name, type: 'item', direction: 'outgoing' })
    })
  }

  // card --> n transactions
  if (objectTypes === undefined || objectTypes.includes('transaction')) {
    const transactionsStore = useTransactionsStore()

    card.transaction_ids?.forEach((id) => {
      const transaction = transactionsStore.get(id)
      if (!transaction) {
        if (!checkOutgoingTargetExists) {
          related.push({
            id: id,
            name: undefined,
            type: 'transaction',
            direction: 'outgoing',
            outgoingTargetExists: false,
          })
        }
        return
      }
      related.push({
        id: transaction.id,
        name: transaction.name,
        type: 'transaction',
        direction: 'outgoing',
      })
    })
  }

  // card --> 1 set
  if (objectTypes === undefined || objectTypes.includes('set')) {
    if (card.set_id) {
      const setsStore = useSetsStore()

      const set = setsStore.get(card.set_id)
      if (set) {
        related.push({ id: set.id, name: set.name, type: 'set', direction: 'outgoing' })
      } else {
        if (!checkOutgoingTargetExists) {
          related.push({
            id: card.set_id,
            name: undefined,
            type: 'set',
            direction: 'outgoing',
            outgoingTargetExists: false,
          })
        }
      }
    }
  }

  return related
}

// ? --> <card>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function gatherCardIncomingRelations(card: Card, _objectTypes?: ObjectType[]) {
  const objectId = card.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // ? --> ? card(s)

  return related
}

// <set> --> ?
export function gatherSetOutgoingRelations(
  set: Set,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _checkOutgoingTargetExists: boolean = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _objectTypes?: ObjectType[],
) {
  const objectId = set.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // set --> ? ?

  return related
}

// card --> <set>
export function gatherSetIncomingRelations(set: Set, objectTypes?: ObjectType[]) {
  const objectId = set.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  // card --> 1 set
  if (objectTypes === undefined || objectTypes.includes('card')) {
    const cardsStore = useCardsStore()

    Array.from(cardsStore.cards.values())
      .filter((card) => card.set_id === objectId)
      .forEach((set) =>
        related.push({
          id: set.id,
          name: set.name,
          type: 'set',
          direction: 'incoming',
        }),
      )
  }

  // TODO: item -> n sets

  return related
}

// -------------------------------------------------------------------------

export function gatherRelations(
  object: Base,
  objectType: 'item' | 'transaction' | 'place' | 'card' | 'set',
  direction: 'incoming' | 'outgoing' | 'both' | undefined,
  checkOutgoingTargetExists: boolean = true,
) {
  const objectId = object.id
  if (objectId === undefined) return []

  const related: RelatedIDs[] = []

  if (direction === 'incoming' || direction === 'both' || direction === undefined) {
    if (objectType === 'item') {
      related.push(...gatherItemIncomingRelations(object as Item))
    } else if (objectType === 'place') {
      related.push(...gatherPlaceIncomingRelations(object as Place))
    } else if (objectType === 'transaction') {
      related.push(...gatherTransactionIncomingRelations(object as Transaction))
    } else if (objectType === 'card') {
      related.push(...gatherCardIncomingRelations(object as Card))
    } else if (objectType === 'set') {
      related.push(...gatherSetIncomingRelations(object as Set))
    }
  }

  if (direction === 'outgoing' || direction === 'both') {
    if (objectType === 'item') {
      related.push(...gatherItemOutgoingRelations(object as Item, checkOutgoingTargetExists))
    } else if (objectType === 'place') {
      related.push(...gatherPlaceOutgoingRelations(object as Place, checkOutgoingTargetExists))
    } else if (objectType === 'transaction') {
      related.push(
        ...gatherTransactionOutgoingRelations(object as Transaction, checkOutgoingTargetExists),
      )
    } else if (objectType === 'card') {
      related.push(...gatherCardOutgoingRelations(object as Card, checkOutgoingTargetExists))
    } else if (objectType === 'set') {
      related.push(...gatherSetOutgoingRelations(object as Set, checkOutgoingTargetExists))
    }
  }

  return related
}

// -------------------------------------------------------------------------
