<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
console.log('router', router)
const route = useRoute()
console.log('route', route)

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
</script>

<template>
  <v-app>
    <v-app-bar name="app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Pokémon TCG Collector</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer name="drawer" v-model="drawer" temporary>
      <v-list class="fill-height d-flex flex-column">
        <v-list-item link title="Home" :to="{ name: 'home' }"></v-list-item>
        <v-list-item link title="Cards" :to="{ name: 'cards' }"></v-list-item>
        <v-list-item link title="Transactions" :to="{ name: 'transactions' }"></v-list-item>
        <v-spacer></v-spacer>
        <v-list-item link title="Settings" :to="{ name: 'settings' }" class="mb-3"></v-list-item>
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

    <v-footer name="footer" app
      ><div class="flex-1-0-100 text-center">© {{ new Date().getFullYear() }}</div></v-footer
    >
  </v-app>
</template>

<style scoped></style>
