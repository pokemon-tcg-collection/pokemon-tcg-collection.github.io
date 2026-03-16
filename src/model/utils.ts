import { v4 as uuidv4 } from 'uuid'

import { toRawDeep } from '@/utils/reactivity'
import type {
  Card,
  DataEditInfo,
  Item,
  Place,
  PlaceLocal,
  PlaceLocalFair,
  PlaceOnlineMarketplace,
  RelatedURL,
  Set,
  Transaction,
} from './interfaces'

// -------------------------------------------------------------------------

export function createNewRefID() {
  return uuidv4()
}

export function createEditMeta() {
  return {
    created: new Date(),
    edited: undefined,
  } satisfies DataEditInfo
}

// -------------------------------------------------------------------------

export function createNewCard(): Card {
  return {
    id: createNewRefID(),
    name: '',
    language: 'en',
    number: '',
    set_id: '',
    amount: 1,
    _meta: createEditMeta(),
  } satisfies Card
}

export function createNewSet(): Set {
  return {
    id: createNewRefID(),
    name: '',
    language: 'en',
    abbrev: '',
    series: 'original',
    series_type: 'main-series',
    _meta: createEditMeta(),
  } satisfies Set
}

export function createNewTransaction(): Transaction {
  return {
    id: createNewRefID(),
    name: '',
    type: 'buy',
    cost: 0,
    cost_unit: 'EUR',
    date: new Date(),
    items: [],
    _meta: createEditMeta(),
  } satisfies Transaction
}

export function createNewPlace(): Place {
  return {
    id: createNewRefID(),
    name: '',
    type: 'online-shop',
    url: '',
    _meta: createEditMeta(),
  } satisfies Place
}

export function createNewItem(): Item {
  return {
    id: createNewRefID(),
    name: '',
    cost_unit: 'EUR',
    contents: [],
    _meta: createEditMeta(),
  } satisfies Item
}

// -------------------------------------------------------------------------

export function makeObjectUniqueCopy<T extends Card | Set | Transaction | Place | Item>(
  obj: T,
  copyFirst: boolean = true,
): T {
  const copy = copyFirst ? structuredClone(toRawDeep(obj)) : obj

  // override ID/metadata, important! so each new templated object is unique
  copy.id = createNewRefID()
  copy._meta = createEditMeta()

  return copy
}

// -------------------------------------------------------------------------

function isValueEmpty(value: string | undefined) {
  if (value === undefined) return true
  if (value.trim().length === 0) return true
  return false
}

function isNumberDefault(value: number | undefined, defaultValue: number | undefined = 0) {
  if (value === undefined) return true
  if (value === defaultValue) return true
  return false
}

function areValuesSame(valueA: string | undefined, valueB: string | undefined) {
  if (valueA === valueB) return true
  if (isValueEmpty(valueA) && isValueEmpty(valueB)) return true
  return false
}

function areNumbersSame(
  valueA: number | undefined,
  valueB: number | undefined,
  defaultValue: number | undefined = 0,
) {
  if (valueA === valueB) return true
  if (isNumberDefault(valueA, defaultValue) && isNumberDefault(valueB, defaultValue)) return true
  return false
}

function areDatesSame(valueA: string | Date | undefined, valueB: string | Date | undefined) {
  if (valueA === valueB) return true
  if (valueA === undefined || valueB === undefined) return false

  if (valueA instanceof Date && valueB instanceof Date) return +valueA === +valueB

  if (valueA instanceof Date) valueA = valueA.toISOString()
  if (valueB instanceof Date) valueB = valueB.toISOString()
  return valueA === valueB
}

function isValueListSame(
  valuesA: string[] | undefined,
  valuesB: string[] | undefined,
  emptyEqualsUndefined: boolean = false,
) {
  if (valuesA === valuesB) return true
  if (
    emptyEqualsUndefined &&
    (valuesA === undefined || valuesA.length === 0) &&
    (valuesB === undefined || valuesB.length === 0)
  )
    return true

  if (valuesA === undefined || valuesB === undefined) return false
  if (valuesA.length !== valuesB.length) return false

  // the order should not really matter
  // so let's check both ways to account for duplicate ref ID entries

  const foundMissingInA = valuesA.some((value) => !valuesB.includes(value))
  if (foundMissingInA) return false

  const foundMissingInB = valuesB.some((value) => !valuesA.includes(value))
  if (foundMissingInB) return false

  return true
}

