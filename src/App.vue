<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute } from 'vue-router'

import { useCardsStore } from '@/stores/cards'
import { useTransactionsStore } from '@/stores/transactions'
import { usePlacesStore } from './stores/places'

const route = useRoute()
console.debug('route', route)

const drawer = ref(false)

const breadcrumbs = computed(() =>
  (
    [{ to: { name: 'home' }, title: 'Home' }] as {
      to: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric | undefined
      title: string
    }[]
  ).concat(
    route.matched
      .filter(
        (route, idx, allRoutes) =>
          route.name !== 'home' &&
          (route.name !== undefined ||
            (allRoutes.length > idx + 1 && allRoutes[idx + 1]?.path !== route.path)),
      )
      .map((route) => ({
        to: { path: route.path },
        title: (route.meta.breadcrumb_name as unknown as string) ?? route.name ?? 'a',
      })),
  ),
)

onMounted(() => {
  const cardsStore = useCardsStore()
  const transactionsStore = useTransactionsStore()
  const placesStore = usePlacesStore()

  // TODO: mock data
  cardsStore.add({
    id: 'd68d1ba7-52e9-4c3b-a134-787f40f8823d',
    language: 'en',
    name: 'Dark Charizard',
    number: '4',
    set: 'base5',
    amount: 5,
    tcgdex_id: 'base5-4',
  })
  cardsStore.add({
    id: 'f12475de-024c-457a-9d3d-dee8c86f4468',
    language: 'de',
    name: 'Pikachu',
    number: '11 12',
    set: '',
    amount: 2,
  })

  transactionsStore.add({
    id: '123',
    type: 'purchase',
    cost: 100,
    cost_unit: 'EUR',
    cost_type: 'buy',
  })
  transactionsStore.add({
    id: '456',
    name: 'Sold my best holo :-(',
    type: 'sale',
    cost: 400,
    cost_unit: 'EUR',
    cost_type: 'sell',
  })
  transactionsStore.add({
    id: '789',
    name: 'Happi happi happi ...',
    type: 'gift',
    cost: 0,
    cost_unit: 'EUR',
    date: new Date(),
  })

  placesStore.add({
    id: '72864d29-48df-4004-b864-fa675ba92832',
    type: 'local',
    name: 'Gate to the Games',
    url: 'https://www.gate-to-the-games.de/',
    address:
      'Richard-Wagner-Straße 9\nObjekt am Hallischen Tor 1\nBrühl 33\n04109 Leipzig\n\nTelefon: 0341 / 91025937\nE-Mail: leipzig@gate-to-the-games.de',
  })
})
</script>

<template>
  <v-app>
    <v-app-bar name="app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Pokémon TCG Collector</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer name="drawer" v-model="drawer" temporary>
      <v-list class="fill-height d-flex flex-column" nav>
        <v-list-item link title="Home" :to="{ name: 'home' }"></v-list-item>
        <v-list-item link title="Cards" :to="{ name: 'cards' }"></v-list-item>
        <v-list-item link title="Transactions" :to="{ name: 'transactions' }"></v-list-item>
        <v-spacer></v-spacer>
        <v-list-group value="Management" class="mb-3" nav>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Management"></v-list-item>
          </template>
          <v-list-item link title="Overview" :to="{ name: 'management' }"></v-list-item>
          <v-list-item link title="Database" :to="{ name: 'database' }"></v-list-item>
          <v-list-item link title="TCGDex API" :to="{ name: 'tcgdex' }"></v-list-item>
          <v-list-item link title="Audit Log" :to="{ name: 'audit' }"></v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <v-breadcrumbs :items="breadcrumbs" v-if="breadcrumbs.length > 1">
          <template v-slot:divider
            ><v-icon icon="mdi-pokeball"></v-icon><span class="d-sr-only">/</span></template
          >
        </v-breadcrumbs>
        <router-view />
      </v-container>
    </v-main>

    <v-footer name="footer" class="flex-1-0-0 align-end">
      <div class="flex-1-0-100 text-center">© {{ new Date().getFullYear() }}</div>
    </v-footer>
  </v-app>
</template>

<style scoped></style>
