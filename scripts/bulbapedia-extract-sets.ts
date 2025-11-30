/**
 * Bulbapedia - Pokemon Set scraping script
 *
 * Run with:
 *   node bulbapedia-extract-sets.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join as pathJoin } from 'node:path'

import { JSDOM } from 'jsdom'
import type { SupportedLanguages } from '@tcgdex/sdk'
import TCGdex from '@tcgdex/sdk'

// -------------------------------------------------------------------------
// document retrieval and DOM parsing

const urlBase = 'https://bulbapedia.bulbagarden.net/wiki/'
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

async function fetchAndParseToDocument(url: string) {
  let data = undefined
  // try cache first else fetch
  if (fetchTextCache.has(url)) {
    data = fetchTextCache.get(url)
  }
  if (data === undefined) {
    const response = await fetch(url, { headers })
    data = await response.text()
    fetchTextCache.set(url, data)
  }

  const dom = new JSDOM(data, { url, contentType: 'text/html' })
  const document = dom.window.document

  return document
}

const fetchTextCache: Map<string, string> = new Map<string, string>()

// -------------------------------------------------------------------------
// types

interface SetInfoBriefEN {
  no?: string
  symbol_url?: string | undefined
  logo_url?: string | undefined
  name: string
  cards_stats: { [key: string]: number | string[] }
  release_date?: string
  abbrev: string | null
  bulbapedia_url: string
  tcgdex_id?: string | undefined
}

interface SetInfoFullEN extends SetInfoBriefEN {
  series: string
  series_type: 'main-series' | 'special' | string | undefined
  language: 'en'
}

interface SetInfoBriefJA {
  no?: string
  symbol_url?: string | undefined
  logo_url?: string | undefined
  name: string
  name_original: string
  name_en_equivalent?: string
  cards_stats: { [key: string]: number | string[] }
  release_date: string
  bulbapedia_url: string
}

interface SetInfoFullJA extends SetInfoBriefJA {
  series: string
  series_type:
    | 'main-series'
    | 'special'
    | 'subset'
    | 'concept'
    | 'enhanced-expansion'
    | 'high-class-expansion'
    | 'promo'
  language: 'ja'
}

interface SetInfoBriefZHCN {
  symbol_url?: string | undefined
  name: string
  name_original: string
  bulbapedia_url?: string | undefined
}

interface SetInfoFullZHCN extends SetInfoBriefZHCN {
  series: string
  series_type: 'main-series'
  language: 'zh-cn'
}

interface SetInfoBriefENOther {
  symbol_url?: string | undefined
  name: string

  names_translated: { [language: string]: string }

  bulbapedia_url?: string | undefined
}

interface SetInfoFullENOther extends SetInfoBriefENOther {
  series: string
  language: 'en'
}

// -------------------------------------------------------------------------
// mappings (bulbapedia, manual)

const mapCardStatsRawEN = new Map<string, string>([
  ['Secret card', 'secret'],
  ['Secret cards', 'secret'],
  ['Holofoil cards', 'holofoil'],
  ['Unown cards', 'unown'],
  ['Shiny Pokémon cards', 'shiny'],
  ['Rotom cards', 'rotom'],
  ['Arceus cards', 'arceus'],
  ['Alph Lithograph card', 'alpha-ligthograph'],
  ['Shiny Legendary cards', 'shiny-legendary'],
  ['Radiant Collection cards', 'radiant'],
  ['Shiny Vault cards', 'shiny-vault'],
  ['Classic Collection cards', 'classic'],
  ['Trainer Gallery cards', 'trainer-gallery'],
  ['Galarian Gallery cards', 'galarian-gallery'],
])

const mapCardStatsRawJP = new Map<string, string>([
  ['specialHolo energies', 'special-holo-energy'],
  ['non-standard cards', 'non-standard'],
  ['unnumbered with unique attributes', 'unnumbered'],
])

const mapSeriesTypesRawEN = new Map<string, string>([
  ['Wizards of the Coast sets', 'wizards-of-the-coast'],
  ['Post-Wizards of the Coast sets', 'post-wizards-of-the-coast'],
  ['Other sets', 'other'],
])

const mapSeriesRawEN = new Map<string, string>([
  ['Original Series', 'original'],
  ['Neo Series', 'neo'],
  ['Legendary Collection Series', 'legendary-collection'],
  ['e-Card Series', 'e-card'],
  ['EX Series', 'ex'],
  ['Diamond & Pearl Series', 'diamond-pearl'],
  ['Platinum Series', 'platinum'],
  ['HeartGold & SoulSilver Series', 'heartgold-soulsilver'],
  ['Call of Legends Series', 'call-of-legends'],
  ['Black & White Series', 'black-white'],
  ['XY Series', 'xy'],
  ['Sun & Moon Series', 'sun-moon'],
  ['Sword & Shield Series', 'sword-shield'],
  ['Scarlet & Violet Series', 'scarlet-violet'],
  ['Mega Evolution Series', 'mega-evolution'],
  ['Basic Energy Cards', 'basic-energy'],
  ['Black Star Promotional Cards', 'black-star-promo'],
  ["McDonald's Collection", 'mcdonalds'],
  ['Trick or Trade', 'trick-or-trade'],
  ['POP / Play! Pokemon Prize Packs', 'pop-play'],
  ['Other Miscellaneous Sets', 'other-misc'],
])

const mapSeriesRawJP = new Map<string, string>([
  ['Original Era', 'original'],
  ['neo Era', 'neo'],
  ['VS Era', 'vs'], // ?
  ['web Era', 'web'], // ?
  ['e-Card Era', 'e-card'],
  ['ADV Era', 'adv'], // ?
  ['PCG Era', 'pcg'], // ?
  ['DP Era', 'diamond-pearl'],
  ['DPt Era', 'platinum'],
  ['LEGEND Era', 'legend'],
  ['BW Era', 'black-white'],
  ['XY Era', 'xy'],
  ['XY BREAK Era', 'xy-break'],
  ['Sun & Moon Era', 'sun-moon'],
  ['Sword & Shield Era', 'sword-shield'],
  ['Scarlet & Violet Era', 'scarlet-violet'],
  ['MEGA Series', 'mega'],
])

const mapSeriesSubRawJP = new Map<string, string>([
  ['Concept Packs', 'concept'],
  ['Enhanced Expansion Packs', 'enhanced-expansion'],
  ['High Class Expansion Packs', 'high-class-expansion'],
])

// -------------------------------------------------------------------------
// table cell parsing

const transformTableCellEN = new Map<
  string,
  {
    field: string
    transform: (
      td: HTMLTableCellElement,
    ) => string | undefined | null | string[] | { [key: string]: string | number }
  }[]
>([
  ['Set no.', [{ field: 'no', transform: (td: HTMLTableCellElement) => td.textContent.trim() }]],
  [
    'Symbol',
    [
      {
        field: 'symbol_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('img')?.src,
      },
    ],
  ],
  [
    'Logo of Expansion',
    [{ field: 'logo_url', transform: (td: HTMLTableCellElement) => td.querySelector('img')?.src }],
  ],
  [
    'Name of Expansion',
    [
      { field: 'name', transform: (td: HTMLTableCellElement) => td.textContent.trim() },
      {
        field: 'bulbapedia_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('a')?.href,
      },
    ],
  ],
  [
    'Type of Expansion',
    [
      {
        field: 'type',
        transform: (td: HTMLTableCellElement) => {
          const text = td.textContent.trim()
          const map = new Map([
            ['Main Series Expansion', 'main-series'],
            ['Special Expansion', 'special'],
          ])
          if (!map.has(text)) {
            console.warn('Unexpected new expansion type', [text])
            return text
          }
          return map.get(text)!
        },
      },
    ],
  ],
  [
    'No. of cards',
    [
      {
        field: 'cards_stats',
        transform: (td: HTMLTableCellElement) => {
          const texts = td.innerHTML.trim().split('<br>')

          const counts = {}
          const invalid = []

          for (let ti = 0; ti < texts.length; ti++) {
            const text = texts[ti]!
            if (ti === 0) {
              if (text.indexOf(' ') === -1) {
                Object.assign(counts, { cards: Number.parseInt(text) })
              } else {
                console.warn('Unexpected card stats string', { text, texts })
                invalid.push(text)
              }
            } else {
              const cardsStatType = text.split(' ').slice(1).join(' ')
              if (mapCardStatsRawEN.has(cardsStatType)) {
                Object.assign(counts, {
                  [mapCardStatsRawEN.get(cardsStatType)!]: Number.parseInt(text.split(' ', 1)[0]!),
                })
              } else {
                console.warn('Unexpected card stats string', { text, texts })
                invalid.push(text)
              }
            }
            // mapCardStatsRaw
          }
          if (invalid.length > 0) {
            Object.assign(counts, { invalid })
          }

          return counts
        },
      },
    ],
  ],
  [
    'Release date',
    [{ field: 'release_date', transform: (td: HTMLTableCellElement) => td.textContent.trim() }],
  ],
  [
    'Set abb.',
    [
      {
        field: 'abbrev',
        transform: (td: HTMLTableCellElement) => {
          const text = td.textContent.trim()
          if (text === '—') return null
          return text
        },
      },
    ],
  ],
  [
    'Release period',
    [{ field: 'release_date', transform: (td: HTMLTableCellElement) => td.textContent.trim() }],
  ],
])

const transformTableMainSetCellJP = new Map<
  string,
  {
    field: string
    transform: (
      td: HTMLTableCellElement,
    ) =>
      | string
      | string[]
      | { [key: string]: string | number }
      | { [key: string]: string | number }[]
      | undefined
  }[]
>([
  ['Set no.', [{ field: 'no', transform: (td: HTMLTableCellElement) => td.textContent.trim() }]],
  [
    'Symbol',
    [
      {
        field: 'symbol_url',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('img')).map((img) => img.src),
      },
    ],
  ],
  [
    'Logo',
    [
      {
        field: 'logo_url',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('img')).map((img) => img.src),
      },
    ],
  ],
  [
    'Japanese nameTranslated name',
    [
      {
        field: 'name_original',
        transform: (td: HTMLTableCellElement) =>
          td.innerHTML
            .split('<br>')[0]!
            .split(' • ')
            .map((text) => text.trim()),
      },
      {
        field: 'name',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('a'))
            .map((a) =>
              a.textContent
                .trim()
                .split(' • ')
                .map((text) => text.trim()),
            )
            .flat(1),
      },
      {
        field: 'bulbapedia_url',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('a')).map((a) => a.href),
      },
    ],
  ],
  [
    'English equivalent',
    [
      {
        field: 'name_en_equivalent',
        transform: (td: HTMLTableCellElement) => {
          const links = Array.from(td.querySelectorAll('a')).map((a) => a.textContent.trim())
          if (links.length > 0) return links

          const texts = td.innerHTML
            .trim()
            .split('<br>')
            .filter(Boolean)
            .map((text) => text.trim())
          if (texts.length === 1) {
            const text = td.textContent.trim()
            if (text === 'N/A') return undefined
            if (text === 'TBA') return undefined
            return text
          }
        },
      },
    ],
  ],
  [
    'No. of cards',
    [
      {
        field: 'card_stats',
        transform: (td: HTMLTableCellElement) => {
          const texts = td.innerHTML
            .trim()
            .split('<br>')
            .filter(Boolean)
            .map((text) => text.trim())
          const counts = texts.map((text) => {
            if (!text.endsWith('+')) return { cards: Number.parseInt(text) }
            return { cards: Number.parseInt(text.replaceAll('+', '')), notes: [text] }
          })
          if (counts.length === 2) {
            return counts
          } else if (counts.length === 1) {
            return counts[0]
          } else {
            return {}
          }
        },
      },
    ],
  ],
  [
    'No. of cards (Secrets)',
    [
      {
        field: 'card_stats',
        transform: (td: HTMLTableCellElement) => {
          const texts = td.innerHTML.trim().split('<br>').filter(Boolean)
          const counts = texts.map((text) => {
            const counts = {}
            if (text.includes(' (')) {
              const textCount = text.substring(0, text.indexOf(' ('))
              Object.assign(counts, { cards: Number.parseInt(textCount) })
              const textSpecial = text.substring(text.indexOf(' (') + 2, text.length - 1)
              Object.assign(counts, {
                special: textSpecial !== 'TBA' ? Number.parseInt(textSpecial) : null,
              })
            } else {
              Object.assign(counts, { cards: Number.parseInt(text) })
            }
            return counts
          })
          if (counts.length === 2) {
            return counts
          } else if (counts.length === 1) {
            return counts[0]
          } else {
            return {}
          }
        },
      },
    ],
  ],
  [
    'Release date',
    [{ field: 'release_date', transform: (td: HTMLTableCellElement) => td.textContent.trim() }],
  ],
])

const transformTableSubSetCellJP = new Map<
  string,
  {
    field: string
    transform: (td: HTMLTableCellElement) => string | { [key: string]: string | number } | undefined
  }[]
>([
  [
    'Symbol',
    [
      {
        field: 'symbol_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('img')?.src,
      },
    ],
  ],
  [
    'Logo',
    [{ field: 'logo_url', transform: (td: HTMLTableCellElement) => td.querySelector('img')?.src }],
  ],
  [
    'Japanese nameTranslated name',
    [
      {
        field: 'name_original',
        transform: (td: HTMLTableCellElement) => td.innerHTML.split('<br>')[0]!.trim(),
      },
      {
        field: 'name',
        transform: (td: HTMLTableCellElement) => td.querySelector('a')!.textContent.trim(),
      },
      {
        field: 'bulbapedia_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('a')?.href,
      },
    ],
  ],
  [
    'English equivalent',
    [
      {
        field: 'name_en_equivalent',
        transform: (td: HTMLTableCellElement) => {
          const texts = td.innerHTML
            .trim()
            .split('<br>')
            .filter(Boolean)
            .map((text) => text.trim())
          if (texts.length === 1) {
            const text = td.textContent.trim()
            if (text === 'N/A') return undefined
            if (text === 'TBA') return undefined
            return text
          }
        },
      },
    ],
  ],
  [
    'No. of cards',
    [
      // only ADV Era
      {
        field: 'card_stats',
        transform: (td: HTMLTableCellElement) => {
          const text = td.textContent.trim()
          return { cards: Number.parseInt(text) }
        },
      },
    ],
  ],
  [
    'No. of cards (Secrets)',
    [
      {
        field: 'card_stats',
        transform: (td: HTMLTableCellElement) => {
          const text = td.textContent.trim()
          const counts = {}

          const idxExtra = text.indexOf(' ')
          const textCards = text.substring(0, idxExtra !== -1 ? idxExtra : text.length).trim()
          Object.assign(counts, { cards: Number.parseInt(textCards) })

          if (text.includes(' (')) {
            const textSpecial = text.substring(text.indexOf(' (') + 2, text.indexOf(')'))
            Object.assign(counts, {
              special: textSpecial !== 'TBA' ? Number.parseInt(textSpecial) : null,
            })
          }
          if (text.includes(' + ')) {
            const textExtra = text.substring(text.indexOf('+') + 1).trim()

            const cardsStatType = textExtra.split(' ').slice(1).join(' ')
            if (mapCardStatsRawJP.has(cardsStatType)) {
              Object.assign(counts, {
                [mapCardStatsRawJP.get(cardsStatType)!]: Number.parseInt(
                  textExtra.split(' ', 1)[0]!,
                ),
              })
            } else {
              console.warn('Unexpected card stats string', { text, textExtra })
              Object.assign(counts, { invalid: [textExtra] })
            }
          }

          return counts
        },
      },
    ],
  ],
  [
    'Release date',
    [{ field: 'release_date', transform: (td: HTMLTableCellElement) => td.textContent.trim() }],
  ],
])

const transformTablePromoCellJP = new Map<
  string,
  {
    field: string
    transform: (td: HTMLTableCellElement) => string | { [key: string]: string | number } | undefined
  }[]
>([
  [
    'Symbol',
    [
      {
        field: 'symbol_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('img')?.src,
      },
    ],
  ],
  [
    'Japanese name',
    [
      {
        field: 'name_original',
        transform: (td: HTMLTableCellElement) => {
          const text = td.innerHTML.split('<br>')[0]!.trim()
          if (text === '—') return undefined
          return text
        },
      },
    ],
  ],
  [
    'Translated name',
    [
      {
        field: 'name',
        transform: (td: HTMLTableCellElement) => td.textContent.trim(),
      },
      {
        field: 'bulbapedia_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('a')?.href,
      },
    ],
  ],
  [
    'No. of cards',
    [
      {
        field: 'card_stats',
        transform: (td: HTMLTableCellElement) => {
          const texts = td.innerHTML
            .trim()
            .split('<br>')
            .filter(Boolean)
            .map((text) => text.trim())

          const counts = {}
          const invalid: string[] = []
          if (texts.length >= 1) {
            const normalText = texts[0]
            Object.assign(counts, { cards: Number.parseInt(normalText.split(' ', 1)[0]!) })

            texts.slice(1).forEach((text) => {
              const cardsStatType = text.split(' ').slice(1).join(' ')
              if (mapCardStatsRawJP.has(cardsStatType)) {
                Object.assign(counts, {
                  [mapCardStatsRawJP.get(cardsStatType)!]: Number.parseInt(text.split(' ', 1)[0]!),
                })
              } else {
                console.warn('Unexpected card stats string', { text, texts })
                invalid.push(text)
              }
            })
          }
          if (invalid.length > 0) {
            Object.assign(counts, { invalid })
          }
          return counts
        },
      },
    ],
  ],
  [
    'Release date/period',
    [{ field: 'release_date', transform: (td: HTMLTableCellElement) => td.textContent.trim() }],
  ],
])

const transformTableMainSetCellZHCN = new Map<
  string,
  {
    field: string
    transform: (td: HTMLTableCellElement) => (string | undefined)[]
  }[]
>([
  [
    'Symbol',
    [
      {
        field: 'symbol_url',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('img')).map((img) => img.src),
      },
    ],
  ],
  [
    'Translation',
    [
      {
        field: 'name',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('a')).map((a) => a.textContent.trim()),
      },
      {
        field: 'bulbapedia_url',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.querySelectorAll('a'))
            .map((a) => a.href)
            .map((url) => (url && url.endsWith('&action=edit&redlink=1') ? undefined : url)),
      },
    ],
  ],
  [
    'Simplified Chinese',
    [
      {
        field: 'name_original',
        transform: (td: HTMLTableCellElement) =>
          Array.from(td.childNodes)
            .filter((node) => node.nodeType === 3) // Node.TEXT_NODE
            .map((node) => node.nodeValue?.trim()),
      },
    ],
  ],
])

function makeFieldTransform(languageCode: string) {
  return {
    field: 'names_translated',
    merge: true,
    transform: (td: HTMLTableCellElement) => {
      const text = td.textContent.trim()
      if (text === '—') return undefined
      if (text === '—*') {
        console.warn('Handle manually', { html: td.innerHTML })
        return { [`notes:${languageCode}`]: td.innerHTML.trim() }
      }
      return { [languageCode]: text }
    },
  } as const
}

const transformTableMainSetENOther = new Map<
  string,
  {
    field: string
    merge?: boolean
    transform: (td: HTMLTableCellElement) => string | { [key: string]: string } | undefined
  }[]
>([
  [
    'Symbol',
    [
      {
        field: 'symbol_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('img')?.src,
      },
    ],
  ],
  [
    'English',
    [
      {
        field: 'name',
        transform: (td: HTMLTableCellElement) => td.textContent.trim(),
      },
      {
        field: 'bulbapedia_url',
        transform: (td: HTMLTableCellElement) => td.querySelector('a')?.href,
      },
    ],
  ],
  ['Dutch', [makeFieldTransform('nl')]],
  ['French', [makeFieldTransform('fr')]],
  ['German', [makeFieldTransform('de')]],
  ['Italian', [makeFieldTransform('it')]],
  ['Polish', [makeFieldTransform('pl')]],
  ['Brazilian Portuguese', [makeFieldTransform('pt-br')]],
  ['Spanish', [makeFieldTransform('es')]],
  ['Spanish (Spain)', [makeFieldTransform('es')]],
  ['Spanish (Latin America)', [makeFieldTransform('es-mx')]],
  ['Russian', [makeFieldTransform('ru')]],
  [
    'Other',
    [
      {
        field: 'names_translated',
        merge: true,
        transform: (td: HTMLTableCellElement) => {
          const text = td.textContent.trim()
          if (text === '—') return undefined

          return Object.fromEntries(
            Array.from(td.childNodes)
              .filter((node) => node.nodeType === 3) // Node.TEXT_NODE
              .map((node) => node.nodeValue?.trim())
              .filter((text) => text !== undefined)
              // NOTE: not sure if this will swallow future updates that I did not consider...
              .filter((text) => text.includes(': '))
              .map((text) => {
                const parts = text.split(': ')
                const language = parts[0]
                const languageCode = { Korean: 'ko', 'Traditional Chinese': 'zh-tw' }[language]
                const name = parts.slice(1).join(': ')
                return [languageCode ?? language, name]
              }),
          )
        },
      },
    ],
  ],
])

// -------------------------------------------------------------------------

function parseSetTableEN(table: HTMLTableElement) {
  const tbody = table.tBodies[0]!
  if (!tbody.children || tbody.children.length < 2) {
    console.warn('Empty table?', { table })
    return undefined
  }

  const headerRow = Array.from(tbody.children[0]!.children)
  if (!headerRow.every((th) => th.tagName === 'TH')) {
    console.warn('No header in table found!', { table, headerRow })
    return undefined
  }

  const headerKeys = headerRow.map((th) => th.textContent.trim())

  const data = []
  const rows = Array.from(tbody.children).slice(1)
  for (const row of rows) {
    const cols = Array.from(row.children) as HTMLTableCellElement[]
    const setInfo = {}
    let hasRowSpan = false

    // special handling
    const isScarletAndVioletWhiteFlare =
      headerKeys.length === 8 &&
      headerKeys[3] === 'Name of Expansion' &&
      cols[3]!.textContent.trim() === 'Scarlet & Violet—White Flare'
    if (isScarletAndVioletWhiteFlare) {
      // use values from Black Bolt due to rowSpan
      Object.assign(setInfo, structuredClone(data[data.length - 1]))
    }

    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      const col = cols[col_idx]!

      if (col.rowSpan && col.rowSpan > 1) hasRowSpan = true

      let headerIdx = col_idx
      if (isScarletAndVioletWhiteFlare) {
        if (headerIdx >= 4) headerIdx++
        if (headerIdx >= 6) headerIdx++
      }

      const headerColKey = headerKeys[headerIdx]!
      const fieldTransforms = transformTableCellEN.get(headerColKey)!
      if (fieldTransforms) {
        for (const { field, transform } of fieldTransforms) {
          Object.assign(setInfo, { [field]: transform(col) })
        }
      }
    }
    if (hasRowSpan) {
      console.warn('Fix next entries due to rowSpan!', [row.textContent.replaceAll(/\n+/g, ' - ')])
    }
    data.push(setInfo as SetInfoBriefEN)
  }
  return data
}

function parseSetsEN(document: Document) {
  const contentRoot = document.getElementById('mw-content-text')?.firstChild
  if (contentRoot === undefined) return undefined

  const allChildren = Array.from((contentRoot as HTMLDivElement).children)
  const idxTOC = allChildren.findIndex((child) => child.tagName === 'DIV' && child.id === 'toc')
  if (idxTOC === -1) {
    throw Error('Unable to find TOC element (start marker)!')
  }
  const idxSeeAlso = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'See_also',
  )
  if (idxSeeAlso === -1) {
    throw Error('Unable to find SeeAlso element (stop marker)!')
  }
  const children = allChildren.slice(idxTOC + 1, idxSeeAlso)

  let lastSeriesTypeHeader: string | null = null
  let lastSeriesHeader: string | null = null

  const data: SetInfoFullEN[] = []
  for (let idx = 0; idx < children.length; idx++) {
    const child: Element = children[idx]!

    if (child.tagName === 'H2') {
      const value = child.textContent.trim()
      lastSeriesTypeHeader = mapSeriesTypesRawEN.get(value) ?? null
      if (lastSeriesTypeHeader === null) console.error('Found unknown series type!', value)
      lastSeriesHeader = null
    } else if (child.tagName === 'H3') {
      const value = child.textContent.trim()
      lastSeriesHeader = mapSeriesRawEN.get(value) ?? null
      if (lastSeriesHeader === null) console.error('Found unknown series!', value)
    } else if (child.tagName === 'TABLE') {
      const table = child as HTMLTableElement

      const tableData = parseSetTableEN(table)
      if (tableData === undefined) {
        console.warn('No table data?', { idx })
        continue
      }

      tableData
        .map(
          (entry) =>
            ({
              series: lastSeriesHeader,
              series_type: lastSeriesTypeHeader,
              language: 'en',
              ...entry,
            }) as SetInfoFullEN,
        )
        .forEach((entry) => data.push(entry))

      lastSeriesHeader = null
    } else {
      console.warn('Unknown child!', { idx, child })
    }
  }
  return data
}

// -------------------------------------------------------------------------

function parseMainSetTableJP(table: HTMLTableElement) {
  const tbody = table.tBodies[0]!
  if (!tbody.children || tbody.children.length < 2) {
    console.warn('Empty table?', { table })
    return undefined
  }

  const headerRow = Array.from(tbody.children[0]!.children)
  if (!headerRow.every((th) => th.tagName === 'TH')) {
    console.warn('No header in table found!', { table, headerRow })
    return undefined
  }

  const headerKeys = headerRow.map((th) => th.textContent.trim())

  // Set no.
  // Symbol
  // Logo
  // Japanese name + Translated name
  // English equivalent
  // No. of cards / +
  // Release date

  const data = []
  const rows = Array.from(tbody.children).slice(1)
  for (const row of rows) {
    const cols = Array.from(row.children) as HTMLTableCellElement[]
    const setInfo = {}
    const setInfo2 = {}
    let hasRowSpan = false

    // special handling
    const isChallengeFromTheDarkness =
      headerKeys.length === 7 &&
      headerKeys[3] === 'Japanese nameTranslated name' &&
      cols[2]!.textContent.trim().includes('Challenge from the Darkness') &&
      data.length > 0
    const isMultipleInRow =
      headerKeys.length === 7 &&
      headerKeys[3] === 'Japanese nameTranslated name' &&
      cols[3]!.textContent.includes(' • ')

    if (isChallengeFromTheDarkness) {
      // use values from above due to rowSpan
      Object.assign(setInfo, structuredClone(data[data.length - 1]))
    }

    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      const col = cols[col_idx]!

      if (col.rowSpan && col.rowSpan > 1) hasRowSpan = true

      let headerIdx = col_idx
      if (isChallengeFromTheDarkness) {
        if (headerIdx >= 1) headerIdx++
      }

      const headerColKey = headerKeys[headerIdx]!
      const fieldTransforms = transformTableMainSetCellJP.get(headerColKey)!
      if (fieldTransforms) {
        for (const { field, transform } of fieldTransforms) {
          const value = transform(col)
          if (Array.isArray(value)) {
            if (value.length === 1) {
              Object.assign(setInfo, { [field]: value[0] })
              Object.assign(setInfo2, { [field]: value[0] })
            } else if (value.length === 2) {
              Object.assign(setInfo, { [field]: value[0] })
              Object.assign(setInfo2, { [field]: value[1] })
            }
          } else {
            Object.assign(setInfo, { [field]: value })
            Object.assign(setInfo2, { [field]: value })
          }
        }
      }
    }
    if (hasRowSpan) {
      console.warn('Fix next entries due to rowSpan!', [row.textContent.replaceAll(/\n+/g, ' - ')])
    }
    data.push(setInfo as SetInfoBriefJA)
    if (isMultipleInRow) data.push(setInfo2 as SetInfoBriefJA)
  }
  return data
}

function parseSubSetTableJP(table: HTMLTableElement) {
  const tbody = table.tBodies[0]!
  if (!tbody.children || tbody.children.length < 2) {
    console.warn('Empty table?', { table })
    return undefined
  }

  const headerRow = Array.from(tbody.children[0]!.children)
  if (!headerRow.every((th) => th.tagName === 'TH')) {
    console.warn('No header in table found!', { table, headerRow })
    return undefined
  }

  const headerKeys = headerRow.map((th) => th.textContent.trim())

  // Symbol
  // Logo
  // Japanese name + Translated name
  // English equivalent
  // No. of cards (Secrets)
  // Release date

  const data = []
  const rows = Array.from(tbody.children).slice(1)
  for (const row of rows) {
    const cols = Array.from(row.children) as HTMLTableCellElement[]
    const setInfo = {}

    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      const col = cols[col_idx]!

      const headerIdx = col_idx

      const headerColKey = headerKeys[headerIdx]!
      const fieldTransforms = transformTableSubSetCellJP.get(headerColKey)!
      if (fieldTransforms) {
        for (const { field, transform } of fieldTransforms) {
          const value = transform(col)
          Object.assign(setInfo, { [field]: value })
        }
      }
    }
    data.push(setInfo as SetInfoBriefJA)
  }
  return data
}

function parsePromoTableJP(table: HTMLTableElement) {
  const tbody = table.tBodies[0]!
  if (!tbody.children || tbody.children.length < 2) {
    console.warn('Empty table?', { table })
    return undefined
  }

  const headerRow = Array.from(tbody.children[0]!.children)
  if (!headerRow.every((th) => th.tagName === 'TH')) {
    console.warn('No header in table found!', { table, headerRow })
    return undefined
  }

  const headerKeys = headerRow.map((th) => th.textContent.trim())

  // Symbol
  // Japanese name
  // Translated name
  // No. of cards
  // Release date/period

  const data = []
  const rows = Array.from(tbody.children).slice(1)
  let cntCopyFromBefore = 0
  for (const row of rows) {
    const cols = Array.from(row.children) as HTMLTableCellElement[]
    const setInfo = {}
    let hasRowSpan = false

    if (cntCopyFromBefore > 0 && data.length > 0) {
      // use values from before due to rowSpan
      Object.assign(setInfo, structuredClone(data[data.length - 1]))
    }

    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      const col = cols[col_idx]!

      if (col.rowSpan && col.rowSpan > 1) {
        hasRowSpan = true
        cntCopyFromBefore = col.rowSpan - 1
      }

      let headerIdx = col_idx
      if (!hasRowSpan && cntCopyFromBefore > 0) {
        if (headerIdx >= 0) headerIdx++
        if (headerIdx >= 1) headerIdx++
      }

      const headerColKey = headerKeys[headerIdx]!
      const fieldTransforms = transformTablePromoCellJP.get(headerColKey)
      if (fieldTransforms) {
        for (const { field, transform } of fieldTransforms) {
          const value = transform(col)
          Object.assign(setInfo, { [field]: value })
        }
      }
    }
    if (!hasRowSpan && cntCopyFromBefore > 0) cntCopyFromBefore--
    hasRowSpan = false
    data.push(setInfo as SetInfoBriefJA)
  }
  return data
}

function parseSetsJP(document: Document) {
  const contentRoot = document.getElementById('mw-content-text')?.firstChild
  if (contentRoot === undefined) return undefined

  const allChildren = Array.from((contentRoot as HTMLDivElement).children)
  const idxMainSets = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'Main_Sets',
  )
  if (idxMainSets === -1) {
    throw Error('Unable to find MainSets element (start marker)!')
  }
  const idxSubSets = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'Subsets',
  )
  if (idxSubSets === -1) {
    throw Error('Unable to find SubSets element (stop/start marker)!')
  }
  const idxPromoSets = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'Promotional_sets',
  )
  if (idxPromoSets === -1) {
    throw Error('Unable to find PromoSets element (stop/start marker)!')
  }
  const idxSeeAlso = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'See_also',
  )
  if (idxSeeAlso === -1) {
    throw Error('Unable to find SeeAlso element (stop marker)!')
  }
  const mainSetChildren = allChildren.slice(idxMainSets + 1, idxSubSets)
  const subSetChildren = allChildren.slice(idxSubSets + 1, idxPromoSets)
  const promotionalChildren = allChildren.slice(idxPromoSets + 1, idxSeeAlso)

  const data: SetInfoFullJA[] = []

  let lastSeriesHeader: string | null = null
  for (let idx = 0; idx < mainSetChildren.length; idx++) {
    const child: Element = mainSetChildren[idx]!
    // h3 -> table

    if (child.tagName === 'H3') {
      const value = child.textContent.trim()
      lastSeriesHeader = mapSeriesRawJP.get(value)!
    } else if (child.tagName === 'TABLE') {
      const table = child as HTMLTableElement

      const tableData = parseMainSetTableJP(table)
      if (tableData === undefined) {
        console.warn('No table data?', { idx })
        continue
      }

      tableData
        .map((entry) => ({
          series: lastSeriesHeader,
          series_type: 'main-series',
          language: 'ja',
          ...entry,
        }))
        .forEach((entry) => data.push(entry as SetInfoFullJA))

      lastSeriesHeader = null
    } else {
      console.warn('Unknown child!', { idx, child })
    }
  }

  lastSeriesHeader = null
  let lastSeriesSubHeader: string | null = null
  for (let idx = 0; idx < subSetChildren.length; idx++) {
    const child: Element = subSetChildren[idx]!
    // h3+h4 -> table
    // h3 - series
    // h4 - Type of Expansion

    if (child.tagName === 'H3') {
      const value = child.textContent.trim()
      lastSeriesHeader = mapSeriesRawJP.get(value)!
    } else if (child.tagName === 'H4') {
      const value = child.textContent.trim()
      lastSeriesSubHeader = mapSeriesSubRawJP.get(value) ?? null
    } else if (child.tagName === 'TABLE') {
      const table = child as HTMLTableElement

      const tableData = parseSubSetTableJP(table)
      if (tableData === undefined) {
        console.warn('No table data?', { idx })
        continue
      }

      tableData
        .map((entry) => ({
          series: lastSeriesHeader,
          series_type: lastSeriesSubHeader ?? 'subset',
          language: 'ja',
          ...entry,
        }))
        .forEach((entry) => data.push(entry as SetInfoFullJA))

      lastSeriesSubHeader = null
    } else {
      console.warn('Unknown child!', { idx, child })
    }
  }

  for (let idx = 0; idx < promotionalChildren.length; idx++) {
    const child: Element = promotionalChildren[idx]!
    // single table
    if (child.tagName === 'TABLE') {
      const table = child as HTMLTableElement

      const tableData = parsePromoTableJP(table)
      if (tableData === undefined) {
        console.warn('No table data?', { idx })
        continue
      }

      tableData
        .map((entry) => ({
          series: 'other-special',
          series_type: 'promo',
          language: 'ja',
          ...entry,
        }))
        .forEach((entry) => data.push(entry as SetInfoFullJA))
    } else {
      console.warn('(promo) Child is not a TABLE!', { child })
    }
  }

  return data
}

// -------------------------------------------------------------------------

function parseSetsTableZHCN(table: HTMLTableElement) {
  const tbody = table.tBodies[0]!
  if (!tbody.children || tbody.children.length < 2) {
    console.warn('Empty table?', { table })
    return undefined
  }

  const headerRow = Array.from(tbody.children[0]!.children)
  if (!headerRow.every((th) => th.tagName === 'TH')) {
    console.warn('No header in table found!', { table, headerRow })
    return undefined
  }

  const headerKeys = headerRow.map((th) => th.textContent.trim())

  // Symbol
  // Translation
  // Simplified Chinese

  const data = []
  const rows = Array.from(tbody.children).slice(1)
  for (const row of rows) {
    const cols = Array.from(row.children) as HTMLTableCellElement[]

    const isMultipleInRow =
      headerKeys.length === 3 && headerKeys[0] === 'Symbol' && cols[0].childElementCount !== 1
    const numInRow = isMultipleInRow
      ? Array.from(cols[0].children).filter((child) => child.tagName === 'BR').length + 1
      : 1

    const setInfos = Array(numInRow)
      .fill(undefined)
      .map(() => ({}))

    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      const col = cols[col_idx]!
      const headerIdx = col_idx

      const headerColKey = headerKeys[headerIdx]!
      const fieldTransforms = transformTableMainSetCellZHCN.get(headerColKey)
      if (fieldTransforms) {
        for (const { field, transform } of fieldTransforms) {
          const values = transform(col)
          if (Array.isArray(values)) {
            if (values.length === 0) {
              console.warn('No value found in table cell', { col, col_idx })
              continue
            }

            if (values.length !== numInRow) {
              console.error('Not enought values found in table cell!', { values, numInRow })
              throw Error('Unable to continue! Fix code first.')
            }
            for (let value_idx = 0; value_idx < values.length; value_idx++) {
              Object.assign(setInfos[value_idx], { [field]: values[value_idx] })
            }
          }
        }
      }
    }
    data.push(...(setInfos as SetInfoBriefZHCN[]))
  }
  return data
}

function parseSetsZHCN(document: Document) {
  const contentRoot = document.getElementById('mw-content-text')?.firstChild
  if (contentRoot === undefined) return undefined

  const allChildren = Array.from((contentRoot as HTMLDivElement).children)
  const idxZNSimpleHeader = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'Simplified_Chinese_Catch-up_sets',
  )
  if (idxZNSimpleHeader === -1) {
    throw Error('Unable to find Simplified_Chinese_Catch-up_sets element (start marker)!')
  }
  const idxNotice = allChildren.findIndex(
    (child) =>
      child.tagName === 'TABLE' && (child as HTMLTableElement).style.borderRadius === '80px',
  )
  if (idxNotice === -1) {
    throw Error('Unable to find notice element ("article is part of Project TCG", stop marker)!')
  }
  const zhSimpleSetChildren = allChildren
    .slice(idxZNSimpleHeader + 1, idxNotice)
    .filter((child) => child.outerHTML !== '<div style="clear:both;"></div>')

  const data: SetInfoFullZHCN[] = []

  let lastSeriesHeader: string | null = null
  for (let idx = 0; idx < zhSimpleSetChildren.length; idx++) {
    const child: Element = zhSimpleSetChildren[idx]!
    // h3 -> table

    if (child.tagName === 'H3') {
      const value = child.textContent.trim()
      // NOTE: can reuse, same labels
      lastSeriesHeader = mapSeriesRawJP.get(value)!
    } else if (child.tagName === 'TABLE') {
      const table = child as HTMLTableElement

      const tableData = parseSetsTableZHCN(table)
      if (tableData === undefined) {
        console.warn('No table data?', { idx })
        continue
      }

      tableData
        .map((entry) => ({
          series: lastSeriesHeader,
          series_type: 'main-series',
          language: 'zh-cn',
          ...entry,
        }))
        .forEach((entry) => data.push(entry as SetInfoFullZHCN))

      lastSeriesHeader = null
    } else {
      console.warn('Unknown child!', { idx, child })
    }
  }

  return data
}

function parseSetsTableENOther(table: HTMLTableElement) {
  const tbody = table.tBodies[0]!
  if (!tbody.children || tbody.children.length < 2) {
    console.warn('Empty table?', { table })
    return undefined
  }

  const headerRow = Array.from(tbody.children[0]!.children)
  if (!headerRow.every((th) => th.tagName === 'TH')) {
    console.warn('No header in table found!', { table, headerRow })
    return undefined
  }

  const headerKeys = headerRow.map((th) => th.textContent.trim())

  // Symbol
  // English
  // [Language...]

  const data = []
  const rows = Array.from(tbody.children).slice(1)
  for (const row of rows) {
    const cols = Array.from(row.children) as HTMLTableCellElement[]
    const setInfo = {}

    let colSpanCntr = 0
    let headerIdx = 0
    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      const col = cols[col_idx]!
      colSpanCntr = col.colSpan

      // due to col spans, iterate over "virtual" columns
      for (let colSpan_idx = 0; colSpan_idx < colSpanCntr; colSpan_idx++) {
        const headerColKey = headerKeys[headerIdx]!

        const fieldTransforms = transformTableMainSetENOther.get(headerColKey)
        if (fieldTransforms) {
          for (const { field, merge = false, transform } of fieldTransforms) {
            const value = transform(col)
            // console.log('value', { field, value, merge, col, headerColKey })
            if (merge) {
              if (!Object.hasOwn(setInfo, field)) {
                Object.assign(setInfo, { [field]: {} })
              }
              Object.assign((setInfo as { [key: string]: object })[field], value)
            } else {
              Object.assign(setInfo, { [field]: value })
            }
            // console.log('setInfo', setInfo)
          }
        } else {
          // NOTE: might also be due to invalid colSpan (too long)
          console.warn('Unsupported column', {
            col_idx,
            headerIdx,
            colSpan: col.colSpan,
            headerColKey,
          })
        }

        headerIdx++
      }
    }
    data.push(setInfo as SetInfoBriefENOther)
  }
  return data
}

function parseSetsENOther(document: Document) {
  const contentRoot = document.getElementById('mw-content-text')?.firstChild
  if (contentRoot === undefined) return undefined

  const allChildren = Array.from((contentRoot as HTMLDivElement).children)
  const idxEnglishHeader = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'English_sets',
  )
  if (idxEnglishHeader === -1) {
    throw Error('Unable to find English_sets element (start marker)!')
  }
  const idxJapaneseHeader = allChildren.findIndex(
    (child) =>
      child.tagName === 'H2' &&
      child.childElementCount === 1 &&
      child.firstElementChild?.tagName === 'SPAN' &&
      child.firstElementChild.id === 'Japanese_sets',
  )
  if (idxJapaneseHeader === -1) {
    throw Error('Unable to find Japanese_sets element (end marker)!')
  }
  const enOtherChildren = allChildren
    .slice(idxEnglishHeader + 1, idxJapaneseHeader)
    .filter((child) => child.tagName !== 'P')
  if (idxJapaneseHeader < idxEnglishHeader) {
    console.warn('Japanese header should follow after English header!', {
      idxEnglishHeader,
      idxJapaneseHeader,
    })
    throw Error('Japanese header should follow after English header!')
  }
  const shouldNotHaveOtherH2Header = enOtherChildren.find((child) => child.tagName === 'H2')
  if (shouldNotHaveOtherH2Header !== undefined) {
    console.warn('Between English and Japanese header should not be another H2 headder!', {
      shouldNotHaveOtherH2Header,
    })
    throw Error('Between English and Japanese header should not be another H2 headder!')
  }

  const data: SetInfoFullENOther[] = []

  let lastSeriesHeader: string | null = null
  for (let idx = 0; idx < enOtherChildren.length; idx++) {
    const child: Element = enOtherChildren[idx]!
    // h3 -> table

    if (child.tagName === 'H3') {
      const value = child.textContent.trim()
      lastSeriesHeader = mapSeriesRawEN.get(value)!
    } else if (child.tagName === 'TABLE') {
      const table = child as HTMLTableElement

      const tableData = parseSetsTableENOther(table)
      if (tableData === undefined) {
        console.warn('No table data?', { idx })
        continue
      }

      tableData
        .map((entry) => ({
          series: lastSeriesHeader,
          ...entry,
        }))
        .forEach((entry) => data.push(entry as SetInfoFullENOther))

      lastSeriesHeader = null
    } else {
      console.warn('Unknown child!', { idx, child })
    }
  }

  return data
}

// -------------------------------------------------------------------------
// TCGdex mappings

/**
 * Map a Bulbapedia set name to the TCGdex set id (with certain known transformation/mapping rules).
 *
 * @param mapTCGdexSetNameToID mapping of TCGdex set name to id
 * @param setName a set name to retrieve the TCGdex set id for
 * @returns resolved TCGdex set id (if found else `undefined`) and set search name (may be modified to match TCGdex set name)
 */
