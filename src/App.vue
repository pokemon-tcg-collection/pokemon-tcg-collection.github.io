<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

import { useWorkInProgressStore } from '@/stores/workInProgress'

const { xs } = useDisplay()

const wipStore = useWorkInProgressStore()

const route = useRoute()
console.debug('route', route)

const version = import.meta.env.PACKAGE_VERSION
const gitRepoUrl = import.meta.env.GIT_INFO_REPOSITORY
const gitInfoSha = import.meta.env.GIT_INFO_SHA
const gitInfoDate = import.meta.env.GIT_INFO_DATE

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
          <v-list-item v-if="wipStore.objects.size > 0" link :to="{ name: 'wip' }">
            <v-badge floating location="right center" :offset-x="-10" color="warning" dot>
              <v-list-item-title>Draft objects</v-list-item-title>
            </v-badge>
          </v-list-item>
          <v-list-item link title="Settings" :to="{ name: 'settings' }"></v-list-item>
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

    <v-footer name="footer" class="flex-1-0-0 align-end px-0 pb-0">
      <div class="flex-1-0-100 text-center text-caption bg-grey-lighten-4 py-1">
        <v-icon icon="mdi-source-repository" size="small" />
        <v-btn
          variant="text"
          target="_blank"
          :href="gitRepoUrl"
          text="Source Code"
          size="x-small"
          color="primary"
        >
        </v-btn>
        <v-icon icon="mdi-tag" size="small"></v-icon>
        Version
        <span class="text-grey-darken-2 text-no-wrap">
          {{ version }}
        </span>
        <span v-if="gitInfoSha && gitInfoDate && !xs">
          (<span class="text-grey-darken-2"
            >{{ gitInfoSha }}, {{ new Date(gitInfoDate).toLocaleString() }}</span
          >)</span
        >
        <span class="ms-5 text-no-wrap">© {{ new Date().getFullYear() }}</span>
      </div>
    </v-footer>
  </v-app>
</template>

<style scoped></style>
