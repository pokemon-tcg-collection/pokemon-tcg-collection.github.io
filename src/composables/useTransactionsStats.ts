import { computed } from 'vue'

import type { CostUnits } from '@/model/interfaces'
import { useCurrencyStore } from '@/stores/currency'
import { useTransactionsStore } from '@/stores/transactions'

export default function useTransactionsStats() {
  const transactionsStore = useTransactionsStore()
  const currencies = useCurrencyStore()

  function convertCost(cost: number, cost_unit: CostUnits) {
    const converted = currencies.convert(cost, cost_unit)
    if (converted === undefined) {
      console.warn('Unable to convert currency', { cost, cost_unit })
      return 0 // TODO: what is a good fallback?
    }
    return converted
  }

  const unit = computed<CostUnits>(() => currencies.baseCurrency)

  const costs = computed(() =>
    Array.from(transactionsStore.transactions.values()).map(
      (transaction) =>
        convertCost(transaction.cost, transaction.cost_unit) *
        (transaction.type === 'buy' ? -1 : 1),
    ),
  )

  const numTransactions = computed(() => transactionsStore.transactions.size)

  const sumSpent = computed(() =>
    costs.value.filter((cost) => cost < 0).reduce((sum, cost) => sum + cost, 0),
  )
  const sumEarned = computed(() =>
    costs.value.filter((cost) => cost > 0).reduce((sum, cost) => sum + cost, 0),
  )
  const sumTotal = computed(() => sumEarned.value + sumSpent.value)

  return { costs, numTransactions, sumSpent, sumEarned, sumTotal, unit }
}
