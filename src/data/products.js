// Amma Sea Foods — Product Database
// Categories: Prawns, Fish, Crabs, Dry Seafood

export const categories = [
  {
    id: 'prawns',
    name: 'Prawns',
    slug: 'prawns',
    description: 'Fresh White & Tiger Prawns — Small, Medium & Large, Headless or With Head',
    image: '/images/prawn/farhad-ibrahimzade-JocD18QpAkY-unsplash.jpg',
    icon: '🦐',
    count: 0,
  },
  {
    id: 'fish',
    name: 'Fish',
    slug: 'fish',
    description: 'Fresh sea fish — Mullet, Seer Fish, Black Pomfret & Sea Bass',
    image: '/images/fish/camila-igisk-yFU8qIDo9s4-unsplash.jpg',
    icon: '🐟',
    count: 0,
  },
  {
    id: 'crabs',
    name: 'Crabs',
    slug: 'crabs',
    description: 'Premium live & cleaned crabs — Egg Crab, Red Big Crab, Mud Crab & Blue Swimmer',
    image: '/images/crab/pexels-enginakyurt-17924397.jpg',
    icon: '🦀',
    count: 0,
  },
  {
    id: 'dry-seafood',
    name: 'Dry Seafood',
    slug: 'dry-seafood',
    description: 'Sun-dried & preserved seafood — traditional flavours packed with nutrition',
    image: '/images/prawn/pexels-mahmudul-hasan-2149253486-32230044.jpg',
    icon: '🌊',
    count: 0,
  },
];

