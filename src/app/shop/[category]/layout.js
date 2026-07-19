// src/app/shop/[category]/layout.js
// Generates SEO metadata for each shop category page

export async function generateMetadata({ params }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://slnsfresh.vercel.app';

  const CATEGORY_SEO = {
    fish: {
      title: 'Fresh Fish Online — Buy Fish in Amalapuram | SLNS Fresh',
      description: 'Order fresh fish online in Amalapuram — Rohu, Catla, Pomfret, Kingfish and more. Wild-caught & farm-fresh fish delivered to your door.',
      keywords: 'fresh fish Amalapuram, buy fish online, fish delivery Amalapuram, rohu fish, catla fish, pomfret, kingfish delivery',
    },
    prawns: {
      title: 'Fresh Prawns Online — Tiger Prawns Delivery | SLNS Fresh',
      description: 'Buy fresh tiger prawns, vannamei prawns and more online in Amalapuram. Cleaned, deveined and delivered fresh.',
      keywords: 'fresh prawns Amalapuram, tiger prawns delivery, buy prawns online, vannamei prawns, prawn delivery',
    },
    crabs: {
      title: 'Fresh Crabs Online — Mud Crabs, Blue Crabs | SLNS Fresh',
      description: 'Order fresh live and cleaned crabs in Amalapuram — mud crabs, blue crabs, flower crabs. Delivered the same day.',
      keywords: 'fresh crabs Amalapuram, mud crab delivery, blue crab, flower crab, buy crabs online, crab delivery',
    },
    dishes: {
      title: 'Seafood Dishes — Andhra Style Cooked Seafood | SLNS Fresh',
      description: 'Authentic Andhra-style seafood curries and fry delivered fresh to your door. Fish curry, prawn fry, crab masala and more.',
      keywords: 'Andhra seafood dishes, fish curry delivery, prawn fry, crab masala, ready seafood dishes Amalapuram',
    },
  };

  const seo = CATEGORY_SEO[params.category] || CATEGORY_SEO.fish;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${baseUrl}/shop/${params.category}`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/shop/${params.category}`,
    },
  };
}

export default function ShopLayout({ children }) {
  return children;
}
