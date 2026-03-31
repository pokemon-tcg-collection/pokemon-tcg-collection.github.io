import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, readonly, ref, watch } from 'vue'

import type { CostUnits } from '@/model/interfaces'
import { COST_UNITS } from '@/model/interfaces'

const REQUEST_URL_TEMPLATE =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{date}/{apiVersion}/{endpoint}'

interface CurrencyExchangeInformation {
  date: string
  eur?: { [currency: string]: number }
  usd?: { [currency: string]: number }
  jpy?: { [currency: string]: number }
  gbp?: { [currency: string]: number }
}

type CurrencyUpdateRequestDate = 'latest' | string

async function fetchData(
  base: CostUnits = 'EUR',
  date: string = 'latest',
  apiVersion: 'v1' = 'v1',
) {
  const baseCurrency = base.toLowerCase() as 'eur' | 'usd' | 'jpy' | 'gbp'
  const endpoint = `currencies/${baseCurrency}.json`
  const url = REQUEST_URL_TEMPLATE.replace('{date}', date)
    .replace('{apiVersion}', apiVersion)
    .replace('{endpoint}', endpoint)

  const resp = await fetch(url)
  const data: CurrencyExchangeInformation = await resp.json()

  const info = new Map<CostUnits, number>(
    COST_UNITS.map(
      (unit) => [unit.id as CostUnits, data[baseCurrency]?.[unit.id.toLowerCase()]] as const,
    ).filter(([, v]) => v !== undefined) as [CostUnits, number][],
  )
  console.debug('Currency info', { base, info })

  return { base, date: data.date, info }
}

export const useCurrencyStore = defineStore(
  'currency',
  () => {
    // -----------------------------------------------------------------------
    // state

    // need to be plain refs to be able to be serializable/restorable for persistence plugin
    const baseCurrency = ref<CostUnits>('EUR')
    const requestDate = ref<CurrencyUpdateRequestDate>('latest')

    const updateDate = ref<string | null>(null)
    const exchangeRates = ref<Map<CostUnits, number> | null>(null)

    // -----------------------------------------------------------------------
    // getter

    const dateIsLatest = computed(() => requestDate.value === 'latest')

    // -----------------------------------------------------------------------
    // actions

    function hasInfo(currency: CostUnits) {
      const rate = exchangeRates.value?.get(currency)
      return rate !== undefined
    }

    function convert(value: number, currency: CostUnits) {
      const rate = exchangeRates.value?.get(currency)
      if (rate === undefined) return undefined
      return value / rate
    }

    function _reset() {
      updateDate.value = null
      exchangeRates.value = null
    }

    async function refresh() {
      const {
        base,
        date: fetchedDate,
        info,
      } = await fetchData(baseCurrency.value, requestDate.value)
      if (base !== baseCurrency.value) {
        console.warn('Base currency is different from update data info! Do not update.', {
          baseCurrency,
          baseFromAPI: base,
        })
        return
      }

      updateDate.value = fetchedDate
      exchangeRates.value = info
    }

    async function change({
      base,
      date,
      update = false,
    }: { base?: CostUnits; date?: CurrencyUpdateRequestDate; update?: boolean } = {}) {
      if (base !== undefined) {
        baseCurrency.value = base
      }
      if (date !== undefined) {
        if (date === 'latest' || date === null) {
          date = 'latest'
        }
        requestDate.value = date
      }

      updateDate.value = null
      exchangeRates.value = null

      if (update) {
        await refresh()
      }
    }

    // -----------------------------------------------------------------------

    // TODO: does this need cleanup?

    watch(baseCurrency, (n, o) => {
      if (n !== o) _reset()
    })
    watch(requestDate, (n, o) => {
      if (n !== o) _reset()
    })

    // -----------------------------------------------------------------------

    return {
      // state
      baseCurrency,
      requestDate,
      // -- readonly state (will be lost after reload)
      updateDate: readonly(updateDate),
      exchangeRates: readonly(exchangeRates),
      // getter
      dateIsLatest: dateIsLatest,
      // actions
      hasInfo,
      convert,
      refresh,
      change,
    }
  },
  {
    // pinia-plugin-persistedstate
    persist: {
      afterHydrate: (ctx) => {
        console.debug('afterHydrate', ctx.store.$id)
        ctx.store.refresh()
      },
    },
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCurrencyStore, import.meta.hot))
}