function isObjectListSame<T>(
  listA: T[] | undefined,
  listB: T[] | undefined,
  fnCheckSame: (a: T, b: T) => boolean,
  emptyEqualsUndefined: boolean = false,
) {
  if (listA === listB) return true
  if (
    emptyEqualsUndefined &&
    (listA === undefined || listA.length === 0) &&
    (listB === undefined || listB.length === 0)
  )
    return true

  if (listA === undefined || listB === undefined) return false
  if (listA.length !== listB.length) return false

  // search for not-sameness/difference
  const foundChange = listA.findIndex((valueA, idx) => {
    const valueB = listB[idx]!

    // if internal objects are identical, don't check further, changes won't be here
    if (valueA === valueB) return false

    const isSame = fnCheckSame(valueA, valueB)
    return !isSame
  })
  if (foundChange !== -1) return false

  return true
}

function isRelatedURLsSame(
  relatedUrlsA: RelatedURL[] | undefined,
  relatedUrlsB: RelatedURL[] | undefined,
) {
  return isObjectListSame(
    relatedUrlsA,
    relatedUrlsB,
    (relatedUrlA, relatedUrlB) => {
      if (relatedUrlA.url !== relatedUrlB.url) return false
      if (!areValuesSame(relatedUrlA.name, relatedUrlB.name)) return false
      return true
    },
    true,
  )
}

// -------------------------------------------------------------------------

export function isCardChanged(base: Card | undefined, other: Card | undefined) {
  if (base === other) return false
  if (base === undefined || other === undefined) return true

  if (base.id !== other.id) {
    console.warn('Trying to compare different cards according to ID!')
    return true
  }

  if (base.name !== other.name) return true
  if (!areValuesSame(base.notes, other.notes)) return true
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) return true

  if (base.amount !== other.amount) return true
  if (base.language !== other.language) return true
  if (base.number !== other.number) return true

  // NOTE: WIP schema
  if (!areValuesSame(base.rarity, other.rarity)) return true
  if (!isValueListSame(base.boosters, other.boosters, true)) return true

  if (
    !isObjectListSame(
      base.cards,
      other.cards,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_cardA, _cardB) => {
        // TODO: detailed comparison of card subobject
        // NOTE: return false for every change detected to shortcircuit

        return true
      },
      true,
    )
  )
    return true

  if (!areValuesSame(base.set_id, other.set_id)) return true
  if (!isValueListSame(base.item_ids, other.item_ids, true)) return true
  if (!isValueListSame(base.transaction_ids, other.transaction_ids, true)) return true

  if (!areNumbersSame(base.pokeapi_pokemon_id, other.pokeapi_pokemon_id, undefined)) return true
  if (!areValuesSame(base.tcgdex_id, other.tcgdex_id)) return true
  if (!areValuesSame(base.bulbapedia_url, other.bulbapedia_url)) return true

  return false
}

export function isSetChanged(base: Set | undefined, other: Set | undefined) {
  if (base === other) return false
  if (base === undefined || other === undefined) return true

  if (base.id !== other.id) {
    console.warn('Trying to compare different sets according to ID!')
    return true
  }

  if (base.name !== other.name) return true
  if (!areValuesSame(base.notes, other.notes)) return true
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) return true

  if (base.language !== other.language) return true
  if (!areValuesSame(base.name_original, other.name_original)) return true
  if (!areValuesSame(base.name_en_equivalent, other.name_en_equivalent)) return true
  if (base.abbrev !== other.abbrev) return true

  if (base.series !== other.series) return true
  if (base.series_type !== other.series_type) return true
  if (!areValuesSame(base.no, other.no)) return true

  // TODO: cards_stats

  if (!areValuesSame(base.release_date, other.release_date)) return true

  if (!areValuesSame(base.symbol_url, other.symbol_url)) return true
  if (!areValuesSame(base.logo_url, other.logo_url)) return true

  if (!areValuesSame(base.tcgdex_id, other.tcgdex_id)) return true
  if (!areValuesSame(base.bulbapedia_url, other.bulbapedia_url)) return true

  return false
}

