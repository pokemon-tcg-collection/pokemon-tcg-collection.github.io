import type { Place } from '@/model/interfaces'

const places = [
  {
    id: '72864d29-48df-4004-b864-fa675ba92832',
    type: 'local-store',
    name: 'Gate to the Games',
    url: 'https://www.gate-to-the-games.de/',
    address:
      'Richard-Wagner-Straße 9\nObjekt am Hallischen Tor 1\nBrühl 33\n04109 Leipzig\n\nTelefon: 0341 / 91025937\nE-Mail: leipzig@gate-to-the-games.de',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '2cfd2e90-a768-4617-8767-6d06588be925',
    type: 'online-shop',
    name: 'Yonko TCG',
    url: 'https://yonko-tcg.de/',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '2ea547c7-7684-4783-9a31-cee2b5078031',
    type: 'online-shop',
    name: 'Card-Corner',
    url: 'https://www.card-corner.de/',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '9e0fc862-adfc-4646-9b0d-8a186ff2d077',
    type: 'local-store',
    name: 'Butti Cards',
    url: 'https://www.butticards.at/',
    address:
      'Butti Cards e.U.\nInhaber Christoph Buttura\n\n1100 Wien\nPuchsbaumgasse 1/2/2\nAustria\n\nE-Mail: office@butticards.at\nTel.: +4367764812820',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'a6f837d5-0fa3-4897-97ac-d85f7f0128ce',
    type: 'local-store',
    name: 'Müller Meidling (Wien)',
    url: 'https://www.mueller.at/meine-filiale/',
    address: 'Wilhelmstraße, Philadelphiabrücke 66/68\n1120 Wien\nÖsterreich',
    _meta: {
      created: new Date(),
    },
  },
] satisfies Place[]

export default { places } as const
