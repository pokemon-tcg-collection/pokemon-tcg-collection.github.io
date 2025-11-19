<script setup lang="ts"></script>

<template>
  <h1 class="mb-5">Credits</h1>

  <h2 class="mb-3">Pokémon Metadata and Images</h2>

  <h3 class="mb-2">
    <v-avatar image="/service-logos/pokeapi_logo.png" rounded="0" start></v-avatar> PokéAPI
  </h3>
  <p class="mb-1">
    We use the list of Pokémons and sprites from the
    <a href="https://pokeapi.co/">PokéAPI</a> project to show images in the Cards editor.
  </p>
  <p class="mb-1">Links:</p>
  <ul>
    <li>
      Sprite Data (Pokémon API):
      <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/sprites">PokeAPI/sprites</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt">CC0 1.0 Universal</a>
    </li>
    <li>
      Metadata (Pokémon API): <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/pokeapi">PokeAPI/pokeapi</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md">License</a>
    </li>
  </ul>

  <h3 class="mt-5 mb-2">
    <v-avatar image="/service-logos/tcgdex_logo.svg" rounded="0" start></v-avatar> TCGdex
  </h3>
  <p class="mb-1">
    We use the awesome <a href="https://tcgdex.dev/">TCGdex</a> project to retrieve information
    about series, sets and card information.
  </p>
  <p class="mb-1">Links:</p>
  <ul>
    <li>
      Pokémon Trading Card Game Card (TCG) Database:
      <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/tcgdex/cards-database">tcgdex/cards-database</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/tcgdex/cards-database/blob/master/LICENSE">MIT License</a>
    </li>
  </ul>

  <h3 class="mt-5 mb-2">
    <v-avatar image="/service-logos/bulbapedia_logo.png" rounded="0" start></v-avatar> Bulbapedia
  </h3>
  <p class="mb-1">
    We use data from the
    <a href="https://bulbapedia.bulbagarden.net/wiki/Main_Page">Bulbapedia</a> wiki project for
    information about series and sets of
    <a href="https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon">Pokémon</a>
    &nbsp;<a href="https://bulbapedia.bulbagarden.net/wiki/Browse:Trading_Card_Game">TCG cards</a>.
  </p>
  <p class="mb-1">Links:</p>
  <ul>
    <li>
      English Sets:
      <v-icon icon="mdi-wikipedia" class="icon-in-text" size="small"></v-icon>
      <a href="https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_Trading_Card_Game_expansions"
        >List of Pokémon Trading Card Game expansions</a
      >
    </li>
    <li>
      Japanese Sets:
      <v-icon icon="mdi-wikipedia" class="icon-in-text" size="small"></v-icon>
      <a
        href="https://bulbapedia.bulbagarden.net/wiki/List_of_Japanese_Pokémon_Trading_Card_Game_expansions"
        >List of Japanese Pokémon Trading Card Game expansions</a
      >
    </li>
    <li>
      License (in page metadata):
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://creativecommons.org/licenses/by-nc-sa/2.5/"
        >https://creativecommons.org/licenses/by-nc-sa/2.5/</a
      >
    </li>
  </ul>

  <h2 class="mt-5 mb-2">Web Technologies</h2>

  <ul>
    <li>
      Vue.js: <v-icon icon="mdi-vuejs" class="icon-in-text" size="small"></v-icon>
      <a href="https://vuejs.org/">https://vuejs.org/</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/vuejs/core/blob/main/LICENSE">MIT License</a>
    </li>
    <li>
      Vue Router: <v-icon icon="mdi-vuejs" class="icon-in-text" size="small"></v-icon>
      <a href="https://router.vuejs.org/">https://router.vuejs.org/</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/vuejs/router/blob/main/LICENSE">MIT License</a>
    </li>
    <li>
      Pinia: <v-icon icon="mdi-vuejs" class="icon-in-text" size="small"></v-icon>
      <a href="https://pinia.vuejs.org/">https://pinia.vuejs.org/</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/vuejs/pinia/blob/v3/LICENSE">MIT License</a>
    </li>
    <li>
      Vuetify: <v-icon icon="$vuetify" class="icon-in-text" size="small"></v-icon>
      <a href="https://vuetifyjs.com/">https://vuetifyjs.com/</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://vuetifyjs.com/en/about/licensing/">MIT License</a>
    </li>
  </ul>
  <ul class="mt-2">
    <li>
      idb (IndexedDB):
      <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/jakearchibald/idb">jakearchibald/idb</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/jakearchibald/idb/blob/main/LICENSE">ISC License</a>
    </li>
    <li>
      uuid:
      <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/uuidjs/uuid">uuidjs/uuid</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/uuidjs/uuid/blob/main/LICENSE.md">MIT License</a>
    </li>
    <li>
      VueUse: <v-icon icon="mdi-web" class="icon-in-text" size="small"></v-icon>
      <a href="https://vueuse.org/">https://vueuse.org/</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/vueuse/vueuse/blob/main/LICENSE">MIT License</a>
    </li>
    <li>
      zip.js:
      <v-icon icon="mdi-web" class="icon-in-text" size="small"></v-icon>
      <a href="https://gildas-lormeau.github.io/zip.js/">https://gildas-lormeau.github.io/zip.js/</a
      >,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/gildas-lormeau/zip.js/blob/master/LICENSE"
        >BSD 3-Clause License</a
      >
    </li>
  </ul>

  <h2 class="mt-5 mb-2">Images, Fonts and other Assets</h2>

  <ul>
    <li>
      Roboto:
      <v-icon icon="mdi-format-font" class="icon-in-text" size="small"></v-icon>
      <a href="https://fontsource.org/fonts/roboto">fontsource/roboto</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/fontsource/font-files/blob/main/fonts/google/roboto/LICENSE"
        >SIL OPEN FONT LICENSE Version 1.1</a
      >
    </li>
    <li>
      Material Design Icons:
      <v-icon icon="mdi-view-gallery" class="icon-in-text" size="small"></v-icon>
      <a href="https://pictogrammers.com/library/mdi/">https://pictogrammers.com/library/mdi/</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://pictogrammers.com/docs/general/license/">Apache License 2.0</a>
    </li>
  </ul>
</template>

<style lang="css" scoped>
ul {
  padding-inline-start: 2rem;
}
.icon-in-text {
  vertical-align: text-bottom;
  margin-inline-start: 0.3rem;
  margin-inline-end: 0.3rem;
}
</style>
