<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(false)
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

    <v-main class="d-flex">
      <v-container>
        <router-view />
      </v-container>
    </v-main>

    <v-footer name="footer" app
      ><div class="flex-1-0-100 text-center">© {{ new Date().getFullYear() }}</div></v-footer
    >
  </v-app>
</template>

<style scoped></style>
