// -------------------------------------------------------------------------

export type TransactionType = 'purchase' | 'sale' | 'gift'
export type TransactionPlaceType = 'online-store' | 'store'
export type TransactionCostType = 'buy' | 'sell'

export interface Transaction {
  /** internal id */
  id: string

  /** label for transaction */
  name?: string
  /** note/description */
  description?: string
  /** type of transaction */

  type: TransactionType
  /** date and time */
  date?: string | Date
  /** type of location for transaction (online or in-person) */
  place?: TransactionPlaceType
  place_id?: string

  /** price/cost */
  cost: number
  /** unit for price/cost */
  cost_unit: 'EUR'
  cost_type?: TransactionCostType

  /** contents */
  items?: Item[]

  /** binary attachments (e.g. images, pdf) */
  attachment_ids?: string[]
}

export interface PlaceLocal {
  type: 'local'
  name: string
  address: string
  url?: string
}

export interface PlaceOnline {
  type: 'online'
  name: string
  url: string
}

export type Place = PlaceLocal | PlaceOnline

export type ItemType = 'booster' | 'booster-display' | 'tin' | 'mini-tin' | 'etb' | 'blister'

export interface Item {
  /** internal id */
  id: string

  /** type of item */
  type: ItemType
  /** label */
  label?: string
  /** single item cost */
  cost: number

  /** contents, e.g. number of boosters, accessories */
  contents: ItemPart[]
}

export interface ItemPart {
  amount: number
  /** item type (booster, coin, card-savers, ...) */
  type: string
}

export interface BoosterItemPart extends ItemPart {
  /** number of pokemon cards */
  card_count: number

  language: CardLanguageID
  set: string
}

// -------------------------------------------------------------------------

// NOTE: does not work if CARD_LANGUAGES is typed
export type CardLanguageID = (typeof CARD_LANGUAGES)[number]['code']

export const CARD_LANGUAGES = [
  // inter languages
  { code: 'en', short: 'ENG', name: 'English' },
  { code: 'fr', short: 'FRA', name: 'French' },
  { code: 'es', short: 'SPA', name: 'Spanish' },
  { code: 'es-mx', short: 'SPA', name: 'Spanish (Mexican)' }, // ?
  { code: 'it', short: 'ITA', name: 'Italian' },
  { code: 'pt', short: 'POR', name: 'Portuguese' },
  { code: 'pt-br', short: 'POR', name: 'Portuguese (Brazilian)' },
  { code: 'pt-pt', short: 'POR', name: 'Portuguese (Portugal)' },
  { code: 'de', short: 'DEU', name: 'German' },
  { code: 'nl', short: 'NLD', name: 'Dutch' },
  { code: 'pl', short: 'POL', name: 'Polish' },
  { code: 'ru', short: 'RUS', name: 'Russian' },
  // Asian languages
  { code: 'ja', short: 'JPN', name: 'Japan' },
  { code: 'ko', short: 'KOR', name: 'Korean' },
  // https://iso639-3.sil.org/code/zho ?
  { code: 'zh-tw', short: 'ZHO', name: 'Chinese (Traditional)' },
  { code: 'id', short: 'IND', name: 'Indonesian' },
  { code: 'th', short: 'THA', name: 'Thai' },
  { code: 'zh-cn', short: 'ZHO', name: 'Chinese (Simple)' },
] as const

export interface Card {
  /** unique identifier (see TCGDex ids/names) */
  id: string

  // card info
  language: CardLanguageID
  name: string
  number: string
  set: string
  boosters?: string[]
  rarity?: string

  /** total number of cards */
  amount: number
  /** card details */
  cards?: unknown[]

  // related transactions/items/...
  item_ids?: string[]
  transaction_ids?: string[]

  // availability? (for statistics (pull-rates), but e.g. card might have been sold/gifted-away)

  /** TCGDex API identifier for metadata */
  tcgdex_id?: string
}

// -------------------------------------------------------------------------

export interface Attachment {
  id: string
  description?: string
  filename: string
  mimetype: string
  blob: Blob
}