export const products = [

  // ============================================================
  // PRAWNS — WHITE PRAWNS
  // ============================================================

  // --- White Prawns · Small ---
  {
    id: 'prawn-white-small-headless',
    name: 'White Prawns — Small (Headless)',
    description:
      'Fresh small White Prawns, neatly cleaned and headless. Ideal for prawn fry, soups, fried rice, and everyday coastal preparations.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'small',
    headOption: 'headless',
    price: 280,
    originalPrice: 340,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (4).jpeg',
    images: [
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (4).jpeg',
      '/images/prawn/pexels-nc-farm-bureau-mark-2714384.jpg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['white-prawns', 'small', 'headless', 'budget'],
  },
  {
    id: 'prawn-white-small-head-on',
    name: 'White Prawns — Small (With Head)',
    description:
      'Fresh small White Prawns with head on, for richer flavour in stocks, curries, and coastal dishes. Sourced daily from local fishermen.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'small',
    headOption: 'with-head',
    price: 240,
    originalPrice: 300,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/pexels-nc-farm-bureau-mark-2714384.jpg',
    images: [
      '/images/prawn/pexels-nc-farm-bureau-mark-2714384.jpg',
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (4).jpeg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['white-prawns', 'small', 'with-head', 'budget'],
  },

  // --- White Prawns · Medium ---
  {
    id: 'prawn-white-medium-headless',
    name: 'White Prawns — Medium (Headless)',
    description:
      'Plump, juicy medium White Prawns, headless and cleaned. A versatile everyday prawn perfect for pulao, stir fry, masala, and prawn curries.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'medium',
    headOption: 'headless',
    price: 360,
    originalPrice: 440,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (4).jpeg',
    images: [
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (4).jpeg',
      '/images/prawn/pexels-nc-farm-bureau-mark-2714384.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['white-prawns', 'medium', 'headless', 'bestseller'],
  },
  {
    id: 'prawn-white-medium-head-on',
    name: 'White Prawns — Medium (With Head)',
    description:
      'Fresh medium White Prawns with head on. The head adds a deep, natural sweetness to broths, coconut curries, and traditional seafood dishes.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'medium',
    headOption: 'with-head',
    price: 320,
    originalPrice: 400,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/pexels-nc-farm-bureau-mark-2714384.jpg',
    images: [
      '/images/prawn/pexels-nc-farm-bureau-mark-2714384.jpg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['white-prawns', 'medium', 'with-head'],
  },

  // --- White Prawns · Large ---
  {
    id: 'prawn-white-large-headless',
    name: 'White Prawns — Large (Headless)',
    description:
      'Premium large White Prawns, headless and cleaned. Their firm, succulent flesh is perfect for grilling, butter garlic preparations, and party platters.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'large',
    headOption: 'headless',
    price: 480,
    originalPrice: 580,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
    images: [
      '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
      '/images/prawn/charlotte-harrison-d7qBMJDsbSE-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['white-prawns', 'large', 'headless', 'premium'],
  },
  {
    id: 'prawn-white-large-head-on',
    name: 'White Prawns — Large (With Head)',
    description:
      'Large White Prawns with head on — a showstopper for coastal prawn curries and tandoori preparations. Full of natural flavour and freshness.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'large',
    headOption: 'with-head',
    price: 440,
    originalPrice: 540,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/charlotte-harrison-d7qBMJDsbSE-unsplash.jpg',
    images: [
      '/images/prawn/charlotte-harrison-d7qBMJDsbSE-unsplash.jpg',
      '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['white-prawns', 'large', 'with-head', 'premium'],
  },

  // ============================================================
  // PRAWNS — TIGER PRAWNS
  // ============================================================

  // --- Tiger Prawns · Small ---
  {
    id: 'prawn-tiger-small-headless',
    name: 'Tiger Prawns — Small (Headless)',
    description:
      'Small Black Tiger Prawns, headless and cleaned. Bold, distinctive flavour that shines in spicy masalas, noodles, and quick sautés.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'small',
    headOption: 'headless',
    price: 380,
    originalPrice: 460,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    images: [
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: 'Farm Fresh',
    serves: null,
    prepTime: null,
    tags: ['tiger-prawns', 'small', 'headless'],
  },
  {
    id: 'prawn-tiger-small-head-on',
    name: 'Tiger Prawns — Small (With Head)',
    description:
      'Small Black Tiger Prawns with head on. Their intense natural juices enhance curries and coastal preparations with unmistakable depth of flavour.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'small',
    headOption: 'with-head',
    price: 340,
    originalPrice: 420,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    images: [
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: 'Farm Fresh',
    serves: null,
    prepTime: null,
    tags: ['tiger-prawns', 'small', 'with-head'],
  },

  // --- Tiger Prawns · Medium ---
  {
    id: 'prawn-tiger-medium-headless',
    name: 'Tiger Prawns — Medium (Headless)',
    description:
      'Medium Black Tiger Prawns, headless and deveined. A premium choice for tandoori, butter garlic, and classic Andhra-style prawn masala.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'medium',
    headOption: 'headless',
    price: 520,
    originalPrice: 630,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    images: [
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
      '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: 'Farm Fresh',
    serves: null,
    prepTime: null,
    tags: ['tiger-prawns', 'medium', 'headless', 'premium', 'bestseller'],
  },
  {
    id: 'prawn-tiger-medium-head-on',
    name: 'Tiger Prawns — Medium (With Head)',
    description:
      'Medium Black Tiger Prawns with head on. Ideal for whole prawn preparations where presentation and flavour depth matter.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'medium',
    headOption: 'with-head',
    price: 480,
    originalPrice: 580,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    images: [
      '/images/prawn/WhatsApp Image 2026-05-23 at 22.08.41 (5).jpeg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: 'Farm Fresh',
    serves: null,
    prepTime: null,
    tags: ['tiger-prawns', 'medium', 'with-head', 'premium'],
  },

  // --- Tiger Prawns · Large ---
  {
    id: 'prawn-tiger-large-headless',
    name: 'Tiger Prawns — Large (Headless)',
    description:
      'Large Black Tiger Prawns, headless and cleaned. Firm, meaty and full of flavour — the ultimate choice for grilling, barbecue, and special seafood occasions.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'large',
    headOption: 'headless',
    price: 720,
    originalPrice: 860,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
    images: [
      '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
      '/images/prawn/charlotte-harrison-d7qBMJDsbSE-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: 'Farm Fresh',
    serves: null,
    prepTime: null,
    tags: ['tiger-prawns', 'large', 'headless', 'premium', 'jumbo'],
  },
  {
    id: 'prawn-tiger-large-head-on',
    name: 'Tiger Prawns — Large (With Head)',
    description:
      'Large Black Tiger Prawns with head on. An impressive seafood centrepiece for festive meals and fine-dining-style preparations at home.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'large',
    headOption: 'with-head',
    price: 680,
    originalPrice: 820,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/prawn/charlotte-harrison-d7qBMJDsbSE-unsplash.jpg',
    images: [
      '/images/prawn/charlotte-harrison-d7qBMJDsbSE-unsplash.jpg',
      '/images/prawn/john-cameron-r4QVfQtytQ4-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: 'Farm Fresh',
    serves: null,
    prepTime: null,
    tags: ['tiger-prawns', 'large', 'with-head', 'premium', 'jumbo'],
  },

  // ============================================================
  // FISH
  // ============================================================

  {
    id: 'fish-small-mullet',
    name: 'Small Mullet Fish',
    description:
      'Fresh Small Mullet Fish — a popular coastal fish known for its mild, sweet flavour. Perfect for deep frying, masala fry, and traditional fish curries. Cleaned on request.',
    category: 'fish',
    type: 'raw',
    price: 220,
    originalPrice: 280,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/fish/WhatsApp Image 2026-05-23 at 22.08.41 (1).jpeg',
    images: [
      '/images/fish/WhatsApp Image 2026-05-23 at 22.08.41 (1).jpeg',
      '/images/fish/WhatsApp Image 2026-05-23 at 22.08.41.jpeg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['mullet', 'coastal', 'bestseller', 'fry'],
  },
  {
    id: 'fish-seer',
    name: 'Seer Fish (Vanjaram)',
    description:
      'Premium Seer Fish — the king of Indian sea fish. Dense, flavourful flesh that is perfect for Tawa fry, steaks, and festive preparations. Sourced fresh daily from the sea.',
    category: 'fish',
    type: 'raw',
    price: 680,
    originalPrice: 820,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/fish/kostiantyn-vierkieiev-P1PlQRiGwmc-unsplash.jpg',
    images: [
      '/images/fish/kostiantyn-vierkieiev-P1PlQRiGwmc-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['seer-fish', 'vanjaram', 'premium', 'bestseller'],
  },
  {
    id: 'fish-black-pomfret',
    name: 'Black Pomfret',
    description:
      'Wild-caught Black Pomfret — firm, meaty and full of flavour. Loved for its rich taste in curries, shallow fries, and coastal gravy dishes. Minimal bones and easy to cook.',
    category: 'fish',
    type: 'raw',
    price: 580,
    originalPrice: 700,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/fish/pexels-masuma-rahaman-437541976-33993681.jpg',
    images: [
      '/images/fish/pexels-masuma-rahaman-437541976-33993681.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['pomfret', 'black-pomfret', 'premium', 'sea-fish'],
  },
  {
    id: 'fish-sea-bass',
    name: 'Sea Bass (Koduva)',
    description:
      'Fresh Sea Bass — prized for its mild, buttery white flesh and versatility. Excellent for pan-searing, baking, grilling, or traditional South Indian fish curry.',
    category: 'fish',
    type: 'raw',
    price: 520,
    originalPrice: 640,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/fish/WhatsApp Image 2026-05-23 at 22.08.41.jpeg',
    images: [
      '/images/fish/WhatsApp Image 2026-05-23 at 22.08.41.jpeg',
      '/images/fish/WhatsApp Image 2026-05-23 at 22.08.41 (1).jpeg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['sea-bass', 'koduva', 'premium', 'wild-caught'],
  },

  // ============================================================
  // CRABS
  // ============================================================

  {
    id: 'crab-egg',
    name: 'Egg Crab',
    description:
      'Prized Egg Crabs loaded with rich, creamy roe. A seasonal delicacy with intense flavour — best enjoyed in traditional crab masala, steamed or curried.',
    category: 'crabs',
    type: 'raw',
    price: 580,
    originalPrice: 720,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/crab/WhatsApp Image 2026-05-23 at 22.08.41 (6).jpeg',
    images: [
      '/images/crab/WhatsApp Image 2026-05-23 at 22.08.41 (6).jpeg',
      '/images/crab/crab.JPG',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['egg-crab', 'roe', 'seasonal', 'premium', 'bestseller'],
  },
  {
    id: 'crab-red-big',
    name: 'Red Big Crab',
    description:
      'Large Red Crabs with heavy, meaty claws and sweet, succulent flesh. An excellent choice for spicy masala curries, crab biryani, and coastal feasts.',
    category: 'crabs',
    type: 'raw',
    price: 650,
    originalPrice: 800,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/crab/pexels-ooha-15651347.jpg',
    images: [
      '/images/crab/pexels-ooha-15651347.jpg',
      '/images/crab/crab.JPG',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['red-crab', 'big-crab', 'premium', 'meaty'],
  },
  {
    id: 'crab-mud',
    name: 'Mud Crab',
    description:
      'The undisputed king of crabs — large Mud Crabs with extraordinarily meaty claws and rich, bold flavour. Cleaned and cut. Perfect for pepper crab, Andhra masala, and festive seafood spreads.',
    category: 'crabs',
    type: 'raw',
    price: 750,
    originalPrice: 900,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/crab/pexels-enginakyurt-17924397.jpg',
    images: [
      '/images/crab/pexels-enginakyurt-17924397.jpg',
      '/images/crab/crab.JPG',
    ],
    inStock: true,
    isFeatured: true,
    freshness: "Today's Catch",
    serves: null,
    prepTime: null,
    tags: ['mud-crab', 'premium', 'meaty', 'bestseller'],
  },
  {
    id: 'crab-blue-swimmer',
    name: 'Blue Swimmer Crab (Sea Crab)',
    description:
      'Live Blue Swimmer Sea Crabs — delicate, sweet meat with a clean oceanic flavour. Excellent for light curries, soups, steaming, and coastal crab dishes.',
    category: 'crabs',
    type: 'raw',
    price: 420,
    originalPrice: 520,
    unit: 'per kg',
    weight: '1 kg',
    image: '/images/crab/pexels-miltonphotography-35267288.jpg',
    images: [
      '/images/crab/pexels-miltonphotography-35267288.jpg',
      '/images/crab/WhatsApp Image 2026-05-23 at 22.08.41 (6).jpeg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: 'Live',
    serves: null,
    prepTime: null,
    tags: ['blue-crab', 'sea-crab', 'live', 'sweet'],
  },

  // ============================================================
  // DRY SEAFOOD
  // ============================================================

  {
    id: 'dry-prawn-small',
    name: 'Dried Small Prawns (Yetti)',
    description:
      'Sun-dried small prawns with concentrated, intense umami flavour. A staple in South Indian kitchens — essential for chutneys, rice seasonings, and traditional Andhra preparations.',
    category: 'dry-seafood',
    type: 'raw',
    price: 280,
    originalPrice: 340,
    unit: 'per 250g',
    weight: '250g',
    image: '/images/prawn/pexels-mahmudul-hasan-2149253486-32230044.jpg',
    images: [
      '/images/prawn/pexels-mahmudul-hasan-2149253486-32230044.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: 'Sun Dried',
    serves: null,
    prepTime: null,
    tags: ['dry-seafood', 'dried-prawns', 'yetti', 'traditional'],
  },
  {
    id: 'dry-fish-small',
    name: 'Dried Small Fish (Karuvaadu)',
    description:
      'Traditional sun-dried small fish with a bold, robust flavour. A beloved ingredient in South Indian curries, chutneys, and rice dishes. Rich in protein and natural minerals.',
    category: 'dry-seafood',
    type: 'raw',
    price: 240,
    originalPrice: 300,
    unit: 'per 250g',
    weight: '250g',
    image: '/images/fish/lampos-aritonang-3oEcy656LIE-unsplash.jpg',
    images: [
      '/images/fish/lampos-aritonang-3oEcy656LIE-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: false,
    freshness: 'Sun Dried',
    serves: null,
    prepTime: null,
    tags: ['dry-seafood', 'dried-fish', 'karuvaadu', 'traditional'],
  },
  {
    id: 'dry-fish-seer',
    name: 'Dried Seer Fish (Vanjaram Karuvaadu)',
    description:
      'Premium sun-dried Seer Fish — a delicacy valued for its rich, concentrated taste. Used in special curries and traditional coastal recipes across Tamil Nadu and Andhra.',
    category: 'dry-seafood',
    type: 'raw',
    price: 520,
    originalPrice: 640,
    unit: 'per 250g',
    weight: '250g',
    image: '/images/fish/kostiantyn-vierkieiev-P1PlQRiGwmc-unsplash.jpg',
    images: [
      '/images/fish/kostiantyn-vierkieiev-P1PlQRiGwmc-unsplash.jpg',
    ],
    inStock: true,
    isFeatured: true,
    freshness: 'Sun Dried',
    serves: null,
    prepTime: null,
    tags: ['dry-seafood', 'dried-fish', 'seer-fish', 'premium', 'karuvaadu'],
  },
];

// ============================================================
// Helper functions
// ============================================================

export function getProductsByCategory(categorySlug) {
  return products.filter((p) => p.category === categorySlug);
}

export function getProductsByType(type) {
  return products.filter((p) => p.type === type);
}

export function getFeaturedProducts() {
  return products.filter((p) => p.isFeatured && p.inStock);
}

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function searchProducts(query) {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

// Prawn-specific filter helpers
export function getPrawnsByType(prawnType) {
  return products.filter((p) => p.category === 'prawns' && p.prawnType === prawnType);
}

export function getPrawnsBySize(size) {
  return products.filter((p) => p.category === 'prawns' && p.size === size);
}

export function getPrawnsByHeadOption(headOption) {
  return products.filter((p) => p.category === 'prawns' && p.headOption === headOption);
}
