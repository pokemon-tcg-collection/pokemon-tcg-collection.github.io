<script setup lang="ts">
import { useNetwork } from '@vueuse/core'
import { computed, ref } from 'vue'
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

import useMultipleInstanceDetection from '@/composables/useMultipleInstanceDetection'
import usePWA from '@/composables/usePWA'
import { useWorkInProgressStore } from '@/stores/workInProgress'

const { xs } = useDisplay()
const { isSupported: isNetworkSupported, isOnline } = useNetwork()
const { isInstalled, canBeInstalled, promptInstall } = usePWA({ blockAutomaticPrompt: true })

const { instanceId, mainInstanceId, otherInstanceIds, isMainInstance } =
  useMultipleInstanceDetection({ key: 'pokemon-tcg-collection:multiple-instance-detection' })

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
      .filter((route) => !!route.meta.breadcrumb_name as unknown as string)
      .map((route) => ({
        to: { path: route.path },
        title: (route.meta.breadcrumb_name as unknown as string) ?? route.name ?? '?',
      })),
  ),
)
</script>

<template>
  <v-app>
    <v-app-bar name="app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Pokémon TCG Collection</v-app-bar-title>
      <template #append>
        <v-btn
          v-if="canBeInstalled || isInstalled"
          :readonly="isInstalled"
          :icon="isInstalled ? 'mdi-view-grid' : 'mdi-view-grid-plus'"
          @click="promptInstall"
        ></v-btn>
        <v-icon
          v-if="isNetworkSupported"
          :icon="isOnline ? 'mdi-wifi' : 'mdi-wifi-off'"
          class="mx-3"
        ></v-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer name="drawer" v-model="drawer" temporary>
      <v-list class="fill-height overflow-auto d-flex flex-column" open-strategy="single" nav>
        <v-list-item link title="Home" :to="{ name: 'home' }"></v-list-item>
        <v-list-item link title="Cards" :to="{ name: 'cards' }"></v-list-item>
        <v-list-item link title="Transactions" :to="{ name: 'transactions' }"></v-list-item>
        <v-spacer></v-spacer>
        <v-list-group value="Management" nav>
          <template #activator="{ props }">
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
        <v-list-group value="About" class="mb-3" nav>
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="About"></v-list-item>
          </template>
          <v-list-item link title="About this App" :to="{ name: 'about' }"></v-list-item>
          <v-list-item link title="Credits" :to="{ name: 'credits' }"></v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <v-alert
          v-if="otherInstanceIds.length > 0 || !isMainInstance"
          title="Multiple active tabs/windows detected!"
          type="warning"
          class="mb-4"
          closable
          :data-self-id="`${instanceId}`"
          :data-main-id="`${mainInstanceId}`"
          :data-other-ids="`${otherInstanceIds.join('|')}`"
        >
          <template #text>
            <p class="my-1">
              Multiple instances of this application have been detected. This application does not
              reliably work with multiple instances as (parallel) database modifications may not
              synchronize correctly and data loss may occur. Any editing should only be performed in
              the main window/tab/application. Data can also be stale if editing happened in another
              tab. To be sure, please refresh the page (F5) before doing any editing, so that a
              fresh copy may be fetched from the database.
            </p>
            <p class="mt-1 mb-0">
              This is <strong v-if="!isMainInstance">not</strong> the
              <strong>main</strong> instance.
              <template v-if="otherInstanceIds.length == 1">There is one other instance.</template>
              <template v-else-if="otherInstanceIds.length >= 2"
                >There are {{ otherInstanceIds.length }} other active instances.</template
              >
            </p>
          </template>
        </v-alert>

        <v-breadcrumbs :items="breadcrumbs" v-if="breadcrumbs.length > 1">
          <template #divider
            ><v-icon icon="mdi-pokeball"></v-icon><span class="d-sr-only">/</span></template
          >
        </v-breadcrumbs>
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath"></component>
        </router-view>
      </v-container>
    </v-main>

    <v-footer name="footer" class="flex-1-0-0 align-end px-0 pb-0">
      <div class="flex-1-0-100 text-center text-body-small bg-grey-lighten-4 py-1">
        <template v-if="gitRepoUrl">
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
        </template>
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

<style lang="css" scoped>
.v-theme--dark .text-grey-darken-2 {
  color: #e0e0e0 !important; /* grey-lighten-2 */
}
.v-theme--dark .bg-grey-lighten-4 {
  color: unset !important;
  background-color: unset !important;
}
</style>