function getTCGdexSetID(
  mapTCGdexSetNameToID: Map<string, string>,
  setName: string,
): [string | undefined, string] {
  let name = setName
  let id = mapTCGdexSetNameToID.get(name)

  // check common prefixes
  if (id === undefined) {
    const prefixes = [
      'Mega Evolution—',
      'Black & White—',
      'Diamond & Pearl—',
      'Scarlet & Violet—',
      'Sword & Shield—',
      'Sun & Moon—',
      'XY—',
      'HS—',
      'Platinum—',
      'EX ',
      'Pokémon TCG: ',
    ]
    for (const prefix of prefixes) {
      if (name.startsWith(prefix)) {
        name = name.slice(prefix.length)
        break
      }
    }
    id = mapTCGdexSetNameToID.get(name)
  }

  // known special cases
  if (id === undefined) {
    // reset
    name = setName

    if (name.startsWith("McDonald's Collection ")) {
      name = name.replace("McDonald's", "Macdonald's")
      // NOTE that TCGdex both has "McDonald's Collection" and "Promo McDonald's" names
      // "Promo" for French, the other for international releases
    } else if (name === 'Best of Game') {
      name = 'Best of game'
    } else if (name === 'HeartGold & SoulSilver') {
      name = 'HeartGold SoulSilver'
    } else if (name === 'Pokémon Futsal') {
      // NOTE: release of future futsal sets might need fixing here
      name = 'Pokémon Futsal 2020'
    }
    id = mapTCGdexSetNameToID.get(name)
  }

  return [id, name] as const
}

