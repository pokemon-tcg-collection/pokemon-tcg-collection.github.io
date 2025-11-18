import data from './pokemon.json'

interface Pokemon {
  /** national dex id + 10000+ for extra forms */
  id: number
  /** species id (national dex id) */
  sid: number
  /** key */
  identifier: string
  name: string
  /** pokemon generation: i/ii/... */
  generation: string
  /** has sprite */
  sprite: boolean
}

export const pokemon = data as readonly Pokemon[]
