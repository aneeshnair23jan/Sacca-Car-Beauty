const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sacca-car-beauty.com';

const staticRoutes = [
  '',
  '/shop',
  '/cart',
  '/checkout',
  '/about',
  '/blog',
  '/contact',
  '/wishlist',
  '/account',
];

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes
  .map((route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`)
  .join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader('Content-Type', 'text/xml');
  res.write(generateSiteMap());
  res.end();

  return { props: {} };
}

export default function SiteMap() {
  return null;
}