/**
 * Build a mapping of set name to id using the TCGdex API.
 *
 * @param language TCGdex language code
 * @returns mapping of TCGdex set name to TCGdex set id
 */
async function getTCGdexSets(language: string = 'en') {
  const tcgdex = new TCGdex(language as SupportedLanguages)

  // const tcgSeriesListPreview = await tcgdex.serie.list()

  const sets = await tcgdex.set.list()
  const setNameWithID = sets.map((set) => [set.name, set.id] as const)
  const mapTCGdexSetNameToID = new Map<string, string>(setNameWithID)
  if (setNameWithID.length !== mapTCGdexSetNameToID.size) {
    console.error('Mapping swallowed some items?', [
      setNameWithID.length,
      mapTCGdexSetNameToID.size,
    ])
    return undefined
  }

  return mapTCGdexSetNameToID
}

/**
 * Build a lookup of TCGdex set id to TCGdex series ids.
 *
 * Lookup is `set.id` to (`serie.name` + `serie.id`).
 *
 * @param tcgdex TCGdex API adapter
 * @param delay nice request delay for parallel requests to TCGdex API
 * @returns mapping of TCGdex set id to tuple of TCGdex series name and id, `undefined` if the was some set id collision
 */
async function _getSetSeriesInfoMap(tcgdex: TCGdex, delay: number | undefined = 250) {
  const series = await tcgdex.serie.list()
  const mapSetSeriesStuff = (
    await Promise.all(
      series.map(async (serie) => {
        const serieFull = await serie.getSerie()
        // lets be nice and also avoid errors
        if (delay !== undefined && delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }

        return serieFull.sets.map((set) => [set.id, [serie.name, serie.id]] as const)
      }),
    )
  ).flat(1)
  const mapSetWithInfos = new Map<string, readonly [string, string]>(mapSetSeriesStuff)
  if (mapSetSeriesStuff.length !== mapSetWithInfos.size) {
    console.error('Some set/series info got lost', [mapSetSeriesStuff.length, mapSetWithInfos.size])
    return undefined
  }
  return mapSetWithInfos
}

