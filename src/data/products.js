// Amma Sea Foods — Product Database
// Categories: Prawns, Fish, Crabs, Dry Seafood

export const categories = [
  {
    id: 'prawns',
    name: 'Prawns',
    slug: 'prawns',
    description: 'Fresh White & Tiger Prawns — Small, Medium & Large, Headless or With Head',
    image: '/images/prawn/medium-prawns.png',
    icon: '🦐',
    count: 0,
  },
  {
    id: 'fish',
    name: 'Fish',
    slug: 'fish',
    description: 'Fresh sea fish — Mullet, Seer Fish, Black Pomfret & Sea Bass',
    image: '/images/fish/seerfish.png',
    icon: '🐟',
    count: 0,
  },
  {
    id: 'crabs',
    name: 'Crabs',
    slug: 'crabs',
    description: 'Premium live & cleaned crabs — Egg Crab, Red Big Crab, Mud Crab & Blue Swimmer',
    image: '/images/crab/mud-crab.png',
    icon: '🦀',
    count: 0,
  },
];

export const products = [
  // ============================================================
  // FISH PRODUCTS
  // ============================================================
  {
    id: 'fish-small-mullet',
    name: 'Small Mullet Fish',
    description: 'Fresh Small Mullet Fish, whole & cleaned. Tender white meat perfect for coastal fish curries and tawa fry.',
    category: 'fish',
    type: 'raw',
    price: 220,
    originalPrice: 280,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: 'Bestseller',
    image: '/images/fish/small-mullet-fish.png',
    images: ['/images/fish/small-mullet-fish.png'],
    rating: 4.8,
    reviewsCount: 36,
    freshness: 'Sea Fresh',
    serves: '3-4 people',
    tags: ['fish', 'small-mullet', 'bestseller', 'raw'],
  },
  {
    id: 'fish-seer-vanjaram',
    name: 'Seer Fish (Vanjaram)',
    description: 'Premium King Fish / Vanjaram steaks. Firm white flesh with single bone, ideal for tawa fry and rich fish curries.',
    category: 'fish',
    type: 'raw',
    price: 680,
    originalPrice: 820,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: 'Bestseller',
    image: '/images/fish/seerfish.png',
    images: ['/images/fish/seerfish.png'],
    rating: 4.9,
    reviewsCount: 112,
    freshness: 'Sea Fresh',
    serves: '3-4 people',
    tags: ['fish', 'seer-fish', 'vanjaram', 'steaks', 'bestseller', 'raw'],
  },
  {
    id: 'fish-black-pomfret',
    name: 'Black Pomfret',
    description: 'Fresh Black Pomfret, whole cleaned. Soft buttery texture, excellent for whole fish fry and stuffing.',
    category: 'fish',
    type: 'raw',
    price: 580,
    originalPrice: 700,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: 'Premium',
    image: '/images/fish/blackpomfretfish.png',
    images: ['/images/fish/blackpomfretfish.png'],
    rating: 4.8,
    reviewsCount: 65,
    freshness: 'Sea Fresh',
    serves: '2-3 people',
    tags: ['fish', 'pomfret', 'black-pomfret', 'whole', 'raw'],
  },
  {
    id: 'fish-sea-bass-koduva',
    name: 'Sea Bass (Koduva)',
    description: 'Fresh Sea Bass / Koduva. Mild sweet flavor with delicate flaky fillets, great for baking and frying.',
    category: 'fish',
    type: 'raw',
    price: 520,
    originalPrice: 640,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: false,
    isFeatured: false,
    badge: null,
    image: '/images/fish/sea-bass-fish.png',
    images: ['/images/fish/sea-bass-fish.png'],
    rating: 4.7,
    reviewsCount: 41,
    freshness: 'Sea Fresh',
    serves: '2-3 people',
    tags: ['fish', 'sea-bass', 'koduva', 'raw'],
  },
  {
    id: 'fish-tuna',
    name: 'Tuna Fish',
    description: 'Fresh ocean Tuna steaks. Meaty texture, rich in Omega-3 protein.',
    category: 'fish',
    type: 'raw',
    price: 450,
    originalPrice: 550,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: false,
    badge: 'Fresh Catch',
    image: '/images/fish/tuna.png',
    images: ['/images/fish/tuna.png'],
    rating: 4.7,
    reviewsCount: 25,
    freshness: 'Sea Fresh',
    serves: '3-4 people',
    tags: ['fish', 'tuna', 'raw'],
  },

  // ============================================================
  // PRAWN PRODUCTS
  // ============================================================
  {
    id: 'prawn-white-small-headless',
    name: 'White Prawns — Small (Headless)',
    description: 'Fresh small White Prawns, neatly cleaned and headless. Ideal for prawn fry, soups, and fried rice.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'small',
    headOption: 'headless',
    price: 260,
    originalPrice: 280,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: false,
    isFeatured: false,
    badge: null,
    image: '/images/prawn/small-prawns-headless.png',
    images: ['/images/prawn/small-prawns-headless.png'],
    rating: 5.0,
    reviewsCount: 42,
    freshness: 'Catch of the Day',
    serves: '2-3 people',
    tags: ['prawns', 'white-prawns', 'small', 'headless', 'raw'],
  },
  {
    id: 'prawn-white-small-withhead',
    name: 'White Prawns — Small (With Head)',
    description: 'Fresh small White Prawns whole with head. Perfect for rich coastal curries where head juices enhance flavor.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'small',
    headOption: 'with-head',
    price: 230,
    originalPrice: 268,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: false,
    isFeatured: false,
    badge: null,
    image: '/images/prawn/small-prawns-with-head.png',
    images: ['/images/prawn/small-prawns-with-head.png'],
    rating: 5.0,
    reviewsCount: 28,
    freshness: 'Catch of the Day',
    serves: '2-3 people',
    tags: ['prawns', 'white-prawns', 'small', 'with-head', 'raw'],
  },
  {
    id: 'prawn-white-medium-headless',
    name: 'White Prawns — Medium (Headless)',
    description: 'Succulent medium White Prawns, deveined and headless. Great for garlic butter prawns, biryani, and masala fry.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'medium',
    headOption: 'headless',
    price: 360,
    originalPrice: 440,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: 'Bestseller',
    image: '/images/prawn/medium-prawns-headless.png',
    images: ['/images/prawn/medium-prawns-headless.png'],
    rating: 5.0,
    reviewsCount: 76,
    freshness: 'Catch of the Day',
    serves: '3-4 people',
    tags: ['prawns', 'white-prawns', 'medium', 'headless', 'bestseller', 'raw'],
  },
  {
    id: 'prawn-white-medium-withhead',
    name: 'White Prawns — Medium (With Head)',
    description: 'Fresh medium White Prawns with head intact. Imparts rich seafood flavor to traditional curry preparations.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'white',
    size: 'medium',
    headOption: 'with-head',
    price: 320,
    originalPrice: 400,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: "Today's Catch",
    image: '/images/prawn/medium-prawns.png',
    images: ['/images/prawn/medium-prawns.png'],
    rating: 5.0,
    reviewsCount: 35,
    freshness: 'Catch of the Day',
    serves: '3-4 people',
    tags: ['prawns', 'white-prawns', 'medium', 'with-head', 'raw'],
  },
  {
    id: 'prawn-big-tiger',
    name: 'Big Tiger Prawns',
    description: 'Jumbo size Black Tiger Prawns with robust texture and sweet, lobster-like flavor.',
    category: 'prawns',
    type: 'raw',
    prawnType: 'tiger',
    size: 'large',
    headOption: 'with-head',
    price: 680,
    originalPrice: 780,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: 'Premium',
    image: '/images/prawn/big-tiger-prawns.jpg',
    images: ['/images/prawn/big-tiger-prawns.jpg'],
    rating: 5.0,
    reviewsCount: 45,
    freshness: 'Wild Caught',
    serves: '3-4 people',
    tags: ['prawns', 'tiger-prawns', 'big', 'premium', 'raw'],
  },

  // ============================================================
  // CRAB PRODUCTS
  // ============================================================
  {
    id: 'crab-mud-big',
    name: 'Mud Crab (Live / Cleaned)',
    description: 'Large meaty Mud Crabs with sweet claw meat. Handpicked live crabs cleaned upon order.',
    category: 'crabs',
    type: 'raw',
    price: 650,
    originalPrice: 750,
    unit: 'per kg',
    weight: '1 kg',
    weightGrams: 1000,
    inStock: true,
    isFeatured: true,
    badge: 'Fresh Catch',
    image: '/images/crab/mud-crab.png',
    images: ['/images/crab/mud-crab.png'],
    rating: 4.9,
    reviewsCount: 58,
    freshness: 'Live Handpicked',
    serves: '2-3 people',
    tags: ['crabs', 'mud-crab', 'live', 'raw'],
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
