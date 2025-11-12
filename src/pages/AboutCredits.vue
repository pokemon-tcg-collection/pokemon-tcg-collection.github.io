<script setup lang="ts"></script>

<template>
  <h1 class="mb-5">Credits</h1>

  <h2 class="mb-2">
    <v-avatar image="/service-logos/pokeapi_logo.png" rounded="0" start></v-avatar> PokéAPI
  </h2>
  <p class="mb-1">
    We use the list of Pokémons and sprites from the
    <a href="https://pokeapi.co/">PokéAPI</a> project to show images in the Cards editor.
  </p>
  <p class="mb-1">Links:</p>
  <ul>
    <li>
      Sprite Data: <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/sprites">PokeAPI/sprites</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt">CC0 1.0 Universal</a>
    </li>
    <li>
      Metadata: <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/pokeapi">PokeAPI/pokeapi</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md">License</a>
    </li>
  </ul>

  <h2 class="mt-5 mb-2">
    <v-avatar image="/service-logos/tcgdex.svg" rounded="0" start></v-avatar> TCGdex
  </h2>
  <p class="mb-1">
    We use the awesome <a href="https://tcgdex.dev/">TCGdex</a> project to retrieve information
    about series, sets and card information.
  </p>
  <p class="mb-1">Links:</p>
  <ul>
    <li>
      TypeScript SDK: <v-icon icon="mdi-github" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/tcgdex/javascript-sdk">tcgdex/javascript-sdk</a>,
      <v-icon icon="mdi-license" class="icon-in-text" size="small"></v-icon>
      <a href="https://github.com/tcgdex/javascript-sdk/blob/master/LICENSE.md">MIT</a>
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
