<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()
</script>

<template>
  <h1 class="mb-5">Transactions</h1>

  <v-container v-if="!mdAndUp" class="ga-5 d-flex flex-row">
    <v-card
      :to="{ name: 'transaction-list' }"
      class="d-flex flex-column justify-center align-center py-4 px-6"
    >
      <v-card-title>Transaction List</v-card-title>
      <v-card-text class="mt-3 mb-5">
        <v-sheet class="d-flex justify-center align-center pa-3" :elevation="1" border rounded>
          <v-icon icon="mdi-invoice-list" :style="{ '--v-icon-size-multiplier': 3 }"></v-icon>
        </v-sheet>
      </v-card-text>
    </v-card>
    <v-card
      :to="{ name: 'transaction-new' }"
      class="d-flex flex-column justify-center align-center py-4 px-6"
    >
      <v-card-title>New Transaction</v-card-title>
      <v-card-text class="mt-3 mb-5">
        <v-sheet class="d-flex justify-center align-center pa-3" :elevation="1" border rounded>
          <v-icon icon="mdi-pencil-plus" :style="{ '--v-icon-size-multiplier': 3 }"></v-icon>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-container>

  <v-row v-else>
    <v-col cols="4" class="d-flex flex-column">
      <v-card
        prepend-icon="mdi-invoice-list"
        title="Transaction List"
        class="flex-grow-1 d-flex flex-column"
      >
        <v-card-text class="bg-surface-light pt-4 flex-grow-1">
          The list of your transactions.
        </v-card-text>
        <v-card-actions
          ><v-btn :to="{ name: 'transaction-list' }">See Transactions list</v-btn></v-card-actions
        >
      </v-card>
    </v-col>
    <v-col cols="4" class="d-flex flex-column">
      <v-card
        prepend-icon="mdi-pencil-plus"
        title="New Transaction"
        class="flex-grow-1 d-flex flex-column"
      >
        <v-card-text class="bg-surface-light pt-4 flex-grow-1">
          Add a new transaction.
        </v-card-text>
        <v-card-actions
          ><v-btn :to="{ name: 'transaction-new' }">Add a new Transaction</v-btn></v-card-actions
        >
      </v-card>
    </v-col>
  </v-row>
</template>
