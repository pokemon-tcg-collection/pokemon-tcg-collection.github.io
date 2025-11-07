import type { SupportedLanguages } from '@tcgdex/sdk'

import type { SeriesID } from './tcg_sets'

// -------------------------------------------------------------------------

export type CostUnits = (typeof COST_UNITS)[number]['id']
export const COST_UNITS = [
  { title: 'Euro (€)', id: 'EUR' },
  { title: 'US Dollar ($)', id: 'USD' },
  { title: 'Yen (¥)', id: 'YEN' },
  // Pound, Yen
] as const

// NOTE: manually since not exported
export const TCGDEX_LANGUAGES = ['en', 'fr', 'es', 'it', 'pt', 'de'] as SupportedLanguages[]

// https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_Trading_Card_Game_expansions_in_other_languages
// TCGDex API
// NOTE: does not work if CARD_LANGUAGES is typed?
export type CardLanguageID = (typeof CARD_LANGUAGES)[number]['code']
export const CARD_LANGUAGES = [
  // inter languages
  { code: 'en', short: 'ENG', name: 'English' },
  { code: 'fr', short: 'FRA', name: 'French', base: 'en' },
  { code: 'es', short: 'SPA', name: 'Spanish', base: 'en' },
  { code: 'es-mx', short: 'SPA', name: 'Spanish (Mexican)', base: 'en' }, // Spanish (Latin America)?
  { code: 'it', short: 'ITA', name: 'Italian', base: 'en' },
  { code: 'pt', short: 'POR', name: 'Portuguese' },
  { code: 'pt-br', short: 'POR', name: 'Brazilian Portuguese', base: 'en' },
  { code: 'pt-pt', short: 'POR', name: 'Portuguese (Portugal)' },
  { code: 'de', short: 'DEU', name: 'German', base: 'en' },
  { code: 'nl', short: 'NLD', name: 'Dutch', base: 'en' },
  { code: 'pl', short: 'POL', name: 'Polish', base: 'en' },
  { code: 'ru', short: 'RUS', name: 'Russian', base: 'en' },
  // Asian languages
  // catch-up series without JA base
  { code: 'ja', short: 'JP', name: 'Japanese' },
  { code: 'ko', short: 'KOR', name: 'Korean', base: 'ja' },
  // https://iso639-3.sil.org/code/zho ?
  { code: 'zh-tw', short: 'T-CHN', name: 'Chinese (Traditional)', base: 'ja' },
  { code: 'id', short: 'IND', name: 'Indonesian', base: 'ja' },
  { code: 'th', short: 'THA', name: 'Thai', base: 'ja' },
  { code: 'zh-cn', short: 'S-CHN', name: 'Chinese (Simple)' },
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
  type: TransactionType

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

export type PlaceType = (typeof PLACE_TYPE)[number]['id']
export const PLACE_TYPE = [
  { id: 'local-store', label: 'Brick and Mortar Store' },
  { id: 'local-fair', label: 'Trade Fair' },
  { id: 'online-shop', label: 'Online Shop' },
  { id: 'online-marketplace', label: 'Online Marketplace' },
] as const

export type OnlineMarketplace = (typeof ONLINE_MARKETPLACE)[number]['id']
export const ONLINE_MARKETPLACE = [
  { id: 'amazon', label: 'Amazon' },
  { id: 'ebay', label: 'Ebay' },
  { id: 'etsy', label: 'Etsy' },
  { id: 'cardmarket', label: 'Cardmarket' },
  // etc.
] as const

interface PlaceGeneric extends Base {
  type: PlaceType
  url?: string

  notes?: string
}

export interface PlaceLocal extends PlaceGeneric {
  address: string
}

export interface PlaceLocalFair extends PlaceLocal {
  type: 'local-fair'
  fair: string
}

export interface PlaceLocalStore extends PlaceLocal {
  type: 'local-store'
}

export interface PlaceOnline extends PlaceGeneric {
  url: string
}

export interface PlaceOnlineShop extends PlaceOnline {
  type: 'online-shop'
}

export interface PlaceOnlineMarketplace extends PlaceOnline {
  type: 'online-marketplace'
  marketplace: OnlineMarketplace
}

export type Place = PlaceLocalStore | PlaceLocalFair | PlaceOnlineShop | PlaceOnlineMarketplace

// -------------------------------------------------------------------------

export type ItemType = (typeof ITEM_TYPES)[number]['id']
export const ITEM_TYPES = [
  // https://www.cardmarket.com/de/Pokemon/Products
  // https://www.cardmarket.com/de/Pokemon/Products/Sealed-Products
  { id: 'booster', label: 'Booster Pack' },
  { id: 'jumbo-booster', label: 'Jumbo Booster Pack' },
  { id: 'booster-display', label: 'Booster Display' }, // ? smaller boxes
  { id: 'tin', label: 'Tin' }, // mini-tin?
  { id: 'etb', label: 'Elite Trainer Box (ETB)' },
  { id: 'collection', label: 'Collection' }, // ?
  { id: 'box-set', label: 'Box Set' },
  { id: 'blister', label: 'Blister' },
  // ...
  { id: 'sleeves', label: 'Sleeves' },
  { id: 'toploader', label: 'Toploader' },
  // ...
  { id: 'fan-booster', label: 'Fan-made Booster' },
  { id: 'fan-card', label: 'Fan-made Card' },
  // ...
  { id: 'scam', label: 'Scam' },
  { id: 'shipping-taxes', label: 'Shipping & Taxes' },
  { id: 'other', label: 'Other' },
  // etc.
] as const

export type ItemPartType = (typeof ITEM_PART_TYPES)[number]['id']
export const ITEM_PART_TYPES = [
  ...ITEM_TYPES,
  { id: 'coin', label: 'Coin' },
  { id: 'dice', label: 'Dice' },
  { id: 'damage-dice-set', label: 'Damage Dice Set' },
  { id: 'card-set-energy', label: 'Energy Card Set' },
  { id: 'discount', label: 'Discount' },
] as const

export interface Item extends Base {
  /** language of item */
  language?: CardLanguageID
  /** type of item */
  type?: ItemType

  /** single item cost (MSRP, UVP) */
  cost?: number
  cost_unit: CostUnits

  /** contents, e.g. number of boosters, accessories */
  contents: ItemPart[]

  /** full-text description */
  description?: string
}

export interface ItemPart {
  amount: number

  /** item type (booster, coin, card-savers, ...) */
  type: ItemPartType | string

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

export interface Card extends Base {
  // card info
  language: CardLanguageID

  /** name of card */
  name: string
  /** number in set (generally a number but may also be more complex so a string) */
  number: string

  /** set/expansion */
  set: RefID

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

  /** PokeAPI pokemon id */
  pokeapi_pokemon_id?: number
  /** TCGDex API identifier for metadata */
  tcgdex_id?: string
  /** bulbapedia/bulbagarden URL */
  bulbapedia_url?: string
}

// -------------------------------------------------------------------------

type SetSeriesTypesEN = 'main-series' | 'special'
type SetSeriesTypesJA =
  | 'main-series'
  | 'special'
  // subsets
  | 'subset'
  | 'concept'
  | 'enhanced-expansion'
  | 'high-class-expansion'
  | 'promo'

export interface Set extends Base {
  // en,ja
  language: CardLanguageID

  /** name of set/expansion */
  name: string
  /** name in original language (e.g., "ja") */
  name_original?: string
  name_en_equivalent?: string
  /** set abbrevation */
  abbrev: string

  /** series */
  series: SeriesID
  series_type: SetSeriesTypesEN | SetSeriesTypesJA
  /** set number */
  no: string

  cards_stats: {
    cards?: number
    // additional
    secret?: number
    holofoil?: number
    unown?: number
    shiny?: number
    rotom?: number
    arceus?: number
    'alpha-ligthograph'?: number
    'shiny-legendary'?: number
    radiant?: number
    'shiny-vault'?: number
    classic?: number
    'trainer-gallery'?: number
    'galarian-gallery'?: number
    // JA
    'special-holo-energy'?: number
    'non-standard'?: number
    unnumbered?: number
    // rest
    notes?: string[]
  }

  release_date: string

  // related set (jp<->en)

  /** symbol/logo images */
  symbol_url?: string
  logo_url?: string

  /** TCGDex API identifier for metadata */
  tcgdex_id?: string
  /** bulbapedia/bulbagarden URL */
  bulbapedia_url?: string
}

// -------------------------------------------------------------------------

export interface Attachment extends Base {
  description?: string

  filename: string
  mimetype: string
  blob: Blob
}

// -------------------------------------------------------------------------