export function isTransactionChanged(
  base: Transaction | undefined,
  other: Transaction | undefined,
) {
  if (base === other) return false
  if (base === undefined || other === undefined) return true

  if (base.id !== other.id) {
    console.warn('Trying to compare different transactions according to ID!')
    return true
  }

  if (base.name !== other.name) return true
  if (!areValuesSame(base.notes, other.notes)) return true
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) return true

  if (base.type !== other.type) return true
  if (base.cost_unit !== other.cost_unit) return true
  if (!areDatesSame(base.date, other.date)) return true
  if (!areNumbersSame(base.cost, other.cost)) return true
  if (!areValuesSame(base.place_id, other.place_id)) return true
  if (!areValuesSame(base.url, other.url)) return true
  if (!areValuesSame(base.description, other.description)) return true

  if (
    !isObjectListSame(base.items, other.items, (itemA, itemB) => {
      if (itemA.amount !== itemB.amount) return false
      if (itemA.item_id !== itemB.item_id) return false
      if (itemA.cost !== itemB.cost) return false
      if (itemA.cost_unit !== itemB.cost_unit) return false

      return true
    })
  )
    return true

  if (!isValueListSame(base.attachment_ids, other.attachment_ids, true)) return true

  return false
}

export function isPlaceChanged(base: Place | undefined, other: Place | undefined) {
  if (base === other) return false
  if (base === undefined || other === undefined) return true

  if (base.id !== other.id) {
    console.warn('Trying to compare different places according to ID!')
    return true
  }

  if (base.name !== other.name) return true
  if (!areValuesSame(base.notes, other.notes)) return true
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) return true

  if (base.type !== other.type) return true
  if (!areValuesSame(base.url, other.url)) return true

  if (base.type === 'local-fair') {
    if (!areValuesSame((base as PlaceLocal).address, (other as PlaceLocal).address)) return true
    if (!areValuesSame((base as PlaceLocalFair).fair, (other as PlaceLocalFair).fair)) return true
  } else if (base.type === 'local-store') {
    if (!areValuesSame((base as PlaceLocal).address, (other as PlaceLocal).address)) return true
  } else if (base.type === 'online-marketplace') {
    if (
      !areValuesSame(
        (base as PlaceOnlineMarketplace).marketplace,
        (other as PlaceOnlineMarketplace).marketplace,
      )
    )
      return true
  } else if (base.type === 'online-shop') {
    // nothing yet
  }

  return false
}

export function isItemChanged(base: Item | undefined, other: Item | undefined) {
  if (base === other) return false
  if (base === undefined || other === undefined) return true

  if (base.id !== other.id) {
    console.warn('Trying to compare different items according to ID!')
    return true
  }

  if (base.name !== other.name) return true
  if (!areValuesSame(base.notes, other.notes)) return true
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) return true

  if (base.cost_unit !== other.cost_unit) return true
  if (!areValuesSame(base.type, other.type)) return true
  if (!areValuesSame(base.language, other.language)) return true
  if (!areValuesSame(base.description, other.description)) return true
  if (!areNumbersSame(base.cost, other.cost, 0.0)) return true

  if (
    !isObjectListSame(
      base.contents,
      other.contents,
      (contentA, contentB) => {
        if (contentA.type !== contentB.type) return false
        if (!areNumbersSame(contentA.amount, contentB.amount, 1)) return false
        if (!areValuesSame(contentA.item_id, contentB.item_id)) return false
        if (!areValuesSame(contentA.name, contentB.name)) return false

        return true
      },
      true,
    )
  )
    return true

  return false
}

// -------------------------------------------------------------------------

// [] - no changes
// ["*"] - one side is undefined
// ["id"] - IDs are different, so different objects, abort comparison
// ["<prop1>", "<prop2>", ...] - changes in props (deep but only list base object properties)

