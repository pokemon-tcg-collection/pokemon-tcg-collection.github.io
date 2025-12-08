/**
 * tcg.mik.moe - Simplified Chinese Pokemon Sets/Cards scraping script.
 *
 * Run with:
 *   node tcg-mik-moe-extract.ts
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path, { join as pathJoin } from 'node:path'

// -------------------------------------------------------------------------

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0'

const baseUri = 'https://tcg.mik.moe/'
const baseUriAPI = `${baseUri}api/v3/`
const baseUriStatic = `${baseUri}static/`
const baseUriAssets = `${baseUri}assets/`

// -------------------------------------------------------------------------

function blobToBase64(blob: Blob) {
  // https://stackoverflow.com/a/61226119/9360161
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  return new Promise((resolve) => {
    reader.onloadend = () => {
      resolve(reader.result)
    }
  })
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// -------------------------------------------------------------------------

// https://app.quicktype.io/?l=ts

export interface ProductListResponse {
  code: 200 | number
  data: ProductListData
  msg: 'OK.' | string
}

export interface ProductDetailResponse {
  code: 200 | number
  data: Set
  msg: 'OK.' | string
}

export interface CardDetailResponse {
  code: number
  data: CardDetail
  msg: string
}

export interface ProductListData {
  list: Product[]
}

export interface Product {
  setId: string
  name: string
  setCode: string
  releaseDate: Date
  series: Series
  mainExpansion: boolean
  cardsNum: number
}

export interface Set {
  name: string
  setCode: SetCode | string
  setId: string
  releaseDate: Date
  series: string
  mainExpansion: boolean
  cardsNum: number
  cards: Card[]
}

export interface Card {
  setCode: SetCode | string
  cardIndex: string
  cardName: string
  rarity: CardRarity
  effectId: string
  cardType: CardType
  yorenCode: string
  is: Mechanic[]
  setCodeEn: SetCodeEn | string
  cardIndexEn: string
  nameEn: string
}

export interface CardDetail {
  name: string
  cardType: CardType
  mechanic: Mechanic | null
  label: Mechanic[] | null
  description: string
  yorenCode: string
  pokemonAttr: PokemonAttr | null
  setCode: SetCode | string
  cardIndex: string
  setCardsNum: string
  artist: string
  rarity: CardRarity
  releaseDate: Date
  regulationMark: RegulationMark
  effectId: string
  regulationLegal: RegulationLegal
  effectSameCards: Card[]
  setCodeEn: SetCodeEn | string
  cardIndexEn: string
  nameEn: string
}

export interface PokemonAttr {
  energyType: Energy
  stage: Mechanic
  hp: number
  ability: Ability[]
  ancientTrait: string
  weakness: WeaknessResistance | null
  resistance: WeaknessResistance | null
  retreatCost: number
  attack: Attack[]
  evolvesFrom: string
}

export interface Ability {
  name: string
  text: string
  isVStarPower: boolean
}

export interface Attack {
  name: string
  text: string
  cost: string
  damage: string
  isVStarPower: boolean
}

export interface WeaknessResistance {
  energy: Energy
  value: string
}

export interface RegulationLegal {
  standard: boolean
  expanded: boolean
  smSeries: boolean
}

type Series = 'Scarlet & Violet' | 'Sun & Moon' | 'Sword & Shield'

export type CardType =
  | 'Pokemon'
  | 'Item'
  | 'Tool'
  | 'Supporter'
  | 'Stadium'
  | 'Basic Energy'
  | 'Special Energy'
export type Mechanic =
  | 'Basic'
  | 'Stage 1'
  | 'Stage 2'
  | 'Future'
  | 'Ancient'
  | 'Single Strike'
  | 'Rapid Strike'
  | 'Fusion Strike'
  | 'ex'
  | 'V'
  | 'VMAX'
  | 'VSTAR'
  | 'V-UNION'
  | 'GX'
  | 'Ultra Beast'
  | 'Prism Star'
  | 'Radiant'
  | 'TAG TEAM'
export type CardRarity =
  | 'C'
  | 'U'
  | 'R'
  | 'RR'
  | 'RRR'
  | 'A'
  | 'AR'
  | 'S'
  | 'SR'
  | 'SSR'
  | 'SAR'
  | 'UR'
  | 'HR'
  | 'SR'
  | 'CSR'
  | 'CHR'
  | 'PR'
  | 'K'
  | '无标记'
  | '●'
  | '◆'
  | '★'
  | '★★'
  | '★★★'

export type RegulationMark = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type Energy = 'G' | 'W' | 'L' | 'P' | 'D' | 'M' | 'C' | 'F' | 'R' | 'N' | 'Y'

export type SetCode =
  | '151C'
  | 'CBB1C'
  | 'CBB2C'
  | 'CBB3C'
  | 'CS0LC'
  | 'CS1.5C'
  | 'CS1aC'
  | 'CS1bC'
  | 'CS1DC'
  | 'CS2.1C'
  | 'CS2.5C'
  | 'CS2aC'
  | 'CS2bC'
  | 'CS2DaC'
  | 'CS3.5C'
  | 'CS3aC'
  | 'CS3bC'
  | 'CS3DC'
  | 'CS4.1C'
  | 'CS4.5C'
  | 'CS4aC'
  | 'CS4bC'
  | 'CS4DaC'
  | 'CS5.1C'
  | 'CS5.5C'
  | 'CS5aC'
  | 'CS5bC'
  | 'CS5DC'
  | 'CS6.1C'
  | 'CS6.5C'
  | 'CS6aC'
  | 'CS6bC'
  | 'CSAC'
  | 'CSBC'
  | 'CSCC'
  | 'CSDC'
  | 'CSEC'
  | 'CSFC'
  | 'CSGC'
  | 'CSHC'
  | 'CSIC'
  | 'CSJC'
  | 'CSM1.5C'
  | 'CSM1aC'
  | 'CSM1bC'
  | 'CSM1cC'
  | 'CSM1DC'
  | 'CSM2.1C'
  | 'CSM2.5C'
  | 'CSM2aC'
  | 'CSM2bC'
  | 'CSM2cC'
  | 'CSM2DC'
  | 'CSMAC'
  | 'CSMC'
  | 'CSMJC'
  | 'CSMLC'
  | 'CSMPaC'
  | 'CSMPbC'
  | 'CSMPcC'
  | 'CSMPdC'
  | 'CSMPeC'
  | 'CSMPfC'
  | 'CSMPgC'
  | 'CSMPhC'
  | 'CSMPiC'
  | 'CSMPjC'
  | 'CSMPkC'
  | 'CSMPlC'
  | 'CSMPmC'
  | 'CSMPnC'
  | 'CSMPoC'
  | 'CSMPpC'
  | 'CSMPqC'
  | 'CSMYC'
  | 'CSNC'
  | 'CSOC'
  | 'CSUC'
  | 'CSV1C'
  | 'CSV2C'
  | 'CSV3C'
  | 'CSV4C'
  | 'CSV5C'
  | 'CSV6C'
  | 'CSVE1C'
  | 'CSVE1pC'
  | 'CSVE2C'
  | 'CSVE2pC'
  | 'CSVH1aC'
  | 'CSVH1C'
  | 'CSVH1pC'
  | 'CSVH2aC'
  | 'CSVH2C'
  | 'CSVH2pC'
  | 'CSVH3aC'
  | 'CSVH3C'
  | 'CSVH3pC'
  | 'CSVL1C'
  | 'CSVL2C'
  | 'CSXC'
  | 'CSYC'
  | 'CSZC'
  | 'SMP'
  | 'SSP'
  | 'SVP'
export type SetCodeEn =
  | 'ASR'
  | 'BRS'
  | 'BST'
  | 'BUS'
  | 'CEC'
  | 'CEL'
  | 'CES'
  | 'CIN'
  | 'CPA'
  | 'CRE'
  | 'CRZ'
  | 'DAA'
  | 'DRM'
  | 'Energy'
  | 'EVS'
  | 'FLI'
  | 'FST'
  | 'GRI'
  | 'HIF'
  | 'LOR'
  | 'LOT'
  | 'MEW'
  | 'OBF'
  | 'PAF'
  | 'PAL'
  | 'PAR'
  | 'PGO'
  | 'PRE'
  | 'RCL'
  | 'SCR'
  | 'SHF'
  | 'SIT'
  | 'SLG'
  | 'SMP'
  | 'SP'
  | 'SSH'
  | 'SSP'
  | 'SUM'
  | 'SVE'
  | 'SVI'
  | 'SVP'
  | 'TEF'
  | 'TEU'
  | 'TWM'
  | 'UNB'
  | 'UNM'
  | 'UPR'
  | 'VIV'

// -------------------------------------------------------------------------

// [1] initial page visit
async function _download_start() {
  const urlCards = `${baseUri}cards`
  const resp = await fetch(urlCards, {
    credentials: 'include',
    headers: {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Sec-GPC': '1',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
    },
    referrer: baseUri,
    method: 'GET',
    mode: 'cors',
  })
  const content = await resp.text()
  return [urlCards, content] as const
}

// [1.a] to fetch product list / set list
async function _download_product_list(urlCards: string) {
  const urlProductList = `${baseUriAPI}card/product-list`
  const resp = await fetch(urlProductList, {
    credentials: 'include',
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Content-Type': 'application/json',
      'Sec-GPC': '1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
    },
    referrer: urlCards,
    body: '{}',
    method: 'POST',
    mode: 'cors',
  })
  const contentProductList = (await resp.json()) as ProductListResponse
  if (contentProductList.code !== 200) {
    console.error('Invalid response status code', contentProductList)
    throw Error('Unexpected status for /card/product-list')
  }

  const products = contentProductList.data.list

  return products
}

// [1.b] to fetch for each set
async function _download_product_image(urlCards: string, setId: string) {
  const urlSetImg = `${baseUriStatic}setCode/${setId}.png`
  const resp = await fetch(urlSetImg, {
    credentials: 'include',
    headers: {
      'User-Agent': userAgent,
      Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Sec-GPC': '1',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'same-origin',
      Priority: 'u=4, i',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
    },
    referrer: urlCards,
    method: 'GET',
    mode: 'cors',
  })
  const buffer = await resp.bytes()
  return buffer
}

// [2] to fetch a set (details)
async function _download_product_details(urlCards: string, setId: string) {
  const urlCardSet = `${urlCards}/${setId}`
  const urlProductDetail = `${baseUriAPI}card/product-detail`
  const resp = await fetch(urlProductDetail, {
    credentials: 'include',
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Content-Type': 'application/json',
      'Sec-GPC': '1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Priority: 'u=0',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
    },
    referrer: urlCardSet,
    body: `{"setId":"${setId}"}`,
    method: 'POST',
    mode: 'cors',
  })
  const contentProductDetail = (await resp.json()) as ProductDetailResponse
  if (contentProductDetail.code !== 200) {
    console.error('Invalid response status code', contentProductDetail)
    throw Error('Unexpected status for /card/product-detail')
  }

  const detail = contentProductDetail.data
  return [urlCardSet, detail] as const
}

// [2.a] to fetch for each card of a set
async function _download_card_image(urlCardSet: string, setId: string, cardIndex: string) {
  const resp = await fetch(`${baseUriStatic}img/${setId}/${cardIndex}.png`, {
    credentials: 'omit',
    headers: {
      'User-Agent': userAgent,
      Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
    },
    referrer: urlCardSet,
    method: 'GET',
    mode: 'cors',
  })
  const buffer = await resp.bytes()
  return buffer
}

// [3] to fetch a card (details)
async function _download_card_details(urlCardSet: string, setId: string, cardIndex: string) {
  const urlCard = `${urlCardSet}/${cardIndex}`
  const urlCardDetail = `${baseUriAPI}card/card-detail`
  const respCardDetail = await fetch(urlCardDetail, {
    credentials: 'include',
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
      'Content-Type': 'application/json',
      'Sec-GPC': '1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Priority: 'u=0',
      Pragma: 'no-cache',
      'Cache-Control': 'no-cache',
    },
    referrer: urlCard,
    body: `{"setCode":"${setId}","cardIndex":"${cardIndex}"}`,
    method: 'POST',
    mode: 'cors',
  })
  const contentCardDetail = (await respCardDetail.json()) as CardDetailResponse

  if (contentCardDetail.code !== 200 && contentCardDetail.code !== 400) {
    // NOTE: some missing cards set status to 400, everything else is 200
    console.error('Invalid response status code', contentCardDetail)
    throw Error('Unexpected status for /card/card-detail')
  }

  const detail = contentCardDetail.data
  return [urlCard, detail] as const
}

// -------------------------------------------------------------------------

const DN_OUTPUT = 'out/tcg-mik-moe'

export async function downloadSetImages(
  dn_output: string,
  urlCards: string,
  sets: Product[],
  force_refresh: boolean = false,
  req_delay: number = 100,
) {
  for (let set_idx = 0; set_idx < sets.length; set_idx++) {
    const set = sets[set_idx]

    const setId = set.setId
    const filename = pathJoin(dn_output, `${setId}.webp`)

    if (force_refresh || !existsSync(filename)) {
      console.debug(
        ' - (%d/%d) Downloading set image/logo %s: %s',
        set_idx + 1,
        sets.length,
        set.setId,
        set.name,
      )

      const image = await _download_product_image(urlCards, setId)

      await writeFile(filename, image)

      if (req_delay > 0) await delay(req_delay)
    }
  }
}

export async function downloadCardImages(
  dn_output: string,
  urlCards: string,
  set: Product,
  cards: Card[],
  force_refresh: boolean = false,
  req_delay: number = 100,
) {
  for (let card_idx = 0; card_idx < cards.length; card_idx++) {
    const card = cards[card_idx]

    const setId = set.setId
    const cardIndex = card.cardIndex
    const filename = pathJoin(dn_output, `${cardIndex}.webp`)

    if (force_refresh || !existsSync(filename)) {
      console.debug(
        ' - (%d/%d) Downloading card image %s: %s',
        card_idx + 1,
        cards.length,
        card.cardIndex,
        card.cardName,
      )

      const image = await _download_card_image(urlCards, setId, cardIndex)

      await writeFile(filename, image)

      if (req_delay > 0) await delay(req_delay)
    }
  }
}

export async function processSetCards(
  dn_output: string,
  urlCards: string,
  set: Product,
  {
    cardDetails: doDownloadCardDetails = true,
    cardImages: doDownloadCardImages = true,
    force_refresh = false,
    req_delay = 100,
  }: {
    cardDetails?: boolean
    cardImages?: boolean
    force_refresh?: boolean
    req_delay?: number
  } = {},
) {
  console.log('[*] Downloading product/set details (card list) %s: %s', set.setId, set.name)
  const [urlCardSet, setDetails] = await _download_product_details(urlCards, set.setId)
  const cards = setDetails.cards

  if (req_delay > 0) await delay(req_delay)

  // write short info
  const pathCardInfo = pathJoin(dn_output, 'info')
  await mkdir(pathCardInfo, { recursive: true })
  for (let card_idx = 0; card_idx < cards.length; card_idx++) {
    const card = cards[card_idx]

    await writeFile(
      pathJoin(pathCardInfo, `${card.cardIndex}.json`),
      JSON.stringify(card, undefined, 2),
    )
  }

  // download card images
  if (doDownloadCardImages) {
    console.log('[*] Downloading card images for %s ...', set.setId)

    const pathCardImages = pathJoin(dn_output, 'images')
    await mkdir(pathCardImages, { recursive: true })

    await downloadCardImages(pathCardImages, urlCards, set, cards, force_refresh, req_delay)
  }

  // download full info
  if (doDownloadCardDetails) {
    const pathCardDetails = pathJoin(dn_output, 'details')
    await mkdir(pathCardDetails, { recursive: true })

    for (let card_idx = 0; card_idx < cards.length; card_idx++) {
      const card = cards[card_idx]
      const filename = pathJoin(pathCardDetails, `${card.cardIndex}-detail.json`)

      if (force_refresh || !existsSync(filename)) {
        console.debug(
          ' - (%d/%d) Downloading card details %s: %s',
          card_idx + 1,
          cards.length,
          card.cardIndex,
          card.cardName,
        )

        const [urlCard, cardDetail] = await _download_card_details(
          urlCardSet,
          set.setId,
          card.cardIndex,
        )
        if (!cardDetail) {
          console.warn('[!] no card details for %s: %s', card.cardIndex, card.cardName)
          continue
        }

        await writeFile(filename, JSON.stringify(cardDetail, undefined, 2))

        if (req_delay > 0) await delay(req_delay)
      }
    }
  }
}

export async function process(
  dn_output: string,
  {
    setImages: doDownloadSetImages = true,
    cards: doDownloadCards = true,
    cardDetails: doDownloadCardDetails = true,
    cardImages: doDownloadCardImages = true,
    onlyMainExpansion = true,
    force_refresh = false,
    req_delay = 100,
  }: {
    setImages?: boolean
    cards?: boolean
    cardDetails?: boolean
    cardImages?: boolean
    onlyMainExpansion?: boolean
    force_refresh?: boolean
    req_delay?: number
  } = {},
) {
  // simulate user navigation

  // [1] visit web page
  const [urlCards] = await _download_start()

  // [1.a] trigger JSON XHR request to fetch sets
  console.log('[*] Fetch products/sets data...')
  const products = await _download_product_list(urlCards)

  // write set info (complete)
  await writeFile(pathJoin(dn_output, 'sets.json'), JSON.stringify(products, undefined, 2))

  // filter sets (main-expansion)
  const sets = onlyMainExpansion ? products.filter((set) => set.mainExpansion) : products

  // write set images/logos
  if (doDownloadSetImages) {
    console.log('[*] Downloading product/set images ...')

    const pathSetImages = pathJoin(dn_output, 'images')
    await mkdir(pathSetImages, { recursive: true })

    await downloadSetImages(pathSetImages, urlCards, sets, force_refresh, req_delay)
  }

  if (doDownloadCards) {
    for (let set_idx = 0; set_idx < sets.length; set_idx++) {
      const set = sets[set_idx]

      const pathSetCards = pathJoin(dn_output, 'sets', set.setId)
      await mkdir(pathSetCards, { recursive: true })

      await processSetCards(pathSetCards, urlCards, set, {
        cardDetails: doDownloadCardDetails,
        cardImages: doDownloadCardImages,
        force_refresh,
        req_delay,
      })
    }
  }
}

mkdirSync(DN_OUTPUT, { recursive: true })

process(DN_OUTPUT, {
  // download set images
  setImages: true,
  // download card list / set brief
  cards: true,
  // download card details
  cardDetails: true,
  // but do not download card images
  cardImages: false,
  // restrict to main expansions only
  onlyMainExpansion: true,
  // try to use existing data (already written to disk) (but always refresh set list and card lists)
  force_refresh: false,
  // be nice
  req_delay: 345,
})

// -------------------------------------------------------------------------
