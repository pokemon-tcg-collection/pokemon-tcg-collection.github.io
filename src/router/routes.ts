import type { RouteRecordRaw } from 'vue-router'

import Card from '@/pages/Card.vue'
import Cards from '@/pages/Cards.vue'
import Home from '@/pages/Home.vue'
import Transaction from '@/pages/Transaction.vue'
import Transactions from '@/pages/Transactions.vue'
import Settings from '@/pages/Settings.vue'

export default [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/cards',
    children: [
      { path: '', name: 'cards', component: Cards },
      { path: ':id', name: 'card', component: Card },
    ],
  },
  {
    path: '/transactions',
    children: [
      { path: '', name: 'transactions', component: Transactions },
      { path: ':id', name: 'transaction', component: Transaction },
    ],
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
  },
] satisfies RouteRecordRaw[]
