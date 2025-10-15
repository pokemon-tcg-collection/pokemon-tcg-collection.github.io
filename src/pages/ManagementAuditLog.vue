<script setup lang="ts">
import { useAuditLogStore } from '@/stores/auditLog'

const auditLogStore = useAuditLogStore()
</script>

<template>
  <h1 class="mb-3">Audit Log</h1>

  <p class="mb-3">{{ auditLogStore.logs.length }} entries</p>
  <v-table v-if="auditLogStore.logs.length > 0">
    <thead>
      <tr>
        <th scope="col">Date</th>
        <th scope="col">Message</th>
        <th scope="col">URL Route</th>
        <th scope="col">Extra Params</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(entry, i) in auditLogStore.logs" :key="i">
        <td scope="row">{{ entry.date.toLocaleString() }}</td>
        <td>{{ entry.msg }}</td>
        <td>{{ entry.path }}</td>
        <td v-if="!!entry.params">{{ JSON.stringify(entry.params).length }} B</td>
        <td v-else>–</td>
      </tr>
    </tbody>
  </v-table>
</template>
