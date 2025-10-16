import { v4 as uuidv4 } from 'uuid'
import type { Card, Place, Transaction } from './interfaces'

export function createNewCard() {
  return {
    id: uuidv4(),
    language: 'en',
    name: '',
    number: '',
    set: '',
    amount: 1,
  } satisfies Card
}

export function createNewTransaction() {
  return {
    id: uuidv4(),
    type: 'purchase',
    cost: 0,
    cost_unit: 'EUR',
    date: new Date(),
  } satisfies Transaction
}

export function createNewPlace() {
  return {
    id: uuidv4(),
    type: 'online',
    name: '',
    url: '',
  } satisfies Place
}
