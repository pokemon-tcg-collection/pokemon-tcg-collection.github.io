import type { RouteRecordRaw } from 'vue-router'

import CardDetails from '@/pages/CardDetails.vue'
import CardEditor from '@/pages/CardEditor.vue'
import CardList from '@/pages/CardList.vue'
import CardOverview from '@/pages/CardOverview.vue'
import Home from '@/pages/Home.vue'
import Settings from '@/pages/Settings.vue'
import Transaction from '@/pages/Transaction.vue'
import TransactionEditor from '@/pages/TransactionEditor.vue'
import TransactionList from '@/pages/TransactionList.vue'
import Transactions from '@/pages/Transactions.vue'

export type EditRouteNames = 'card-edit' | 'transaction-edit'

export default [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/cards',
    meta: { breadcrumb_name: 'Cards' },
    children: [
      { path: '', name: 'cards', component: CardOverview, meta: { breadcrumb_name: 'Cards' } },
      {
        path: 'list',
        name: 'card-list',
        component: CardList,
        meta: { breadcrumb_name: 'Card List' },
      },
      {
        path: 'new',
        name: 'card-new',
        component: CardEditor,
      },
      {
        path: ':id/edit',
        name: 'card-edit',
        component: CardEditor,
      },
      {
        path: ':id',
        name: 'card',
        component: CardDetails,
        meta: { breadcrumb_name: 'Card Details' },
      },
    ],
  },
  {
    path: '/transactions',
    meta: { breadcrumb_name: 'Transactions' },
    children: [
      {
        path: '',
        name: 'transactions',
        component: Transactions,
        meta: { breadcrumb_name: 'Transactions' },
      },
      {
        path: 'list',
        name: 'transaction-list',
        component: TransactionList,
        meta: { breadcrumb_name: 'Transaction List' },
      },
      {
        path: 'new',
        name: 'transaction-new',
        component: TransactionEditor,
      },
      {
        path: ':id/edit',
        name: 'transaction-edit',
        component: TransactionEditor,
      },
      {
        path: ':id',
        name: 'transaction',
        component: Transaction,
        meta: { breadcrumb_name: 'Transaction Details' },
      },
    ],
  },
  {
    path: '/settings',
    meta: { breadcrumb_name: 'Settings' },
    children: [
      {
        path: '',
        name: 'settings',
        component: Settings,
        meta: { breadcrumb_name: 'Settings' },
      },
    ],
  },
] satisfies RouteRecordRaw[]
