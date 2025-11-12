import type { Item, Place } from '@/model/interfaces'

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
    id: 'c46fc7ce-f1af-4c55-a450-b10b62db62b6',
    type: 'online-shop',
    name: 'Toy Treasure',
    url: 'https://toy-treasure.com/',
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
  {
    id: '3fbaff46-2c95-4ce4-9625-4ea6cc0aba18',
    name: 'The Superb Collections (cttccommer0)',
    type: 'online-marketplace',
    marketplace: 'ebay',
    url: 'https://www.ebay.com/str/cttccommer1',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '3d260b7b-b164-49e1-a254-dd2fa1f53a57',
    name: 'Habibicards',
    type: 'online-shop',
    url: 'https://habibicards.de/',

    notes:
      'Jeremy Warken\nHabibicards\nAm Kreuzgraben 14\n66280 Sulzbach\nDeutschland\n\nTel.: 01712920925\nE-Mail: habibicards.deutschland@gmail.com',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '68d2e84d-5cf3-43e4-9bf9-b79ce839c1a9',
    name: 'Amazon UK',
    type: 'online-marketplace',
    marketplace: 'amazon',
    url: '',
    _meta: {
      created: new Date(),
    },
  },
  // fan-made
  {
    id: '3a4a0a37-9bd6-4fc1-b52d-3a599ea115cf',
    name: 'JWillyGuyArt',
    type: 'online-marketplace',
    marketplace: 'etsy',
    url: 'https://www.etsy.com/shop/JWillyGuyArt',
    _meta: {
      created: new Date(),
    },
  },
] satisfies Place[]

