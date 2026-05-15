import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import { parseCmsContent } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useSettings } from '@/context/SettingsContext';

export default function ContactPage({ cmsContent }) {
  const { settings } = useSettings();
  const cms = cmsContent.contact;
  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(cms.whatsappMessage)}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#070707]">
      <SEO title="Contact" description={cms.description} />
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden surface-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-[#070707]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div>
              <p className="section-label">{cms.label}</p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight">{cms.title}</h1>
              <p className="text-zinc-400 leading-8 mt-6">{cms.description}</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 px-8 py-4">
                <MessageCircle className="w-4 h-4" /> Start WhatsApp Chat
              </a>
            </div>

            <div className="card p-6">
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <Info icon={MessageCircle} label="WhatsApp" value={settings.whatsapp_number || 'Available on request'} />
                <Info icon={Phone} label="Support" value={cms.support} />
                <Info icon={Mail} label="Email" value={cms.email} />
                <Info icon={MapPin} label="Delivery" value={cms.delivery} />
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input className="input-field" placeholder="Your name" />
                <input className="input-field" placeholder="Phone number" />
                <input className="input-field" placeholder="Vehicle brand, model, year" />
                <textarea className="input-field resize-none" rows={4} placeholder="What upgrade are you planning?" />
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                  <Send className="w-4 h-4" /> Send via WhatsApp
                </a>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="bg-black/40 rounded border border-white/10 p-4">
      <Icon className="w-5 h-5 text-red-500 mb-3" />
      <p className="text-xs text-zinc-500 uppercase font-bold">{label}</p>
      <p className="text-sm text-white mt-1">{value}</p>
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  const cmsContent = parseCmsContent(initialSettings);
  return { props: { initialSettings, cmsContent } };
}
