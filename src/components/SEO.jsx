import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSettings } from '@/context/SettingsContext';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sacca-car-beauty.com';

export default function SEO({
  title,
  description,
  canonical,
  image = '/og-image.jpg',
  type = 'website',
  jsonLd,
}) {
  const router = useRouter();
  const { settings } = useSettings();
  const siteName = settings.shop_name || 'Sacca Car Beauty';
  const pageTitle = title ? `${title} | ${siteName}` : `${siteName} | Premium Car Accessories`;
  const pageDescription =
    description ||
    settings.shop_description ||
    'Premium car accessories, detailing essentials, lifestyle upgrades, and WhatsApp ordering for automotive enthusiasts.';
  const url = canonical || `${SITE_URL}${router.asPath === '/' ? '' : router.asPath}`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="theme-color" content="#070707" />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