const items = [
  // booster
  {
    id: 'c036b601-522d-466a-a9c2-af7223cd69a5',
    name: 'Gem Pack Vol. 1 Promo Booster',
    type: 'booster',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://toy-treasure.com/neu/pokemon-tcg-pokemon-gem-pack-vol.-1-cbb1c-cn-kopie-0196a5532def721e99e5a7cf6f07a294',
        name: 'Toy Treasure listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'fa05549d-8755-4d98-b126-ef56e4b54a92',
    name: 'Collect 151 Surprise (151C)',
    type: 'booster',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-boosterpack-collect-151-surprise-151c',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // displays
  {
    id: '907baf43-b2f4-42e7-a3b4-66e8a7b57ab9',
    name: 'Mega Inferno X (M2)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ja',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/preorderjp-pokemon-display-mega-inferno-x-m2',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'e5c2b21c-3b73-4bdd-821d-03bfa196e2e5',
    name: 'Battle Partners (SV9)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ja',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/jp-pokemon-display-battle-partners-sv9',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'a20a05a1-e1d1-43bd-89e2-9da26b8e24b1',
    name: 'Heat Wave Arena (SV9a)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ja',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/jp-pokemon-display-heat-wave-arena-sv9a',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'e5d74130-0bae-4a37-9253-29aced48112d',
    name: 'Gem Pack Vol. 3 (CBB3)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-display-gem-pack-vol-3-cbb3',
        name: 'Yonko TCG listing',
      },
      {
        url: 'https://www.ebay.com/itm/376581909056',
        name: 'Ebay listing (cttccommer_1)',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'c19aa9ed-7d23-42bd-94ef-739f9b590e66',
    name: 'Gem Pack Vol. 2 (CBB2)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-display-gem-pack-vol-2-cbb2',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'f3a785fd-19d1-46cb-b73e-a1b2690f4266',
    name: 'Victory Stars (CS6.5)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-display-victory-stars-cs65',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'a2c290e2-2627-4b02-a118-121ce3c2b3e9',
    name: 'Eevee Heroes - S6a',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://www.butticards.at/Shop/Pokemon-Eevee-Heroes-S6a-Booster-Box-Koreanisch-p508198490',
        name: 'Butti Cards listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'f74a0c7c-4cca-41a9-9871-150106f3824e',
    name: 'Trick or Trade BOOster Bundle 2023',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'en',
    contents: [],
    related_urls: [
      {
        url: 'https://pokezentrum.de/pokemon-karten-news/pokemon-trick-or-trade-2023-kartenliste-alle-halloween-karten/',
        name: 'PokeZentrum Card List',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'e200796c-6612-41e1-8ce1-71bd3f7bffac',
    name: 'Trick or Trade 2024 BOOster-Bundle',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'en',
    contents: [],
    related_urls: [
      {
        url: 'https://pokezentrum.de/pokemon-karten-news/pokemon-trick-or-trade-2024-kartenliste-alle-halloween-karten/',
        name: 'PokeZentrum Card List',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // boxes
  {
    id: '42d4a480-4a2c-4de6-86f4-b017794a0a37',
    name: 'Karmesin & Purpur Paldeas Schicksale Top Trainer Box Mimigma',
    type: 'etb',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Karten-Karmesin-Purpur-Paldeas-Schicksale-Top-Trainer-Box-Mimigma',
        name: 'Gate to the Games listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '3e7bd699-be7e-4d6a-b77c-717808f30b20',
    name: 'Radiant Energy Gift Box Pikachu (CSK1)',
    type: 'etb',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-box-radiant-energy-pikachu-csk1',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'b99b24af-be52-4171-ae90-e04e4bb3a105',
    name: 'Radiant Energy Gift Box Mew (CSP1)',
    type: 'etb',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-box-radiant-energy-mew',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'c6e21d9d-03cc-493b-a506-14eac6e64c52',
    name: 'Mew V Special Deck Build Collection Box / Fusion Strike (CS0)',
    type: 'etb',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Chinese-Mew-V-Confluence-Deck-Building-Advanced-Gift-Box',
        name: 'Gate to the Games listing',
      },
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-box-fusion-strike',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'ca7e1b3a-6918-4d06-a8c5-b6813e5fa564',
    name: 'Karmesin & Purpur Nebel der Sagen Top Trainer Box',
    type: 'etb',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    _meta: {
      created: new Date(),
    },
  },
  // tins
  {
    id: '8491bc1c-c583-47c4-baaf-fed0ae572ac2',
    name: 'Scarlet & Violet Prismatic Evolutions Umbreon Mini Tin',
    type: 'tin',
    cost_unit: 'EUR',
    language: 'en',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Scarlet-Violet-Prismatic-Evolutions-Umbreon-Mini-Tin-englisch',
        name: 'Gate to the Games listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '16dfa759-6c88-46d1-a445-7e71e4055dce',
    name: 'Karmesin & Purpur Prismatische Entwicklungen Nachtara Mini Tin',
    type: 'tin',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Karmesin-Purpur-Prismatische-Entwicklungen-Nachtara-Mini-Tin-deutsch',
        name: 'Gate to the Games listing (de)',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '7acba2f1-5fff-4309-bd42-ccab6dd6a6af',
    name: 'Hyperball Gift Box (CSJ2)',
    type: 'tin',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-pokeball-hyperball-gift-box-pokemon-art-illustration-celebration',
        name: 'Yonko TCG listing',
      },
      {
        url: 'https://toy-treasure.com/Pokemon-Gift-Box-Hyperball-CSJ2-CN/TT-201109',
        name: 'Toy Treasure listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // blister
  {
    id: 'ff1a347d-8ab8-4a4c-9ac0-bc9ee3630dcb',
    name: 'Karmesin & Purpur Prismatische Entwicklungen Tech-Sticker-Kollektion - Folipurba',
    type: 'blister',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Karten-Karmesin-Purpur-Prismatische-Entwicklungen-Tech-Sticker-Kollektion-Folipurba-deutsch',
        name: 'Gate to the Games listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // box set?
  {
    id: 'd4ea143e-d267-4226-acb7-7a25cdd167c2',
    name: 'SWSH Trainer Collection Gift Box (CSL)',
    type: 'box-set',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://toy-treasure.com/Pokemon-Simplified-Chines-SWSH-Trainer-Collection-Gift-Box-CSL-CN/TT-200952',
        name: 'Toy Treasure listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // sleeves
  {
    id: '7c536d01-e8d0-436e-b0ad-103a599a8a62',
    name: 'Arkero-G Regular Toploader',
    type: 'toploader',
    cost: 3.99,
    cost_unit: 'EUR',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Magic-Standard-Toploader-extrem-dicke-Schutzhuellen-25-Stueck',
        name: 'Gate to the Games listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'c43cf841-3135-4c57-a3b8-94c30252ce36',
    name: 'Arkero-G Standard Toploader',
    type: 'toploader',
    cost: 5.49,
    cost_unit: 'EUR',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Pokemon-Magic-Standard-Toploader-extrem-dicke-Schutzhuellen-25-Stueck',
        name: 'Gate to the Games listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'e1eb6929-7e63-49ba-b77b-1762b3c8ba61',
    name: 'Arkero-G 100 Standard Soft Sleeves',
    type: 'sleeves',
    cost: 1.99,
    cost_unit: 'EUR',
    contents: [],
    related_urls: [
      {
        url: 'https://www.gate-to-the-games.de/Sammelkarten-Zubehoer/Kartenhuellen-Standard/Arkero-G-100-Standard-Soft-Sleeves-Kartenhuellen-1html',
        name: 'Gate to the Games listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '394871a7-4027-464b-9a8d-f1f90f7e1e20',
    name: 'Ultra Pro Toploader',
    type: 'toploader',
    cost: 3.49,
    cost_unit: 'EUR',
    contents: [],
    description: '3"x4" Regular Toploader',
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/toploader',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '5fe86d6c-3327-475d-ac42-b6d13f1f26c3',
    name: 'Ultra Pro Card Sleeves',
    type: 'sleeves',
    cost_unit: 'EUR',
    contents: [],
    related_urls: [
      {
        url: 'https://toy-treasure.com/sammelkarten-zubehoer/kartenhuellen/ultra-pro-card-sleeves-regular-100-stueck',
        name: 'Toy Treasure listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // fan
  {
    id: 'ea4d85cc-eb0d-4818-b4c3-a55b9773c1ed',
    name: 'Holo-Ween POKEDERP',
    type: 'fan-booster',
    cost: 9.62,
    cost_unit: 'EUR',
    language: 'en',
    contents: [],
    related_urls: [
      {
        url: 'https://www.etsy.com/de/listing/4298706604/holo-ween-pokederp-zeitlich-begrenzte',
        name: 'Etsy product page',
      },
    ],
    description:
      'Half way to Holo-Ween!\n\nLimited Time Halloween set!\n\nAll cards in every pack are holo, which makes it Holo-ween!\nPacks come with 5 cards per packs.\n\nArt done by JWillyGuy.',
    _meta: {
      created: new Date(),
    },
  },
] satisfies Item[]

export default { places, items } as const
