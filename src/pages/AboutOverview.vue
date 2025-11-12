<script setup lang="ts">
import { RouterLink } from 'vue-router'

import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'
</script>

<template>
  <h1 class="mb-5">About</h1>

  <h2 class="mb-3">What is this?</h2>
  <p>
    This website is a small webapp around the
    <a href="https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Trading_Card_Game"
      >Pokémon Trading Card Game (TCG)</a
    >. It allows to keep track of
    <RouterLink :to="{ name: 'transactions' }">transactions</RouterLink> (with places, items and the
    actual transaction details) and
    <RouterLink :to="{ name: 'cards' }">card collections</RouterLink> (with card counts and
    metadata).
  </p>
  <p>
    This website should also be installable as a
    <abbrev title="Progressive Web App">PWA</abbrev> for offline use (almost, some API might require
    a internet connection to download images etc.).
  </p>
  <p>
    All the recorded data is only stored on the client (i.e. your web browser), so using the
    <RouterLink :to="{ name: 'database' }">import/export database</RouterLink> feature for backups
    is important!
  </p>

  <v-divider class="my-6"></v-divider>

  <OverviewLinkCardContainer>
    <OverviewLinkCard
      icon="mdi-copyright"
      title="Credits"
      :to="{ name: 'credits' }"
      to-label="See dependencies"
    >
      What is all included? Who gets the credit?
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>

<style lang="css" scoped>
p {
  margin-block-end: 0.5rem;
}
</style>
