import type { Item, Place } from '@/model/interfaces'

const places = [
  // local
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
  // fan-made
  {
    id: '19bce07c-1c80-4a80-8484-22ac5cf4a470',
    name: 'mizucat',
    type: 'local-fair',
    fair: 'Manga Comic Con 2026',
    url: 'https://www.mizucat.com/',
    address:
      'Leipzig Book Fair 2026\n- https://www.leipziger-buchmesse.de/\n- https://www.manga-comic-con.de/',
    _meta: {
      created: new Date(),
    },
  },
  // ---
  // online
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
    id: 'b8047858-343a-4bb3-8339-69bd82991ba7',
    name: 'God of Cards',
    type: 'online-shop',
    url: 'https://godofcards.com/',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'cc44bfe2-978b-4347-9851-244565af8829',
    name: 'Card Cosmos',
    type: 'online-shop',
    url: 'https://cardcosmos.de/',
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
  // müller
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
  // ebay
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
    id: 'a9753c9f-d0e1-4388-9d9f-2261d0584970',
    name: 'kimjaqpete-0',
    type: 'online-marketplace',
    marketplace: 'ebay',
    url: 'https://www.ebay.de/usr/kimjaqpete-0',
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '6b6a70ff-5dc0-4311-b426-3cc70b21a7cd',
    name: 'Maple Pocket TCG',
    type: 'online-marketplace',
    marketplace: 'ebay',
    url: 'https://www.ebay.de/str/japanhobbytop',
    _meta: {
      created: new Date(),
    },
  },
  // ebay marketplace / kleinanzeigen
  {
    id: '22f60c3c-6fb2-4cc4-ad33-1dbef1f39134',
    name: 'Verkäufer (Pokemon Bulk/Holos)',
    type: 'online-marketplace',
    marketplace: 'ebay-marketplace',
    url: 'https://www.kleinanzeigen.de/s-bestandsliste.html?userId=23441713',
    _meta: {
      created: new Date(),
    },
  },
  // cardmarket
  {
    id: '85d7d451-6688-4cde-b823-946a41d5c475',
    name: 'CrazyCardsEU',
    type: 'online-marketplace',
    marketplace: 'cardmarket',
    url: 'https://www.cardmarket.com/de/Pokemon/Users/CrazyCardsEU',
    related_urls: [
      {
        url: 'https://www.crazycards.eu/',
        name: 'Shop Website',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'eedf229e-813f-4c73-ad14-8b5baa91192b',
    name: 'cernyrytir',
    type: 'online-marketplace',
    marketplace: 'cardmarket',
    url: 'https://www.cardmarket.com/de/Pokemon/Users/cernyrytir',
    _meta: {
      created: new Date(),
    },
  },
  // online
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
  // amazon
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
  {
    id: 'ae7cd51a-f9e4-4152-901f-b794f2f8164b',
    name: 'Amazon DE',
    type: 'online-marketplace',
    marketplace: 'amazon',
    url: 'https://www.amazon.de/',
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
    id: 'cd89c514-31c7-42d0-8e28-4cf19a84d2e0',
    name: 'Mega Brave',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://cardcosmos.de/products/pokemon-mega-brave-booster-display-koreanisch',
        name: 'CardCosmos listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'b69c2383-39a1-4e98-a1f7-60eb1f555c75',
    name: 'Mega Symphonia',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://cardcosmos.de/products/pokemon-mega-symphonia-booster-display-koreanisch',
        name: 'CardCosmos listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'd21113dc-4f1d-4dc6-9d09-948e5391fb58',
    name: 'Mega Inferno X',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://cardcosmos.de/products/pokemon-mega-inferno-x-booster-display-koreanisch',
        name: 'CardCosmos listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '3cd738f2-68da-4c02-a0a4-322b6c6d5d64',
    name: 'Glory of Team Rocket',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://cardcosmos.de/products/pokemon-glory-of-team-rocket-booster-display-kor',
        name: 'CardCosmos listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'ca781128-9559-4104-9b2b-2a1c84d94758',
    name: 'Triple Beat 30er (SV1a)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://godofcards.com/products/pokemon-triple-beat-display-koreanisch',
        name: 'God of Cards listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '0a582616-c1eb-455c-8abc-16e051aca490',
    name: 'Battle Partners 30er (SV9)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://godofcards.com/products/pokemon-battle-partners-display-koreanisch',
        name: 'God of Cards listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'a5eeb031-11e5-4a00-9610-5ce368388962',
    name: 'Incandescent Arcana 20er (S11a)',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://godofcards.com/products/pokemon-incandescent-arcana-display-koreanisch',
        name: 'God of Cards listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
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
    name: 'Eevee Heroes (S6a)',
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
  {
    id: 'b52d8555-4d2a-4ca2-857b-1790d60dcf9e',
    name: 'VSTAR Universe Display',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://www.cardmarket.com/de/Pokemon/Products/Booster-Boxes/VSTAR-Universe-Booster-Box',
        name: 'CardMarket listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '5548520f-5505-4590-a0e3-d52ebdb2eef9',
    name: 'Heat Wave Arena Display',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://www.cardmarket.com/de/Pokemon/Products/Booster-Boxes/Heat-Wave-Arena-Booster-Box',
        name: 'CardMarket listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '226b015d-2b63-41e9-9a02-8de5e0e203e1',
    name: 'Wild Force',
    type: 'booster-display',
    cost_unit: 'EUR',
    language: 'ko',
    contents: [],
    related_urls: [
      {
        url: 'https://www.cardmarket.com/de/Pokemon/Products/Booster-Boxes/Wild-Force-Booster-Box',
        name: 'CardMarket listing',
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
    type: 'box-set',
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
    id: 'd7856e96-53ed-435d-b710-e6dba63138a0',
    name: 'Journey Gift Box - Mew (JGB-01)',
    type: 'box-set',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-box-journey-gift-box?variant=51794449531208',
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
  {
    id: 'c11d9197-9353-46b6-bf81-fad4046cc04b',
    name: 'Top-Trainer-Box Mega-Entwicklung - Fatale Flammen',
    type: 'etb',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/Pok%C3%A9mon-Sammelkartenspiel-Top-Trainer-Box-Mega-Entwicklung-Vollbild-Promokarte-Boosterpacks/dp/B0FTG22Q2H',
        name: 'Amazon listing',
      },
    ],
    notes: 'ASIN: B0FTG22Q2H',
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
    id: 'a6a9090d-2b22-4a82-a18c-ea70743e6fa3',
    name: 'Tech-Sticker-Kollektion Mega-Entwicklung - Erhabene Helden: Nebulak',
    type: 'blister',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/Pokémon-Sammelkartenspiel-Tech-Sticker-Kollektion-Mega-Entwicklung-holografische-Boosterpacks/dp/B0G4RQZB49',
        name: 'Amazon listing',
      },
    ],
    notes: 'ASIN: B0G4RQZB49',
    _meta: {
      created: new Date(),
    },
  },
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
  {
    id: '59921e0c-a607-4994-81dd-24d089ccd16a',
    name: "Team Rocket's Zapdos, Articuno & Tyranitar Enhanced 2-Pack Blister",
    type: 'blister',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.cardmarket.com/de/Pokemon/Products/Blisters/Team-Rockets-Zapdos-Articuno-Tyranitar-Enhanced-2-Pack-Blister',
        name: 'CardMarket',
      },
      {
        url: 'https://www.amazon.de/Pok%C3%A9mon-Sammelkartenspiel-Aufgewerteter-2er-Pack-Blister-holografische-Boosterpacks/dp/B0FTG2JC8J',
        name: 'Amazon listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '59a1ae62-c9bf-40f7-a26f-e2feef57fc1b',
    name: 'Paradoxrift Checklane Blister Tannza / Fatalitee',
    type: 'blister',
    cost_unit: 'EUR',
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://godofcards.com/products/pokemon-paradoxrift-checklane-blister-tannza-fatalitee',
        name: 'God of Cards listing',
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
  {
    id: 'b8bcd1f5-fc96-4ef7-a01a-18ff38963e33',
    name: 'Scarlet & Violet ex Special Set',
    type: 'box-set',
    cost_unit: 'EUR',
    language: 'ja',
    contents: [],
    related_urls: [
      {
        url: 'https://godofcards.com/products/pokemon-scarlet-violet-ex-special-set-japanisch',
        name: 'God of Cards listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // collection (Box Set?)
  {
    id: '7b067ba0-827c-4a4d-8bb4-29901a1e93a9',
    name: 'Morpeko V Union Premium Spielunterlagen Kollektion',
    type: 'collection',
    cost_unit: 'EUR',
    cost: 66.99,
    language: 'de',
    contents: [],
    related_urls: [
      {
        url: 'https://www.ebay.de/itm/188094968491',
        name: 'Ebay listing',
      },
      {
        url: 'https://www.cardmarket.com/de/Pokemon/Products/Box-Sets/Crown-Zenith-Morpeko-V-UNION-Premium-Playmat-Collection',
        name: 'CardMarket listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // deck
  {
    id: '64f6b3c8-48e6-4139-bee5-a73da1b130fc',
    name: 'Happy Card Set (CSVH1C)',
    type: 'theme-deck',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://godofcards.com/products/pokemon-happy-card-set-s-chinesisch',
        name: 'God of Cards listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '2b21440e-744c-4e99-9630-c64c7b1855ac',
    name: 'MEGA Start Deck 100 Battle Collection',
    type: 'theme-deck',
    cost_unit: 'EUR',
    language: 'ja',
    contents: [],
    related_urls: [
      {
        url: 'https://www.ebay.de/itm/147017587343',
        name: 'Ebay listing',
      },
      {
        url: 'https://www.card-corner.de/start-deck-100-battle-collection-card-list',
        name: 'CardCosmos card list',
      },
      {
        url: 'https://www.cardmarket.com/en/Pokemon/Products/Theme-Decks/MEGA-Start-Deck-100-Battle-Collection',
        name: 'CardMarket listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  // accessories and stuff
  {
    id: '14f45cab-6c23-4d03-9d20-a11c833c6bca',
    name: 'Glurak Kartenhalter (CSM)',
    type: 'card-holder',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-box-evoli-kartenhalter-csg-kopie',
        name: 'Yonko TCG listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '0975bfed-f60f-42df-8f5d-e3684fd066b5',
    name: 'Gengar Kartenhalter (CSU)',
    type: 'card-holder',
    cost_unit: 'EUR',
    language: 'zh-cn',
    contents: [],
    related_urls: [
      {
        url: 'https://yonko-tcg.de/products/s-chn-pokemon-box-gengar-kartenhalter-csu',
        name: 'Yonko TCG listing',
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
  {
    id: '34e837ce-58ed-4564-8e31-0a545ccc9efd',
    name: 'Ultra PRO Toploader 3x4 für Pokemon Karten - 100 Stück',
    type: 'toploader',
    cost_unit: 'EUR',
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/gp/aw/d/B0812Z3RPY',
        name: 'Amazon listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '0fbc53b8-ab1e-4e2c-b5e6-6e96a0cb0fe8',
    name: 'Ultra PRO Kartenhüllen Sleeve 300 Stück',
    type: 'sleeves',
    cost_unit: 'EUR',
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/gp/aw/d/B085DSTKWG',
        name: 'Amazon listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'c23a1777-5847-4c4c-a87e-5b18b9b77b95',
    name: 'Ultimate Guard Precise-Fit Sleeves Side-Loading, Standardgröße, 100 Stück',
    type: 'sleeves',
    cost_unit: 'EUR',
    cost: 3.99,
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/Ultimate-Guard-UGD010478-Side-Loading-Standardgröße/dp/B01891HGTE',
        name: 'Amazon listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'ff99a8c7-85b5-4516-9f4d-aa4cc57ecfb3',
    name: 'Ultra Pro Standard Regular Soft 1000 Stück Penny Sleeves, Standardgröße',
    type: 'sleeves',
    cost_unit: 'EUR',
    cost: 10.04,
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/Ultra-Pro-Standard-Kartenfolien-Kartenhüllen/dp/B085DBMS88',
        name: 'Amazon listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: '9742ce80-3970-4377-809e-60324c7619b7',
    name: 'Ultra Pro Kinder 3" X 4" Clear for Collectible Trading Cards (Includes Toploaders and 100 Sleeves)',
    type: 'toploader',
    cost_unit: 'EUR',
    cost: 14.94,
    contents: [],
    related_urls: [
      {
        url: 'www.amazon.de/Ultra-Pro-Collectible-100-toploaders-100-Sleeves/dp/B076V4V2QQ',
        name: 'Amazon listing',
      },
    ],
    description: '100x Toploader 3"x4"\n100x Penny Sleeves',
    _meta: {
      created: new Date(),
    },
  },
  // binder
  {
    id: '8074286f-2e60-40c5-8f99-db1393e11acf',
    name: 'TCGUARD Toploader Album (112x Fächer, 4x4 Layout, für 3"x4" Rigid Toploader, blau)',
    type: 'binder',
    cost_unit: 'EUR',
    cost: 23.69,
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/TCGUARD-Toploader-Sammelkarten-MTG-Karten-Kartensammelalben/dp/B0DPHH5Q8Y',
        name: 'Amazon listing',
      },
    ],
    _meta: {
      created: new Date(),
    },
  },
  {
    id: 'e561280d-43eb-4f61-b45a-527a892cc65e',
    name: 'Vault X 4-Taschen-Trading-Kartenordner mit Gurt, 160 Karten, Standardgröße, 20 seitlich ladbare Seiten (Schwarz) ',
    type: 'binder',
    cost_unit: 'EUR',
    cost: 11.99,
    contents: [],
    related_urls: [
      {
        url: 'https://www.amazon.de/Vault-4-Taschen-Trading-Kartenordner-Standardgröße-Sammelordner-Sammelkartenspiele/dp/B0718ZYRZF',
        name: 'Amazon listing',
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
