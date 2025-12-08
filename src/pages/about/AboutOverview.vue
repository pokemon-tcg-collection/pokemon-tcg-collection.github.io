<script setup lang="ts">
import { RouterLink } from 'vue-router'

import OverviewLinkCard from '@/components/OverviewLinkCard.vue'
import OverviewLinkCardContainer from '@/components/OverviewLinkCardContainer.vue'

const version = import.meta.env.PACKAGE_VERSION
const gitRepoUrl = import.meta.env.GIT_INFO_REPOSITORY
const gitInfoSha = import.meta.env.GIT_INFO_SHA
const gitInfoDate = import.meta.env.GIT_INFO_DATE
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
    <abbr title="Progressive Web App">PWA</abbr> for offline use (almost, some API might require a
    internet connection to download images etc.).
  </p>
  <p>
    All the recorded data is only stored on the client (i.e. your web browser), so using the
    <RouterLink :to="{ name: 'database' }">import/export database</RouterLink> feature for backups
    is important!
  </p>

  <h2 class="mt-5 mb-3">Source Code</h2>
  <p>
    The application version is <code>{{ version }}</code
    >. Commit: <code>{{ gitInfoSha }}</code> ({{ new Date(gitInfoDate).toLocaleString() }}).
  </p>
  <p v-if="gitRepoUrl">
    The source code is available on
    <v-icon icon="mdi-github" class="icon-in-text" size="small" /><a :href="gitRepoUrl">GitHub</a>.
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

    <OverviewLinkCard
      icon="mdi-shield-account"
      title="Privacy Policy"
      :to="{ name: 'privacy' }"
      to-label="See privacy statement"
    >
      What data do we collect about you?
    </OverviewLinkCard>

    <OverviewLinkCard
      icon="mdi-bug"
      title="Debug Information"
      :to="{ name: 'debug' }"
      to-label="See dependencies"
    >
      Only for development or bug hunts<br />🐌 🐞 🦠 🕷️ 🕸️ 🐜 🪰 🐛
    </OverviewLinkCard>
  </OverviewLinkCardContainer>
</template>

<style lang="css" scoped>
p {
  margin-block-end: 0.5rem;
}
.icon-in-text {
  vertical-align: text-bottom;
  margin-inline-start: 0.3rem;
  margin-inline-end: 0.3rem;
}
</style>
