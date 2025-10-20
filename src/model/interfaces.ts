import type { SupportedLanguages } from '@tcgdex/sdk'

// -------------------------------------------------------------------------

export type CostUnits = (typeof COST_UNITS)[number]['id']
export const COST_UNITS = [
  { title: 'Euro (€)', id: 'EUR' },
  { title: 'US Dollar ($)', id: 'USD' },
  // Pound, Yen
] as const

// -------------------------------------------------------------------------

export type RefID = string

export interface DataEditInfo {
  /** date of object creation */
  created: Date
  /** date of last edit, `undefined` if never edited after creation */
  edited?: Date
}

export interface RelatedURL {
  url: string
  name: string
}

export interface Base {
  /** internal unique identifier (data relationship, storage, deduplication) */
  id: RefID

  /** label (display string for inputs, short description) (should be unique per object) */
  name: string

  /** an optional list of related URLs (images, articles, shop pages, etc.) */
  related_urls?: RelatedURL[]

  /** internal information about creation/edit */
  _meta: DataEditInfo
}

// -------------------------------------------------------------------------

export type TransactionType = (typeof TRANSACTION_TYPE)[number]['id']

export const TRANSACTION_TYPE = [
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
  { id: 'gift-receive', label: 'Gift (received)' },
  { id: 'gift-away', label: 'Gift (gifted away)' },
] as const

export interface Transaction extends Base {
  /** note/description */
  description?: string

  /** product/store page url */
  url?: string

  /** date and time */
  date?: string | Date
  /** location for transaction (online or in-person) */
  place_id?: RefID

  /** price/cost */
  cost: number
  /** unit for price/cost */
  cost_unit: CostUnits
  /** type of transaction (buy, sell, gift) */
  type?: TransactionType

  /** contents */
  items: TransactionItem[]

  /** binary attachments (e.g. images, pdf) */
  attachment_ids?: RefID[]
}

export interface TransactionItem {
  amount: number
  item_id: RefID

  /** price/cost */
  cost: number
  /** unit for price/cost */
  cost_unit: CostUnits
}

// -------------------------------------------------------------------------

interface PlaceGeneric extends Base {
  type: string
  url?: string

  notes?: string
}

export interface PlaceLocal extends PlaceGeneric {
  type: 'local'
  address: string
}

export interface PlaceOnline extends PlaceGeneric {
  type: 'online'
  url: string
}

export type Place = PlaceLocal | PlaceOnline

// -------------------------------------------------------------------------

export type ItemType = (typeof ITEM_TYPES)[number]['id']

export const ITEM_TYPES = [
  { id: 'booster', label: 'Booster' },
  { id: 'booster-display', label: 'Booster Display' },
  { id: 'tin', label: 'Tin' },
  { id: 'mini-tin', label: 'Mini Tin' },
  { id: 'etb', label: 'Etb' },
  { id: 'blister', label: 'Blister' },
  // etc.
] as const

export interface Item extends Base {
  /** type of item */
  type: ItemType

  /** single item cost (MSRP, UVP) */
  cost?: number
  cost_unit?: CostUnits

  /** contents, e.g. number of boosters, accessories */
  contents: ItemPart[]

  /** full-text description */
  description?: string
}

export interface ItemPart {
  amount: number

  /** item type (booster, coin, card-savers, ...) */
  type: string

  /** plain text description */
  name?: string

  /** an item as part of another item (collection, e.g. ETB/display) may also be available alone */
  item_id?: RefID
}

// TODO: still wip
export interface BoosterItemPart extends ItemPart {
  type: 'booster'

  /** number of pokemon cards */
  card_count: number

  language: CardLanguageID
  set: string
}

// -------------------------------------------------------------------------

// NOTE: manually since not exported
export const TCGDEX_LANGUAGES = ['en', 'fr', 'es', 'it', 'pt', 'de'] as SupportedLanguages[]

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
  { code: 'ja', short: 'JPN', name: 'Japanese' },
  { code: 'ko', short: 'KOR', name: 'Korean' },
  // https://iso639-3.sil.org/code/zho ?
  { code: 'zh-tw', short: 'ZHO', name: 'Chinese (Traditional)' },
  { code: 'id', short: 'IND', name: 'Indonesian' },
  { code: 'th', short: 'THA', name: 'Thai' },
  { code: 'zh-cn', short: 'ZHO', name: 'Chinese (Simple)' },
] as const

export interface Card extends Base {
  // card info
  language: CardLanguageID

  /** name of card */
  name: string
  /** number in set (generally a number but may also be more complex so a string) */
  number: string

  set: string
  boosters?: string[]
  rarity?: string

  /** total number of cards */
  amount: number

  /** card details (in collection) */
  cards?: unknown[]

  // related transactions/items/...
  item_ids?: RefID[]
  transaction_ids?: RefID[]

  // availability? (for statistics (pull-rates), but e.g. card might have been sold/gifted-away)

  /** TCGDex API identifier for metadata */
  tcgdex_id?: string
}

// -------------------------------------------------------------------------

export interface Attachment extends Base {
  description?: string

  filename: string
  mimetype: string
  blob: Blob
}

// -------------------------------------------------------------------------
