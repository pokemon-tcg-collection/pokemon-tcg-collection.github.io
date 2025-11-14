import { computed } from 'vue'

import type { CostUnits } from '@/model/interfaces'
import { useTransactionsStore } from '@/stores/transactions'

function costToEUR(cost: number, cost_unit: CostUnits) {
  // TODO: implement currency conversion
  if (cost_unit !== 'EUR') {
    console.warn('Non-EUR currency. Conversion required')
    return 0
  }
  return cost
}

export default function useTransactionsStats() {
  const transactionsStore = useTransactionsStore()

  const costs = computed(() =>
    Array.from(transactionsStore.transactions.values()).map(
      (transaction) =>
        costToEUR(transaction.cost, transaction.cost_unit) * (transaction.type === 'buy' ? -1 : 1),
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

  return { costs, numTransactions, sumSpent, sumEarned, sumTotal }
}
