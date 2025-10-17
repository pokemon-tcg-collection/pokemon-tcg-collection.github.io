import type { Place } from '@/model/interfaces'

const places = [
  {
    id: '72864d29-48df-4004-b864-fa675ba92832',
    type: 'local',
    name: 'Gate to the Games',
    url: 'https://www.gate-to-the-games.de/',
    address:
      'Richard-Wagner-Straße 9\nObjekt am Hallischen Tor 1\nBrühl 33\n04109 Leipzig\n\nTelefon: 0341 / 91025937\nE-Mail: leipzig@gate-to-the-games.de',
  },
] satisfies Place[]

export default { places } as const
