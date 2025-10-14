<script setup lang="ts">
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import { ref, toRaw } from 'vue'

import type { Transaction } from '@/model/interfaces'

const router = useRouter()
console.log('router', router)
const route = useRoute()
console.log('route', route)

const transactionIdFromParam = route.params.id as string | undefined
const returnLocation = (
  route.query.returnTo !== undefined ? JSON.parse(route.query.returnTo as string) : undefined
) as string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric | undefined

const transaction = ref<Transaction>({
  id: uuidv4(),
  type: 'purchase',
  cost: 0,
  items: [],
})

function onSave() {
  console.log('Save Transaction', toRaw(transaction.value))

  if (returnLocation === undefined) {
    router.push({ name: 'transaction', params: { id: transaction.value.id } })
  } else {
    router.push(returnLocation)
  }
}
</script>

<template>
  <h1>Transaction Editor</h1>
  <v-btn text="Save" @click="onSave"></v-btn>
</template>