// + approx mapping between Bulbapedia and TCGdex API
// (japanese might have some smaller series that are part of others?)
/**
 * Generate mapping of Bulbapedia series to TCGdex series. Uses the list of sets in a series that can be more easily mapped to then derive the series that should be equivalent or at least be similar based on shared sets.
 *
 * @param mapTCGdexSetNameToID mapping of TCGdex set names to their id, can be `undefined` to automaticall be retrieve by `getTCGdexSets`
 * @param bulbapediaSetInfo list of Bulbapedia set infos, if `undefined` will be fetch again with `parseSetsEN`
 * @param language language for TCGdex API (`en`)
 * @returns mapping of bulbapedia series id to list of TCGdex series ids, both sides may be undefined/empty to account for series only defined by one but not the other
 */
export async function getTCGdexSeriesEN(
  mapTCGdexSetNameToID: Map<string, string> | undefined = undefined,
  bulbapediaSetInfo: SetInfoFullEN[] | undefined = undefined,
  language: string = 'en',
) {
  // if not supplied, try to parse
  if (bulbapediaSetInfo === undefined) {
    const document = await fetchAndParseToDocument(
      urlBase + 'List_of_Pokémon_Trading_Card_Game_expansions',
    )
    bulbapediaSetInfo = parseSetsEN(document)
  }
  if (bulbapediaSetInfo === undefined) {
    console.error('No parsed data!')
    return undefined
  }

  // if not supplied, compute
  if (mapTCGdexSetNameToID === undefined) {
    mapTCGdexSetNameToID = await getTCGdexSets(language)
  }
  if (mapTCGdexSetNameToID === undefined) {
    console.error('No tcgdex set data!')
    return undefined
  }

  const tcgdex = new TCGdex(language as SupportedLanguages)

  // build lookup of tcgdex set id to tcgdex series ids
  const mapSetWithInfos = await _getSetSeriesInfoMap(tcgdex)
  if (mapSetWithInfos === undefined) return undefined

  // now match based on set name to find parent series
  const found: [string, string, string][] = []
  bulbapediaSetInfo.forEach((entry) => {
    const [tcgdexSetId, matchedName] = getTCGdexSetID(mapTCGdexSetNameToID, entry.name)
    if (tcgdexSetId !== undefined) {
      const serieInfo = mapSetWithInfos.get(tcgdexSetId)
      if (serieInfo === undefined) {
        console.warn('Set not found?!', tcgdexSetId, [entry.name, matchedName])
        return
      }

      // bulbapedia series key, tcgdex series ID, tcgdex series name
      found.push([entry.series, serieInfo[1], serieInfo[0]])
    } else {
      // TODO: do we need to keep track of it? Let's do it at the end for any we missed
    }
  })
  // deduplicate based on ids
  const foundDedup = found.toSorted().reduce(
    (list, cur) => {
      const found = list.findIndex((ele) => ele[0] === cur[0] && ele[1] === cur[1]) !== -1
      if (!found) list.push(cur)
      return list
    },
    [] as [string, string, string][],
  )
  // now group by bulbapedia id
  const foundMapping = foundDedup.reduce((map, cur) => {
    const bulbaID = cur[0]
    const tcgdexIDs = map.get(bulbaID) ?? []
    tcgdexIDs.push(cur[1])
    map.set(bulbaID, tcgdexIDs)
    return map
  }, new Map<string | null, string[]>())

  // find difference
  // include bulbapedia series that have no corresponding tcgdex series
  mapSeriesRawEN
    .values()
    .filter((bulbaSeriesID) => !foundMapping.has(bulbaSeriesID))
    .forEach((bulbaSseriesID) => {
      foundMapping.set(bulbaSseriesID, [])
    })

  // TODO: should we keep series where single sets are not matches but others are?
  const leftOverTcgdexSeriesIDs = Array.from(
    mapSetWithInfos
      .values()
      .map(([, tcgdexSeriesID]) => tcgdexSeriesID)
      .reduce((set, cur) => set.add(cur), new Set<string>())
      .keys()
      .filter(
        (tcgdexSeriesID) => !Array.from(foundMapping.values()).flat(1).includes(tcgdexSeriesID),
      ),
  )
  if (leftOverTcgdexSeriesIDs.length > 0) {
    console.log('Left over TCGdex series IDs:', leftOverTcgdexSeriesIDs)
    foundMapping.set(null, leftOverTcgdexSeriesIDs)
  }

  return foundMapping
}

