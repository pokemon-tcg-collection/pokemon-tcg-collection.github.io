<script setup lang="ts"></script>

<template>
  <h1>Cards Overview</h1>
  <v-row>
    <v-col cols="4">
      <v-card height="200" class="d-flex flex-column">
        <v-card-title>Card List</v-card-title>
        <v-spacer></v-spacer>
        <v-card-actions>
          <v-btn :to="{ name: 'card-list' }">Go to Card List</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="4">
      <v-card height="200" class="d-flex flex-column">
        <v-card-title>New Card</v-card-title>
        <v-spacer></v-spacer>
        <v-card-actions>
          <v-btn :to="{ name: 'card-new', params: { id: undefined, returnTo: undefined } }"
            >Add a new Card</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
