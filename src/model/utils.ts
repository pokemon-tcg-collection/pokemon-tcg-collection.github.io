import { v4 as uuidv4 } from 'uuid'

import type { Card, DataEditInfo, Item, Place, Transaction } from './interfaces'

function createEditMeta() {
  return {
    created: new Date(),
    edited: undefined,
  } satisfies DataEditInfo
}

export function createNewCard() {
  return {
    id: uuidv4(),
    name: '',
    language: 'en',
    number: '',
    set: '',
    amount: 1,
    _meta: createEditMeta(),
  } satisfies Card
}

export function createNewTransaction() {
  return {
    id: uuidv4(),
    name: '',
    type: 'buy',
    cost: 0,
    cost_unit: 'EUR',
    date: new Date(),
    items: [],
    _meta: createEditMeta(),
  } satisfies Transaction
}

export function createNewPlace() {
  return {
    id: uuidv4(),
    name: '',
    type: 'online',
    url: '',
    _meta: createEditMeta(),
  } satisfies Place
}

export function createNewItem() {
  return {
    id: uuidv4(),
    name: '',
    type: 'booster',
    cost_unit: 'EUR',
    contents: [],
    _meta: createEditMeta(),
  } satisfies Item
}
