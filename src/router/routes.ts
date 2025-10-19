import type { RouteRecordRaw } from 'vue-router'

import CardDetails from '@/pages/CardDetails.vue'
import CardEditor from '@/pages/CardEditor.vue'
import CardList from '@/pages/CardList.vue'
import CardOverview from '@/pages/CardOverview.vue'
import Home from '@/pages/Home.vue'
import ItemEditor from '@/pages/ItemEditor.vue'
import ItemList from '@/pages/ItemList.vue'
import ManagementAuditLog from '@/pages/ManagementAuditLog.vue'
import ManagementDatabase from '@/pages/ManagementDatabase.vue'
import ManagementOverview from '@/pages/ManagementOverview.vue'
import ManagementSettings from '@/pages/ManagementSettings.vue'
import ManagementTCGDex from '@/pages/ManagementTCGDex.vue'
import ManagementWIPList from '@/pages/ManagementWIPList.vue'
import PlaceEditor from '@/pages/PlaceEditor.vue'
import PlaceList from '@/pages/PlaceList.vue'
import Transaction from '@/pages/Transaction.vue'
import TransactionEditor from '@/pages/TransactionEditor.vue'
import TransactionList from '@/pages/TransactionList.vue'
import TransactionOverview from '@/pages/TransactionOverview.vue'

export type EditRouteNames = 'card-edit' | 'transaction-edit' | 'place-edit' | 'item-edit'

export default [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  // cards
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
        meta: { breadcrumb_name: 'New Card' },
      },
      {
        path: ':id/edit',
        name: 'card-edit',
        component: CardEditor,
        meta: { breadcrumb_name: 'Edit Card' },
      },
      {
        path: ':id',
        name: 'card',
        component: CardDetails,
        meta: { breadcrumb_name: 'Card Details' },
      },
    ],
  },
  // transactions
  {
    path: '/transactions',
    meta: { breadcrumb_name: 'Transactions' },
    redirect: { name: 'transactions' },
    children: [
      {
        path: 'overview',
        name: 'transactions',
        component: TransactionOverview,
        meta: { breadcrumb_name: 'Dashboard' },
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
        meta: { breadcrumb_name: 'New Transaction' },
      },
      {
        path: ':id/edit',
        name: 'transaction-edit',
        component: TransactionEditor,
        meta: { breadcrumb_name: 'Edit Transaction' },
      },
      {
        path: ':id',
        name: 'transaction',
        component: Transaction,
        meta: { breadcrumb_name: 'Transaction Details' },
      },
    ],
  },
  // places (transaction)
  {
    path: '/places',
    meta: { breadcrumb_name: 'Transactions' },
    redirect: { name: 'transactions' },
    children: [
      {
        path: 'list',
        name: 'place-list',
        component: PlaceList,
        meta: { breadcrumb_name: 'Place List' },
      },
      {
        path: 'new',
        name: 'place-new',
        component: PlaceEditor,
        meta: { breadcrumb_name: 'New Place' },
      },
      {
        path: ':id/edit',
        name: 'place-edit',
        component: PlaceEditor,
        meta: { breadcrumb_name: 'Edit Place' },
      },
    ],
  },
  // items (transaction)
  {
    path: '/items',
    meta: { breadcrumb_name: 'Transactions' },
    redirect: { name: 'transactions' },
    children: [
      {
        path: 'list',
        name: 'item-list',
        component: ItemList,
        meta: { breadcrumb_name: 'Item List' },
      },
      {
        path: 'new',
        name: 'item-new',
        component: ItemEditor,
        meta: { breadcrumb_name: 'New Item' },
      },
      {
        path: ':id/edit',
        name: 'item-edit',
        component: ItemEditor,
        meta: { breadcrumb_name: 'Edit Item' },
      },
    ],
  },
  // control/management/admin
  {
    path: '/control',
    meta: { breadcrumb_name: 'Management' },
    redirect: { name: 'management' },
    children: [
      {
        path: 'overview',
        name: 'management',
        component: ManagementOverview,
        meta: { breadcrumb_name: 'Dashboard' },
      },
      {
        path: 'wip',
        name: 'wip',
        component: ManagementWIPList,
        meta: { breadcrumb_name: 'Work in Progress' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: ManagementSettings,
        meta: { breadcrumb_name: 'Settings' },
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