// -------------------------------------------------------------------------

/**
 * Test mapping between Bulbapedia and TCGdex sets.
 *
 * @see {@link getTCGdexSetID} the actual set name mapper
 */
export async function _checkTCGdexSetIDMapping() {
  const mapTCGdexSetNameToID = await getTCGdexSets()
  if (mapTCGdexSetNameToID === undefined) {
    console.error('Unable to get TCGdex set data')
    return
  }

  const document = await fetchAndParseToDocument(
    urlBase + 'List_of_Pokémon_Trading_Card_Game_expansions',
  )
  const result = parseSetsEN(document)

  const found: [string, string, string][] = []
  const missing: string[] = []
  result?.forEach((entry) => {
    const [id, name] = getTCGdexSetID(mapTCGdexSetNameToID, entry.name)
    if (id !== undefined) {
      found.push([entry.name, id, name])
    } else {
      missing.push(entry.name)
    }
  })
  const candidates = Array.from(mapTCGdexSetNameToID.keys()).filter(
    (name) => found.find(([, , efn]) => efn === name) === undefined,
  )

  console.log('found mappings between Bulbapedia and TCGdex', found)
  console.log('no match/missing in TCGdex', missing.sort())
  console.log('candidates without match in TCGdex', candidates.sort())
  console.log(
    `Found: ${found.length}, Missing: ${missing.length}, Remaining Condidates: ${candidates.length}`,
  )
}