export function getCardChanges(base: Card | undefined, other: Card | undefined): string[] {
  if (base === other) return []
  if (base === undefined || other === undefined) return ['*']

  if (base.id !== other.id) {
    console.warn('Trying to compare different cards according to ID!')
    return ['id']
  }

  const changes = []

  if (base.name !== other.name) changes.push('name')
  if (!areValuesSame(base.notes, other.notes)) changes.push('notes')
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) changes.push('related_urls')

  if (base.amount !== other.amount) changes.push('amount')
  if (base.language !== other.language) changes.push('language')
  if (base.number !== other.number) changes.push('number')

  // NOTE: WIP schema
  if (!areValuesSame(base.rarity, other.rarity)) changes.push('rarity')
  if (!isValueListSame(base.boosters, other.boosters, true)) changes.push('boosters')

  if (
    !isObjectListSame(
      base.cards,
      other.cards,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_cardA, _cardB) => {
        // TODO: detailed comparison of card subobject
        // NOTE: return false for every change detected to shortcircuit

        return true
      },
      true,
    )
  )
    changes.push('cards')

  if (!areValuesSame(base.set_id, other.set_id)) changes.push('set_id')
  if (!isValueListSame(base.item_ids, other.item_ids, true)) changes.push('item_ids')
  if (!isValueListSame(base.transaction_ids, other.transaction_ids, true))
    changes.push('transaction_ids')

  if (!areNumbersSame(base.pokeapi_pokemon_id, other.pokeapi_pokemon_id, undefined))
    changes.push('pokeapi_pokemon_id')
  if (!areValuesSame(base.tcgdex_id, other.tcgdex_id)) changes.push('tcgdex_id')
  if (!areValuesSame(base.bulbapedia_url, other.bulbapedia_url)) changes.push('bulbapedia_url')

  return changes
}

export function getSetChanges(base: Set | undefined, other: Set | undefined): string[] {
  if (base === other) return []
  if (base === undefined || other === undefined) return ['*']

  if (base.id !== other.id) {
    console.warn('Trying to compare different sets according to ID!')
    return ['id']
  }

  const changes = []

  if (base.name !== other.name) changes.push('name')
  if (!areValuesSame(base.notes, other.notes)) changes.push('notes')
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) changes.push('related_urls')

  if (base.language !== other.language) changes.push('language')
  if (!areValuesSame(base.name_original, other.name_original)) changes.push('name_original')
  if (!areValuesSame(base.name_en_equivalent, other.name_en_equivalent))
    changes.push('name_en_equivalent')
  if (base.abbrev !== other.abbrev) changes.push('abbrev')

  if (base.series !== other.series) changes.push('series')
  if (base.series_type !== other.series_type) changes.push('series_type')
  if (!areValuesSame(base.no, other.no)) changes.push('no')

  // TODO: cards_stats

  if (!areValuesSame(base.release_date, other.release_date)) changes.push('release_date')

  if (!areValuesSame(base.symbol_url, other.symbol_url)) changes.push('symbol_url')
  if (!areValuesSame(base.logo_url, other.logo_url)) changes.push('logo_url')

  if (!areValuesSame(base.tcgdex_id, other.tcgdex_id)) changes.push('tcgdex_id')
  if (!areValuesSame(base.bulbapedia_url, other.bulbapedia_url)) changes.push('bulbapedia_url')

  return changes
}

export function getTransactionChanges(
  base: Transaction | undefined,
  other: Transaction | undefined,
): string[] {
  if (base === other) return []
  if (base === undefined || other === undefined) return ['*']

  if (base.id !== other.id) {
    console.warn('Trying to compare different transactions according to ID!')
    return ['id']
  }

  const changes = []

  if (base.name !== other.name) changes.push('name')
  if (!areValuesSame(base.notes, other.notes)) changes.push('notes')
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) changes.push('related_urls')

  if (base.type !== other.type) changes.push('type')
  if (base.cost_unit !== other.cost_unit) changes.push('cost_unit')
  if (!areDatesSame(base.date, other.date)) changes.push('date')
  if (!areNumbersSame(base.cost, other.cost)) changes.push('cost')
  if (!areValuesSame(base.place_id, other.place_id)) changes.push('place_id')
  if (!areValuesSame(base.url, other.url)) changes.push('url')
  if (!areValuesSame(base.description, other.description)) changes.push('description')

  if (
    !isObjectListSame(base.items, other.items, (itemA, itemB) => {
      if (itemA.amount !== itemB.amount) return false
      if (itemA.item_id !== itemB.item_id) return false
      if (itemA.cost !== itemB.cost) return false
      if (itemA.cost_unit !== itemB.cost_unit) return false

      return true
    })
  )
    changes.push('items')

  if (!isValueListSame(base.attachment_ids, other.attachment_ids, true))
    changes.push('attachment_ids')

  return changes
}

