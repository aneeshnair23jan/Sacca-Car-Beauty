import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowRight, BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight,
  MessageCircle, Shield, Sparkles, Star, Wrench,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getSettingsFromDb } from '@/lib/getSettings';
import { parseCmsContent } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { useSettings } from '@/context/SettingsContext';
import { fallbackCategories, getCategoryImage } from '@/lib/categoryImages';

const qualityIcons = [Shield, BadgeCheck, Wrench, Sparkles];

export default function HomePage({ cmsContent }) {
  const { settings } = useSettings();
  const cms = cmsContent.homepage;
  const storyRef = useRef(null);
  const categoryTrackRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}`;
  const displayCategories = categories.length ? categories : fallbackCategories;

  const storeJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: settings.shop_name || cms.hero.title,
    description: settings.shop_description || cms.hero.description,
    telephone: settings.whatsapp_number || '',
  }), [settings, cms.hero.description, cms.hero.title]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?featured=1&limit=8'),
      axios.get('/api/products?best_seller=1&limit=8'),
      axios.get('/api/categories'),
    ]).then(([featured, best, categoryRes]) => {
      setFeaturedProducts(featured.data.products || []);
      setBestSellers(best.data.products || []);
      setCategories(categoryRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let lenis;
    let rafId;
    let ctx;

    async function setupScroll() {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, smoothWheel: true });
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);

      ctx = gsap.context(() => {
        gsap.utils.toArray('.reveal-copy').forEach((el) => {
          gsap.fromTo(el, { y: 36, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          });
        });

      });
    }

    setupScroll();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <SEO
        title={cms.hero.title}
        description={cms.hero.description}
        jsonLd={storeJsonLd}
      />
      <Navbar />

      <main className="flex-1">
        <HeroSection hero={cms.hero} />
        <StoryIntro whatsappHref={whatsappHref} story={cms.story} />
        <CategoryShowcase categories={displayCategories} section={cms.categorySection} trackRef={categoryTrackRef} />
        <QualitySection features={cms.features} section={cms.featuresSection} />
        <ProductCollection
          loading={loading}
          products={bestSellers.length ? bestSellers : featuredProducts}
          section={cms.productSections}
        />
        <ScrollStory storyRef={storyRef} items={cms.installShowcase} label={cms.installLabel} />
        <WhatsAppCheckout whatsappHref={whatsappHref} cta={cms.cta} steps={cms.checkoutSteps} />
        <Testimonials testimonials={cms.testimonials} section={cms.testimonialsSection} />
        <ContactCTA whatsappHref={whatsappHref} cta={cms.cta} />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection({ hero }) {
  return (
    <section className="relative min-h-[300px] overflow-hidden bg-[#111111] text-white sm:min-h-[560px] md:min-h-[calc(100vh-116px)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-car-real.png"
        alt="Premium car with automotive accessories"
        className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-90 sm:object-[62%_center] md:object-center md:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/98 via-[#111111]/78 to-[#111111]/38 md:from-[#111111]/92 md:via-[#111111]/62 md:to-[#111111]/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/32 to-[#111111]/10 md:from-[#111111]/72 md:via-transparent md:to-[#111111]/18" />
      <div className="absolute inset-0 surface-grid opacity-10" />

      <div className="relative mx-auto flex min-h-[300px] max-w-7xl items-end px-4 pb-4 pt-8 sm:min-h-[560px] sm:px-6 sm:pb-14 md:min-h-[calc(100vh-116px)] md:items-center md:py-14 lg:px-8">
        <div className="max-w-[21rem] sm:max-w-2xl md:max-w-3xl reveal-copy">
          <p className="mb-2.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#8DFF2F] sm:mb-4 sm:text-xs sm:tracking-[0.22em]">
            {hero.label}
          </p>
          <h1 className="text-[1.85rem] font-extrabold leading-[1.02] text-white sm:text-5xl sm:leading-[0.98] md:text-6xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-3.5 max-w-[19rem] text-[12px] leading-5 text-white/82 sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-8 sm:text-white/76">
            {hero.description}
          </p>
          <div className="mt-4 grid gap-2.5 sm:mt-7 sm:flex sm:flex-row sm:gap-3">
            <Link href="/shop" className="btn-primary w-full px-5 py-3 sm:w-auto sm:px-8 sm:py-4">
              {hero.primaryCta} <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#collection" className="btn-outline w-full border-white px-5 py-3 text-white hover:bg-white hover:text-[#111111] sm:w-auto sm:px-8 sm:py-4">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryIntro({ whatsappHref, story }) {
  return (
    <section className="bg-[#F5F7F8] py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <div className="reveal-copy">
          <p className="section-label">{story.label}</p>
          <h2 className="section-title">{story.title}</h2>
          <p className="mt-6 text-zinc-600 leading-8">
            {story.description}
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-dark mt-8">
            <MessageCircle className="w-4 h-4" /> Talk to a specialist
          </a>
        </div>
        <div className="relative min-h-[260px] sm:min-h-96 rounded-2xl sm:rounded-[32px] border border-white brand-glow overflow-hidden reveal-copy bg-[#111111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/home-interior-accessories.png"
            alt="Premium car interior with fitted accessories"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-white/15" />
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 glass p-3 sm:p-4 max-w-[190px] sm:max-w-[220px]">
            <p className="text-sm font-bold">{story.cards?.[0]?.title}</p>
            <p className="text-xs text-zinc-500 mt-1">{story.cards?.[0]?.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ categories, section, trackRef }) {
  const cardStep = 304;
  const [cursor, setCursor] = useState(categories.length);
  const [animateLoop, setAnimateLoop] = useState(true);
  const loopCategories = categories.length ? [...categories, ...categories, ...categories] : [];
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  });
  const scrollDrift = useTransform(scrollYProgress, [0, 1], [cardStep * 0.45, -cardStep * 0.45]);

  useEffect(() => {
    setAnimateLoop(false);
    setCursor(categories.length);
    const frame = requestAnimationFrame(() => setAnimateLoop(true));
    return () => cancelAnimationFrame(frame);
  }, [categories.length]);

  const move = (direction) => {
    if (!categories.length) return;
    setAnimateLoop(true);
    setCursor((current) => current + direction);
  };

  const handleLoopComplete = () => {
    if (!categories.length) return;
    if (cursor >= categories.length * 2) {
      setAnimateLoop(false);
      setCursor(categories.length);
      requestAnimationFrame(() => setAnimateLoop(true));
    }
    if (cursor < categories.length) {
      setAnimateLoop(false);
      setCursor(categories.length * 2 - 1);
      requestAnimationFrame(() => setAnimateLoop(true));
    }
  };

  return (
    <section ref={trackRef} className="bg-white py-14 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">{section.label}</p>
          <h2 className="section-title">{section.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            className="w-11 h-11 rounded-full border border-[#E5E7EB] bg-white text-[#111111] shadow-sm transition-all hover:border-[#8DFF2F] hover:bg-[#8DFF2F]/15"
            aria-label="Previous category"
          >
            <ChevronLeft className="mx-auto w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="w-11 h-11 rounded-full border border-[#E5E7EB] bg-[#111111] text-white shadow-sm transition-all hover:border-[#8DFF2F] hover:bg-[#8DFF2F] hover:text-[#111111]"
            aria-label="Next category"
          >
            <ChevronRight className="mx-auto w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="relative">
        <motion.div
          style={{ x: scrollDrift }}
          className="min-w-max"
        >
          <motion.div
            className="flex gap-4 px-4 sm:px-6 lg:px-8 min-w-max"
            animate={{ x: -cursor * cardStep }}
            transition={animateLoop ? { type: 'spring', stiffness: 150, damping: 28 } : { duration: 0 }}
            onAnimationComplete={handleLoopComplete}
          >
            {loopCategories.map((category, index) => {
              const name = typeof category === 'string' ? category : category.name;
              const imageUrl = typeof category === 'string' ? null : category.image_url;
              const displayIndex = (index % categories.length) + 1;
              return (
                <Link
                  key={`${name}-${index}`}
                  href={`/shop?search=${encodeURIComponent(name)}`}
                  className="group relative w-72 h-72 flex-shrink-0 rounded-[28px] bg-[#111111] border border-[#E5E7EB] overflow-hidden p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-[#8DFF2F] hover:shadow-card-hover"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl || getCategoryImage(name)}
                    alt={`${name} category`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#111111]/88 via-[#111111]/35 to-transparent" />
                  <span className="relative text-6xl font-display font-bold text-white/18">{String(displayIndex).padStart(2, '0')}</span>
                  <span className="relative">
                    <span className="block text-2xl font-display font-bold text-white drop-shadow-sm">{name}</span>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#8DFF2F]">Explore <ChevronRight className="w-4 h-4" /></span>
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}


function QualitySection({ features, section }) {
  return (
    <section className="bg-[#F5F7F8] py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
        <div className="lg:sticky lg:top-28 h-max reveal-copy">
          <p className="section-label">{section.label}</p>
          <h2 className="section-title">{section.title}</h2>
          <p className="mt-6 text-zinc-600 leading-8">
            {section.description}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(({ title, text }, index) => {
            const Icon = qualityIcons[index % qualityIcons.length];
            return (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08 }}
              className="card p-4 sm:p-6 min-h-44 sm:min-h-56"
            >
              <Icon className="w-7 h-7 text-[#00A83D] mb-6" />
              <h3 className="text-xl font-bold text-[#111111]">{title}</h3>
              <p className="mt-3 text-sm text-zinc-600 leading-7">{text}</p>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductCollection({ loading, products, section }) {
  return (
    <section id="collection" className="bg-white py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12 reveal-copy">
          <div>
            <p className="section-label">{section.bestSellersLabel}</p>
            <h2 className="section-title">{section.bestSellersTitle}</h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-bold text-[#00A83D] hover:text-[#111111] uppercase">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

function ScrollStory({ storyRef, items, label }) {
  return (
    <section ref={storyRef} className="bg-[#111111] text-white py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1fr] gap-12">
        <div className="relative lg:sticky lg:top-24 h-[320px] sm:h-[420px] lg:h-[560px] rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-white/12 to-white/5 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 surface-grid opacity-20" />
          <div className="relative h-full flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/story-protect-interior.png"
              alt="Protected premium car interior with fitted accessories"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/72 via-[#111111]/20 to-transparent" />
          </div>
        </div>
        <div className="space-y-16 md:space-y-28 py-4 md:py-8">
          {items.map((step, index) => (
            <div key={step.title} className="min-h-[260px] md:min-h-[360px] reveal-copy">
              <p className="text-[#8DFF2F] text-sm font-bold uppercase tracking-[0.18em]">{label} {index + 1}</p>
              <h2 className="mt-4 text-3xl md:text-6xl font-display font-bold leading-tight text-white">{step.title}</h2>
              <p className="mt-6 text-white/68 leading-8 max-w-xl">{step.text}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(step.details || []).map((detail, detailIndex) => (
                  <div
                    key={detail.title}
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.105),rgba(255,255,255,0.035))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#8DFF2F]/55 hover:bg-white/[0.09]"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8DFF2F]/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8DFF2F] text-xs font-extrabold text-[#111111] shadow-[0_0_24px_rgba(141,255,47,0.26)]">
                        {String(detailIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <p className="text-base font-extrabold text-white">{detail.title}</p>
                    <p className="mt-3 text-sm leading-6 text-white/62">{detail.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppCheckout({ whatsappHref, cta, steps }) {
  return (
    <section className="bg-[#F5F7F8] py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
        <div className="reveal-copy">
          <p className="section-label">{cta.eyebrow}</p>
          <h2 className="section-title">{cta.title}</h2>
          <p className="mt-6 text-zinc-600 leading-8">
            {cta.description}
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 animate-pulse">
            <MessageCircle className="w-4 h-4" /> {cta.button}
          </a>
        </div>
        <div className="card p-6 reveal-copy">
          {steps.map((item, index) => (
            <div key={item.title} className="flex items-center gap-4 py-4 border-b border-[#E5E7EB] last:border-0">
              <span className="w-10 h-10 rounded-full bg-[#8DFF2F] text-[#111111] flex items-center justify-center font-bold">{index + 1}</span>
              <div>
                <p className="font-bold text-[#111111]">{item.title}</p>
                <p className="text-sm text-zinc-500">{item.text}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#00A83D] ml-auto hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ testimonials, section }) {
  return (
    <section className="bg-white py-14 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="section-label">{section.label}</p>
        <h2 className="section-title">{section.title}</h2>
        <div className="mt-12 flex gap-4">
          {testimonials.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ y: -8 }}
              className="card p-4 sm:p-6 min-w-[240px] sm:min-w-[360px]"
            >
              <div className="flex gap-1 text-[#8DFF2F] mb-5">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
              <p className="text-zinc-700 leading-7">"{item.quote}"</p>
              <p className="mt-6 text-sm font-bold text-[#111111]">{item.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTA({ whatsappHref, cta }) {
  const [form, setForm] = useState({ name: '', phone: '', vehicle: '', requirement: '' });
  const [phoneError, setPhoneError] = useState('');
  const eyebrow = cta.eyebrow?.trim() || 'Order via WhatsApp';
  const title = cta.title?.trim() || 'Ready to upgrade your drive?';
  const description = cta.description?.trim() || 'Send us your vehicle details and cart. We will confirm compatibility, availability, and delivery.';
  const button = 'Connect with us';

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      setPhoneError('Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    const lines = [
      `*New Inquiry - Sacca Car Beauty*`,
      '',
      '*Customer Details:*',
      `Name: ${form.name || 'Not provided'}`,
      `Phone: ${phoneDigits}`,
      `Vehicle: ${form.vehicle || 'Not provided'}`,
      '',
      '*Requirement:*',
      form.requirement || 'Not provided',
    ];

    window.open(`${whatsappHref}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    setForm({ name: '', phone: '', vehicle: '', requirement: '' });
    setPhoneError('');
  };

  return (
    <section className="relative overflow-hidden bg-[#111111] text-white py-14 md:py-24">
      <div className="absolute inset-0 surface-grid opacity-10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.88fr_1.12fr] gap-12 items-center">
        <div className="reveal-copy max-w-xl">
          <p className="text-[#8DFF2F] text-sm font-bold uppercase tracking-[0.18em] mb-4">{eyebrow}</p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold leading-tight text-white">
            {title}
          </h2>
          <p className="mt-6 text-base text-white/72 leading-8">
            {description}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Compatibility check', 'Stock confirmation', 'Delivery guidance'].map((item) => (
              <div key={item} className="border border-white/10 bg-white/5 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-[#8DFF2F] mb-2" />
                <p className="text-xs font-semibold text-white/82 leading-5">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <form
          className="reveal-copy border border-white/12 bg-white/[0.06] p-5 sm:p-8 space-y-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          onSubmit={handleSubmit}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="input-field"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            />
            <div>
              <input
                className={`input-field ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                placeholder="Phone"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => {
                  setPhoneError('');
                  setForm((current) => ({ ...current, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }));
                }}
                aria-invalid={phoneError ? 'true' : 'false'}
              />
              {phoneError && <p className="mt-1.5 text-xs font-semibold text-red-300">{phoneError}</p>}
            </div>
          </div>
          <input
            className="input-field"
            placeholder="Vehicle model"
            value={form.vehicle}
            onChange={(e) => setForm((current) => ({ ...current, vehicle: e.target.value }))}
          />
          <textarea
            className="input-field resize-none min-h-32"
            rows={4}
            placeholder="Requirement"
            value={form.requirement}
            onChange={(e) => setForm((current) => ({ ...current, requirement: e.target.value }))}
          />
          <button type="submit" className="btn-primary w-full">
            <MessageCircle className="w-4 h-4" /> {button}
          </button>
          <p className="text-center text-xs text-white/45">Your details open as a ready-to-send WhatsApp message.</p>
        </form>
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-5 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  const cmsContent = parseCmsContent(initialSettings);
  return { props: { initialSettings, cmsContent } };
}
