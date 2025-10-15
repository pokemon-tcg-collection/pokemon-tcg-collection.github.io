import type { RouteRecordRaw } from 'vue-router'

import CardDetails from '@/pages/CardDetails.vue'
import CardEditor from '@/pages/CardEditor.vue'
import CardList from '@/pages/CardList.vue'
import CardOverview from '@/pages/CardOverview.vue'
import Home from '@/pages/Home.vue'
import ManagementAuditLog from '@/pages/ManagementAuditLog.vue'
import ManagementDatabase from '@/pages/ManagementDatabase.vue'
import ManagementOverview from '@/pages/ManagementOverview.vue'
import ManagementTCGDex from '@/pages/ManagementTCGDex.vue'
import Transaction from '@/pages/Transaction.vue'
import TransactionEditor from '@/pages/TransactionEditor.vue'
import TransactionList from '@/pages/TransactionList.vue'
import TransactionOverview from '@/pages/TransactionOverview.vue'

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
    redirect: { name: 'cards' },
    children: [
      {
        path: 'overview',
        name: 'cards',
        component: CardOverview,
        meta: { breadcrumb_name: 'Cards' },
      },
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
    redirect: { name: 'transactions' },
    children: [
      {
        path: 'overview',
        name: 'transactions',
        component: TransactionOverview,
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
    path: '/control',
    meta: { breadcrumb_name: 'Management' },
    redirect: { name: 'management' },
    children: [
      {
        path: 'overview',
        name: 'management',
        component: ManagementOverview,
        meta: { breadcrumb_name: 'Management' },
      },
      {
        path: 'database',
        name: 'database',
        component: ManagementDatabase,
        meta: { breadcrumb_name: 'Database' },
      },
      {
        path: 'tcgdex',
        name: 'tcgdex',
        component: ManagementTCGDex,
        meta: { breadcrumb_name: 'TCGDex API' },
      },
      {
        path: 'audit',
        name: 'audit',
        component: ManagementAuditLog,
        meta: { breadcrumb_name: 'Audit Log' },
      },
    ],
  },
] satisfies RouteRecordRaw[]
