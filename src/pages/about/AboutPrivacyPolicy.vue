<script setup lang="ts">
const gitRepoUrl = import.meta.env.GIT_INFO_REPOSITORY
</script>

<template>
  <h1 class="mb-5">Privacy Policy</h1>

  <p class="mb-1">
    Your privacy is important to us. It is Pokémon TCG Collection's policy to respect your privacy
    and comply with any applicable law and regulation regarding any personal information we may
    collect about you, including across our website,
    <a href="https://pokemon-tcg-collection.github.io/">https://pokemon-tcg-collection.github.io/</a
    >, and other sites we own and operate.
  </p>
  <p class="mb-1">
    The <a href="https://pokemon-tcg-collection.github.io/">Pokémon TCG Collection</a> web
    application is hosted by <v-icon icon="mdi-github" class="icon-in-text" size="small" /><a
      href="https://pages.github.com/"
      >GitHub Pages</a
    >
    which collects visitor's IP addresses according to their
    <v-icon icon="mdi-github" class="icon-in-text" size="small" /><a
      href="https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection"
      >documentation page</a
    >.
  </p>
  <p class="mb-1" v-if="gitRepoUrl">
    The source code of this web application is available on
    <v-icon icon="mdi-github" class="icon-in-text" size="small" /><a :href="gitRepoUrl">GitHub</a>
    which allows anyone to inspect what third-party services are integrated and how they are used as
    well as how user data is handled.
  </p>
  <p class="mb-1">
    This web application does not store any other data on other servers. All the data users create
    and edit is stored in the users' web browsers.
  </p>
</template>

<style lang="css" scoped>
.icon-in-text {
  vertical-align: text-bottom;
  margin-inline-start: 0.3rem;
  margin-inline-end: 0.3rem;
}
</style>