// TODO: maybe better to use set mapping to build series mapping
/**
 * Mapping of Bulbapedia to TCGdex series. Will try to use the series names only.
 *
 * NOTE: maybe not use this as it is not as successful as {@link getTCGdexSeriesEN}.
 *
 * @see {@link _checkTCGdexSeriesIDMappingBySets}
 * @see {@link getTCGdexSeriesEN} better mapping using the sets contained in each series
 */
export async function _checkTCGdexSeriesIDMapping() {
  console.log('[bulbapedia] mapSeriesRawEN', mapSeriesRawEN)

  const tcgdex = new TCGdex('en' as SupportedLanguages)
  const series = await tcgdex.serie.list()
  const seriesNameWithID = series.map((serie) => [serie.name, serie.id] as const)
  console.log('[tcgdex] seriesNameWithID', seriesNameWithID)

  const found: [string, string, string, string][] = []
  const missing: string[] = []

  // find matches
  seriesNameWithID.forEach(([seriesName, seriesId]) => {
    let name = seriesName
    let id = mapSeriesRawEN.get(name)

    if (id === undefined) {
      const candidateName = `${name} Series`
      id = mapSeriesRawEN.get(candidateName)
      if (id !== undefined) name = candidateName
    }

    if (id !== undefined) {
      found.push([seriesName, name, id, seriesId])
    } else {
      missing.push(seriesName)
    }
  })

  // what is left over
  const candidates = Array.from(mapSeriesRawEN.keys()).filter(
    (name) => found.find(([, nn, ,]) => nn === name) === undefined,
  )

  console.log('found', found)
  console.log('[tcgdex] missing', missing.sort())
  console.log('[bulbapedia] candidates', candidates.sort())
  console.log(
    `Found: ${found.length}, Missing: ${missing.length}, Remaining Condidates: ${candidates.length}`,
  )
}

