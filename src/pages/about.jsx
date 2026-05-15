import { BadgeCheck, Camera, MessageCircle, Shield, Sparkles, Wrench } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import { parseCmsContent } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const cardIcons = [Shield, Wrench, MessageCircle];
const operatingIcons = [Sparkles, Camera, BadgeCheck, MessageCircle];

export default function AboutPage({ cmsContent }) {
  const cms = cmsContent.about;

  return (
    <div className="min-h-screen flex flex-col bg-[#070707]">
      <SEO title="About" description={cms.description} />
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden surface-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/25 via-transparent to-[#070707]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label">{cms.label}</p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">{cms.title}</h1>
              <p className="mt-6 text-zinc-400 leading-8">{cms.description}</p>
            </div>
            <div className="hero-visual rounded-lg min-h-96 border border-white/10 red-glow overflow-hidden">
              <div className="car-silhouette mt-32"><span className="wheel wheel-left" /><span className="wheel wheel-right" /></div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-4">
            {cms.cards.map((item, index) => {
              const Icon = cardIcons[index % cardIcons.length];
              return (
                <div key={item.title} className="card p-6">
                  <Icon className="w-7 h-7 text-red-500 mb-5" />
                  <h2 className="text-white font-bold text-xl mb-3">{item.title}</h2>
                  <p className="text-sm text-zinc-500 leading-7">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-black border-y border-white/10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div>
              <p className="section-label">{cms.label}</p>
              <h2 className="section-title">{cms.operatingTitle}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {cms.operatingItems.map((text, index) => {
                const Icon = operatingIcons[index % operatingIcons.length];
                return (
                  <div key={text} className="glass p-5 flex gap-4">
                    <Icon className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-zinc-400 leading-6">{text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  const cmsContent = parseCmsContent(initialSettings);
  return { props: { initialSettings, cmsContent } };
}
