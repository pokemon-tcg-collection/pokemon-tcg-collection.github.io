// import BulbapediaSetsEN from './data/bulbapedia-en-sets.json'

// -------------------------------------------------------------------------

// https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_Trading_Card_Game_expansions#Legendary_Collection_Series

export type SeriesID = (typeof SERIES)[number]['id']
export const SERIES = [
  // wizards-of-the-coast
  ...(
    [
      { id: 'original', label: 'Original Series' },
      { id: 'neo', label: 'Neo Series' },
      { id: 'legendary-collection', label: 'Legendary Collection Series' },
      { id: 'e-card', label: 'e-Card Series' },
    ] as const
  ).map((x) => ({ ...x, lang: 'en', type: 'wizards-of-the-coast' }) as const),
  // post-wizards-of-the-coast
  ...(
    [
      { id: 'ex', label: 'EX Series' },
      { id: 'diamond-pearl', label: 'Diamond & Pearl Series' },
      { id: 'platinum', label: 'Platinum Series' },
      { id: 'heartgold-soulsilver', label: 'HeartGold & SoulSilver Series' },
      { id: 'call-of-legends', label: 'Call of Legends Series' },
      { id: 'black-white', label: 'Black & White Series' },
      { id: 'xy', label: 'XY Series' },
      { id: 'sun-moon', label: 'Sun & Moon Series' },
      { id: 'sword-shield', label: 'Sword & Shield Series' },
      { id: 'scarlet-violet', label: 'Scarlet & Violet Series' },
      { id: 'mega-evolution', label: 'Mega Evolution Series' },
    ] as const
  ).map((x) => ({ ...x, lang: 'en', type: 'post-wizards-of-the-coast' }) as const),
  // special/other
  ...(
    [
      { id: 'basic-energy', label: 'Basic Energy Cards' },
      { id: 'black-star-promo', label: 'Black Star Promotional Cards' },
      { id: 'mcdonalds', label: "McDonald's Collection" },
      { id: 'trick-or-trade', label: 'Trick or Trade' },
      { id: 'pop-play', label: 'POP / Play! Pokemon Prize Packs' },
      { id: 'other-misc', label: 'Other Miscellaneous Sets' },
    ] as const
  ).map((x) => ({ ...x, lang: 'en', type: 'other' }) as const),
] as const

// -------------------------------------------------------------------------

// export type SetID = (typeof SETS)[number]['id']
// export type SetSeriesID = (typeof SETS)[number]['series']
// export type SetSeriesTypesID = (typeof SETS)[number]['series_type']

const { default: BulbapediaSetsEN } = await import('./data/bulbapedia-en-sets.json')
const { default: BulbapediaSetsJA } = await import('./data/bulbapedia-ja-sets.json')

export const SETS = [
  // NOTE: this template literal string interpolation stuff does not work with typescript as intended
  ...BulbapediaSetsEN.map((set) => ({ ...set, id: `${set.language}:${set.abbrev}` }) as const),
  // TODO: no abbrev for JA sets?!
  ...BulbapediaSetsJA.map((set, idx) => ({ ...set, id: `${set.language}:${idx}` }) as const),
] as const