/**
 * Only for outputting the matches between Bulbapedia and TCGdex series. Uses matching of sets to find similar series.
 *
 * @see {@link getTCGdexSeriesEN} actual matching method
 */
export async function _checkTCGdexSeriesIDMappingBySets() {
  const foundMapping = await getTCGdexSeriesEN()
  console.log(foundMapping)
}

// for manual review
// await _checkTCGdexSetIDMapping()
// await _checkTCGdexSeriesIDMapping()
// await _checkTCGdexSeriesIDMappingBySets()

// -------------------------------------------------------------------------

const DN_OUTPUT = 'out'

// TODO: manual fixing
// - "invalid" card_stats --> note
export async function processSetsEN(dn_output: string) {
  const mapTCGdexSetNameToID = await getTCGdexSets()
  if (mapTCGdexSetNameToID === undefined) {
    console.error('Unable to get TCGdex set data')
    return
  }

  const document = await fetchAndParseToDocument(
    urlBase + 'List_of_Pokémon_Trading_Card_Game_expansions',
  )
  const result = parseSetsEN(document)
  if (result === undefined) {
    console.warn('Unable to parse EN Sets?')
    return
  }

  result.forEach((set) => {
    const [id, name] = getTCGdexSetID(mapTCGdexSetNameToID, set.name)
    if (id !== undefined) {
      set.tcgdex_id = id
      if (name !== set.name) {
        console.warn('Matched EN Set name:', [set.name, name], [set.series])
      }
    }
  })

  writeFileSync(
    pathJoin(dn_output, 'bulbapedia-en-sets.json'),
    JSON.stringify(result, undefined, 2),
  )
}

