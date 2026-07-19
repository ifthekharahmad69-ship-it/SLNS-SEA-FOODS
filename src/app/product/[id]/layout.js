// src/app/product/[id]/layout.js
// Generates SEO metadata for each product page
// Google shows: product name, price, image in search results

import { getProductById } from '@/data/products';

export async function generateMetadata({ params }) {
  const product = getProductById(params.id);

  if (!product) {
    return {
      title: 'Product Not Found — SLNS Fresh Sea Foods',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slnsfresh.vercel.app';
  const description = product.description
    ? product.description.slice(0, 155)
    : `Buy fresh ${product.name} online — ₹${product.price}/${product.unit.replace('per ', '')}. ${product.weight}. Delivered fresh to your door in Amalapuram & nearby.`;

  return {
    title: `${product.name} — ₹${product.price} | SLNS Fresh Sea Foods`,
    description,
    keywords: [
      product.name,
      `fresh ${product.name}`,
      `${product.name} delivery`,
      `${product.name} Amalapuram`,
      'seafood delivery',
      'fresh fish delivery',
      'SLNS Fresh',
    ].join(', '),
    openGraph: {
      title: `${product.name} — ₹${product.price}`,
      description,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
      type: 'website',
      url: `${baseUrl}/product/${product.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ₹${product.price}`,
      description,
      images: [product.image],
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.id}`,
    },
  };
}

export default function ProductLayout({ children }) {
  return children;
}
