import data from './pokemon.json'

interface Pokemon {
  id: number
  sid: number
  identifier: string
  name: string
  generation: string
  sprite: boolean
}

export const pokemon = data as readonly Pokemon[]