// TODO: manual fixing
// - "invalid" card_stats --> note
export async function processSetsJA(dn_output: string) {
  const document = await fetchAndParseToDocument(
    urlBase + 'List_of_Japanese_Pokémon_Trading_Card_Game_expansions',
  )
  const result = parseSetsJP(document)
  if (result === undefined) {
    console.warn('Unable to parse JP Sets?')
    return
  }

  writeFileSync(
    pathJoin(dn_output, 'bulbapedia-ja-sets.json'),
    JSON.stringify(result, undefined, 2),
  )
}

export async function processSetsOther(dn_output: string) {
  const document = await fetchAndParseToDocument(
    urlBase + 'List_of_Pokémon_Trading_Card_Game_expansions_in_other_languages',
  )

  const resultENMappings = parseSetsENOther(document)
  const resultZHSimple = parseSetsZHCN(document)

  writeFileSync(
    pathJoin(dn_output, 'bulbapedia-en-other-sets.json'),
    JSON.stringify(resultENMappings, undefined, 2),
  )
  writeFileSync(
    pathJoin(dn_output, 'bulbapedia-zh-cn-sets.json'),
    JSON.stringify(resultZHSimple, undefined, 2),
  )
}

mkdirSync(DN_OUTPUT, { recursive: true })

processSetsEN(DN_OUTPUT)
processSetsJA(DN_OUTPUT)
processSetsOther(DN_OUTPUT)

// -------------------------------------------------------------------------
