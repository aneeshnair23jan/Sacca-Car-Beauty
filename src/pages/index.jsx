import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowRight, BadgeCheck, Camera, ChevronRight, Gauge, HeartHandshake,
  MessageCircle, Play, Search, Shield, Sparkles, Star, Wrench, Zap,
} from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import { parseCmsContent } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { useSettings } from '@/context/SettingsContext';

const featureIcons = [Shield, Zap, Wrench, BadgeCheck];
const storyIcons = [Sparkles, Gauge, Camera, HeartHandshake];

export default function HomePage({ cmsContent }) {
  const { settings } = useSettings();
  const cms = cmsContent.homepage;
  const firstBrand = cms.finder.brands[0] || { name: '', models: [''] };
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newLaunches, setNewLaunches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finder, setFinder] = useState({
    brand: firstBrand.name,
    model: firstBrand.models[0] || '',
    year: cms.finder.years[0] || '',
  });

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?featured=1&limit=8'),
      axios.get('/api/products?best_seller=1&limit=8'),
      axios.get('/api/products?new_launch=1&limit=8'),
      axios.get('/api/categories'),
    ]).then(([featured, best, launches, categoryRes]) => {
      setFeaturedProducts(featured.data.products || []);
      setBestSellers(best.data.products || []);
      setNewLaunches(launches.data.products || []);
      setCategories((categoryRes.data || []).filter((item) => item.product_count > 0));
    }).finally(() => setLoading(false));
  }, []);

  const selectedBrand = cms.finder.brands.find((brand) => brand.name === finder.brand) || firstBrand;
  const models = selectedBrand.models || [];
  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}`;

  const productJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: settings.shop_name || cms.hero.title,
    description: settings.shop_description || cms.hero.description,
    telephone: settings.whatsapp_number || '',
    sameAs: [],
  }), [settings, cms.hero.title, cms.hero.description]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070707]">
      <SEO title={cms.hero.title} description={cms.hero.description} jsonLd={productJsonLd} />
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden surface-grid">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(220,38,38,0.24),transparent_32%),linear-gradient(180deg,rgba(7,7,7,0.35),#070707_88%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-112px)] py-16 lg:py-24 grid lg:grid-cols-[1fr_0.95fr] items-center gap-12">
            <div>
              <p className="section-label">{cms.hero.label}</p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[0.95] max-w-3xl">{cms.hero.title}</h1>
              <p className="mt-6 text-lg text-zinc-400 leading-8 max-w-xl">{cms.hero.description}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Link href="/shop" className="btn-primary px-8 py-4">{cms.hero.primaryCta} <ArrowRight className="w-4 h-4" /></Link>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-outline px-8 py-4">
                  <MessageCircle className="w-4 h-4" /> {cms.hero.secondaryCta}
                </a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3 max-w-xl">
                {cms.metrics.map((item) => (
                  <div key={`${item.value}-${item.label}`} className="glass p-4">
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-zinc-500 uppercase mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="hero-visual rounded-lg min-h-[420px] border border-white/10 overflow-hidden red-glow animate-slow-pan">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-16 px-5">
                  <div className="car-silhouette"><span className="wheel wheel-left" /><span className="wheel wheel-right" /></div>
                </div>
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase backdrop-blur">{cms.hero.badge}</span>
                  <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center"><Play className="w-5 h-5 fill-white" /></span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-4 sm:left-8 glass p-4 max-w-xs">
                <p className="text-sm font-semibold text-white">{cms.hero.noteTitle}</p>
                <p className="text-xs text-zinc-500 mt-1">{cms.hero.noteText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4">
            {cms.features.map((item, index) => {
              const Icon = featureIcons[index % featureIcons.length];
              return (
                <div key={item.title} className="p-5 md:p-7 border-white/10 odd:border-r md:border-r last:border-r-0">
                  <Icon className="w-5 h-5 text-red-500 mb-4" />
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-5 mt-2 hidden sm:block">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <p className="section-label">{cms.story.label}</p>
              <h2 className="section-title">{cms.story.title}</h2>
              <div className="accent-divider" />
              <p className="text-zinc-400 leading-8">{cms.story.description}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {cms.story.cards.map((item, index) => {
                const Icon = storyIcons[index % storyIcons.length];
                return (
                  <div key={item.title} className="card p-6">
                    <Icon className="w-6 h-6 text-red-500 mb-5" />
                    <h3 className="text-white font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-500 leading-6">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 border-y border-white/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader label={cms.finder.label} title={cms.finder.title} href={`/shop?search=${encodeURIComponent(`${finder.brand} ${finder.model}`)}`} cta="Search Products" />
            <div className="card p-5 md:p-6 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
              <Select label="Brand" value={finder.brand} onChange={(brandName) => {
                const brand = cms.finder.brands.find((item) => item.name === brandName) || firstBrand;
                setFinder({ brand: brand.name, model: brand.models[0] || '', year: finder.year });
              }} options={cms.finder.brands.map((brand) => brand.name)} />
              <Select label="Model" value={finder.model} onChange={(model) => setFinder({ ...finder, model })} options={models} />
              <Select label="Year" value={finder.year} onChange={(year) => setFinder({ ...finder, year })} options={cms.finder.years} />
              <Link href={`/shop?search=${encodeURIComponent(`${finder.brand} ${finder.model} ${finder.year}`)}`} className="btn-primary md:self-end">
                <Search className="w-4 h-4" /> Find
              </Link>
            </div>
          </div>
        </section>

        <CategorySection categories={categories} content={cms.categorySection} />
        <ProductSection loading={loading} label={cms.productSections.bestSellersLabel} title={cms.productSections.bestSellersTitle} products={bestSellers} href="/shop?best_seller=1" />
        <ProductSection loading={loading} label={cms.productSections.newLaunchesLabel} title={cms.productSections.newLaunchesTitle} products={newLaunches} href="/shop?new_launch=1" />
        <ProductSection loading={loading} label={cms.productSections.featuredLabel} title={cms.productSections.featuredTitle} products={featuredProducts} href="/shop?featured=1" />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-4">
            {cms.installShowcase.map((item) => (
              <div key={item.title} className="hero-visual rounded-lg min-h-72 p-6 flex flex-col justify-end overflow-hidden border border-white/10">
                <div className="car-silhouette scale-75 -mb-8"><span className="wheel wheel-left" /><span className="wheel wheel-right" /></div>
                <div className="relative z-10">
                  <p className="text-red-500 text-xs font-bold uppercase mb-2">{cms.installLabel}</p>
                  <h3 className="text-white text-2xl font-display font-bold">{item.title}</h3>
                  <p className="text-sm text-zinc-400 mt-2">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black border-y border-white/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader label={cms.testimonialsSection.label} title={cms.testimonialsSection.title} />
            <div className="grid md:grid-cols-3 gap-4">
              {cms.testimonials.map((item) => (
                <div key={item.quote} className="glass p-6">
                  <div className="flex text-red-500 gap-1 mb-5">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                  <p className="text-zinc-300 leading-7">"{item.quote}"</p>
                  <p className="text-xs text-zinc-500 uppercase mt-5">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-red-600 p-8 md:p-12">
            <div className="absolute inset-0 surface-grid opacity-20" />
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs uppercase font-bold text-white/70 mb-3">{cms.cta.eyebrow}</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white">{cms.cta.title}</h2>
              <p className="text-white/80 mt-4 leading-7">{cms.cta.description}</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 bg-white text-red-700 hover:bg-zinc-100 font-bold px-7 py-4 rounded uppercase text-sm">
                <MessageCircle className="w-4 h-4" /> {cms.cta.button}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SectionHeader({ label, title, cta = 'View All', href }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div><p className="section-label">{label}</p><h2 className="section-title">{title}</h2></div>
      {href && <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-400 uppercase">{cta} <ChevronRight className="w-4 h-4" /></Link>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      <span className="block text-xs font-bold uppercase text-zinc-500 mb-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function CategorySection({ categories, content }) {
  if (!categories.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader label={content.label} title={content.title} href="/shop" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.slice(0, 4).map((category, index) => (
          <Link key={category.id} href={`/shop?category=${category.id}`} className="group relative hero-visual rounded-lg min-h-64 p-6 overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <span className="text-5xl font-display text-white/10">0{index + 1}</span>
              <div><h3 className="text-2xl font-display font-bold text-white">{category.name}</h3><p className="text-sm text-zinc-400 mt-2">{category.product_count} products</p></div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSection({ loading, label, title, products, href }) {
  if (!loading && products.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SectionHeader label={label} title={title} href={href} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="card-dark overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3"><div className="h-3 skeleton rounded w-1/3" /><div className="h-4 skeleton rounded w-3/4" /><div className="h-5 skeleton rounded w-1/2" /></div>
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  const cmsContent = parseCmsContent(initialSettings);
  return { props: { initialSettings, cmsContent } };
}