export function getPlaceChanges(base: Place | undefined, other: Place | undefined): string[] {
  if (base === other) return []
  if (base === undefined || other === undefined) return ['*']

  if (base.id !== other.id) {
    console.warn('Trying to compare different places according to ID!')
    return ['id']
  }

  const changes = []

  if (base.name !== other.name) changes.push('name')
  if (!areValuesSame(base.notes, other.notes)) changes.push('notes')
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) changes.push('related_urls')

  if (base.type !== other.type) changes.push('type')
  if (!areValuesSame(base.url, other.url)) changes.push('url')

  if (base.type === 'local-fair') {
    if (!areValuesSame((base as PlaceLocal).address, (other as PlaceLocal).address))
      changes.push('address')
    if (!areValuesSame((base as PlaceLocalFair).fair, (other as PlaceLocalFair).fair))
      changes.push('fair')
  } else if (base.type === 'local-store') {
    if (!areValuesSame((base as PlaceLocal).address, (other as PlaceLocal).address))
      changes.push('address')
  } else if (base.type === 'online-marketplace') {
    if (
      !areValuesSame(
        (base as PlaceOnlineMarketplace).marketplace,
        (other as PlaceOnlineMarketplace).marketplace,
      )
    )
      changes.push('marketplace')
  } else if (base.type === 'online-shop') {
    // nothing yet
  }

  return changes
}

export function getItemChanges(base: Item | undefined, other: Item | undefined): string[] {
  if (base === other) return []
  if (base === undefined || other === undefined) return ['*']

  if (base.id !== other.id) {
    console.warn('Trying to compare different items according to ID!')
    return ['id']
  }

  const changes = []

  if (base.name !== other.name) changes.push('name')
  if (!areValuesSame(base.notes, other.notes)) changes.push('notes')
  if (!isRelatedURLsSame(base.related_urls, other.related_urls)) changes.push('related_urls')

  if (base.cost_unit !== other.cost_unit) changes.push('cost_unit')
  if (!areValuesSame(base.type, other.type)) changes.push('type')
  if (!areValuesSame(base.language, other.language)) changes.push('language')
  if (!areValuesSame(base.description, other.description)) changes.push('description')
  if (!areNumbersSame(base.cost, other.cost, 0.0)) changes.push('cost')

  if (
    !isObjectListSame(
      base.contents,
      other.contents,
      (contentA, contentB) => {
        if (contentA.type !== contentB.type) return false
        if (!areNumbersSame(contentA.amount, contentB.amount, 1)) return false
        if (!areValuesSame(contentA.item_id, contentB.item_id)) return false
        if (!areValuesSame(contentA.name, contentB.name)) return false

        return true
      },
      true,
    )
  )
    changes.push('contents')

  return changes
}

// -------------------------------------------------------------------------

export function sanitizePlace<T extends Place>(place: T): T {
  if (
    Object.hasOwn(place, 'marketplace') &&
    (place.type === 'local-fair' || place.type === 'local-store' || place.type === 'online-shop')
  ) {
    delete (place as unknown as { marketplace: unknown })['marketplace']
  }
  if (
    Object.hasOwn(place, 'fair') &&
    (place.type === 'local-store' ||
      place.type === 'online-shop' ||
      place.type === 'online-marketplace')
  ) {
    delete (place as unknown as { fair: unknown })['fair']
  }

  if (
    Object.hasOwn(place, 'address') &&
    (place.type === 'online-shop' || place.type === 'online-marketplace')
  ) {
    delete (place as unknown as { address: unknown })['address']
  }

  return place
}

// TODO: Base object sanitization/normalization (`Date` when de-/serialized?)

// -------------------------------------------------------------------------
