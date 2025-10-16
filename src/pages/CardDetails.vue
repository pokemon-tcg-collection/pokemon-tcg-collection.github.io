<script setup lang="ts">
import type { SupportedLanguages, Card as TCGCard } from '@tcgdex/sdk'
import TCGdex from '@tcgdex/sdk'
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'

import { TCGDEX_LANGUAGES } from '@/model/interfaces'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()

const route = useRoute()

const cardIdFromParam = route.params.id as string
const card = cardsStore.get(cardIdFromParam)!

const language = 'en' // TODO
const tcgdex = computed(() => {
  const tcgdex_language = TCGDEX_LANGUAGES.includes(language) ? language : 'en'
  const tcgdex = new TCGdex(tcgdex_language as SupportedLanguages)
  console.debug('Creating new TCGDex API adapter', tcgdex)
  Object.assign(window, { tcgdex })
  return tcgdex
})

type TCGCardWithPricing = TCGCard & {
  pricing?: {
    cardmarket?: {
      avg: number
      unit: string
      updated: Date | string
    }
    tcgplayer?: {
      'unlimited-holofoil'?: {
        marketPrice: number
      }
      unit: string
      updated: Date | string
    }
  }
}

const cardInfo = ref<TCGCardWithPricing | undefined>(undefined)
const imageUrl = ref<string | undefined>(undefined)

onBeforeRouteUpdate((to, from) => {
  console.debug('onBeforeRouteUpdate', { to, from }) // TODO
})

onMounted(async () => {
  console.debug('Loading card info')

  if (card === undefined) return
  if (card.tcgdex_id === undefined) return

  const info = await tcgdex.value.card.get(card.tcgdex_id)
  console.log('card', info)

  if (info === null) return

  cardInfo.value = info
  imageUrl.value = info.getImageURL('high', 'png')
})
</script>

<template>
  <h1 class="mb-3">{{ card.name }}</h1>
  <v-row>
    <v-col sm="12" md="6" v-if="imageUrl">
      <v-card border>
        <v-card-text>
          <v-img :src="imageUrl" min-width="5rem"></v-img>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col sm="12" md="6" class="d-flex flex-column ga-3">
      <v-card border>
        <v-card-title>{{ card.name }}</v-card-title>
        <v-card-subtitle v-if="cardInfo"
          >{{ cardInfo.set.name }} {{ cardInfo.localId }}/{{
            cardInfo.set.cardCount.official
          }}</v-card-subtitle
        >
        <v-card-text>
          <p class="font-weight-black">Collection</p>
          <p>Amount: {{ card.amount }}</p>
        </v-card-text>
        <v-card-text>
          <p class="font-weight-black">Internals</p>
          <p>ID: {{ card.id }}</p>
          <p v-if="cardInfo">TCGDex Card ID: {{ cardInfo?.id }}</p>
        </v-card-text>
      </v-card>
      <v-card border v-if="cardInfo && Object.hasOwn(cardInfo, 'pricing') && cardInfo.pricing">
        <v-card-title>Pricing</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th scope="col">Marketplace</th>
                <th scope="col">Price (Avg)</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="cardInfo.pricing.cardmarket">
                <td scope="row">CardMarket</td>
                <td class="font-weight-bold">
                  {{ cardInfo.pricing.cardmarket.avg }} {{ cardInfo.pricing.cardmarket.unit }}
                </td>
                <td class="text-medium-emphasis font-italic">
                  {{ new Date(cardInfo.pricing.cardmarket.updated).toLocaleString() }}
                </td>
              </tr>
              <tr
                v-if="
                  cardInfo.pricing.tcgplayer && cardInfo.pricing.tcgplayer['unlimited-holofoil']
                "
              >
                <td scope="row">TCGPlayer</td>
                <td class="font-weight-bold">
                  {{ cardInfo.pricing.tcgplayer['unlimited-holofoil'].marketPrice }}
                  {{ cardInfo.pricing.tcgplayer.unit }}
                </td>
                <td class="text-medium-emphasis font-italic">
                  {{ new Date(cardInfo.pricing.tcgplayer.updated).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style lang="css" scoped>
.v-card-text:has(> p):has(+ .v-card-text > p) {
  padding-block-end: 0;
}
</style>
