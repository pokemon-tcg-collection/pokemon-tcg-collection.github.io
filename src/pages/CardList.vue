<script setup lang="ts"></script>

<template>
  <h1>Card List</h1>
  <v-row>
    <v-col v-for="n in 24" :key="n" cols="3">
      <v-card height="200" class="d-flex flex-column">
        <v-card-title>Card {{ n }}</v-card-title>
        <v-spacer></v-spacer>
        <v-card-actions>
          <v-btn :to="{ name: 'card', params: { id: n } }">Card Details</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
