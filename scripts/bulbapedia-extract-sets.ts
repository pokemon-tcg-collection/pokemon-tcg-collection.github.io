/**
 * Bulbapedia - Pokemon Set scraping script
 *
 * Run with:
 *   node bulbapedia-extract-sets.ts
 */

import { JSDOM } from 'jsdom'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join as pathJoin } from 'node:path'

// -------------------------------------------------------------------------
// generic

const urlBase = 'https://bulbapedia.bulbagarden.net/wiki/'
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

async function fetchAndParseToDocument(url: string) {
  const response = await fetch(url, { headers })
  const data = await response.text()

  const dom = new JSDOM(data, { url, contentType: 'text/html' })
  const document = dom.window.document

  return document
}

// -------------------------------------------------------------------------
// types

interface SetInfoBriefEN {
  no?: string
  symbol_url?: string | undefined
  logo_url?: string | undefined
  name: string
  cards_stats: { [key: string]: number | string[] }
  release_date?: string
  abbrev: string
  bulbapedia_url: string
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

// -------------------------------------------------------------------------
// mappings

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
    ) => string | undefined | string[] | { [key: string]: string | number }
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
    [{ field: 'abbrev', transform: (td: HTMLTableCellElement) => td.textContent.trim() }],
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
      lastSeriesTypeHeader = mapSeriesTypesRawEN.get(value)!
      lastSeriesHeader = null
    } else if (child.tagName === 'H3') {
      const value = child.textContent.trim()
      lastSeriesHeader = mapSeriesRawEN.get(value)!
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

      let headerIdx = col_idx

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
      const fieldTransforms = transformTablePromoCellJP.get(headerColKey)!
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

const DN_OUTPUT = 'out'

// TODO: manual fixing
// - "invalid" card_stats --> note
async function processSetsEN() {
  const document = await fetchAndParseToDocument(
    urlBase + 'List_of_Pokémon_Trading_Card_Game_expansions',
  )
  const result = parseSetsEN(document)

  writeFileSync(
    pathJoin(DN_OUTPUT, 'bulbapedia-en-sets.json'),
    JSON.stringify(result, undefined, 2),
  )
}

// TODO: manual fixing
// - "invalid" card_stats --> note
async function processSetsJA() {
  const document = await fetchAndParseToDocument(
    urlBase + 'List_of_Japanese_Pokémon_Trading_Card_Game_expansions',
  )
  const result = parseSetsJP(document)

  writeFileSync(
    pathJoin(DN_OUTPUT, 'bulbapedia-ja-sets.json'),
    JSON.stringify(result, undefined, 2),
  )
}

mkdirSync(DN_OUTPUT, { recursive: true })

processSetsEN()
processSetsJA()

// -------------------------------------------------------------------------
