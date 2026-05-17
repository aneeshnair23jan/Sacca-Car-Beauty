import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Twitter } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { parseCmsContent } from '@/lib/cms';

export default function Footer() {
  const { settings } = useSettings();
  const cms = parseCmsContent(settings);
  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}`;

  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-zinc-600 pb-24 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <p className="section-label">Sacca Car Beauty</p>
            <h2 className="text-3xl font-extrabold text-[#111111] mb-4">
              {cms.global.footerTitle}
            </h2>
            <p className="text-sm leading-7 text-zinc-500 max-w-md">
              {cms.global.footerDescription || settings.shop_description}
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Twitter].map((Icon, index) => (
                <a key={index} href="#" className="w-10 h-10 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:text-[#111111] hover:border-[#8DFF2F] hover:bg-[#8DFF2F]/15 transition-colors" aria-label="Social link">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterList
            title="Explore"
            links={[
              { href: '/shop', label: 'All Products' },
              { href: '/about', label: 'About Us' },
              { href: '/blog', label: 'Blog' },
              { href: '/contact', label: 'Contact' },
            ]}
          />
          <FooterList
            title="Shop"
            links={[
              { href: '/shop?featured=1', label: 'Featured' },
              { href: '/shop?best_seller=1', label: 'Best Sellers' },
              { href: '/shop?new_launch=1', label: 'New Launches' },
              { href: '/wishlist', label: 'Wishlist' },
            ]}
          />

          <div>
            <h3 className="text-[#111111] text-sm font-bold uppercase mb-5">Contact</h3>
            <div className="space-y-4 text-sm">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#111111] transition-colors">
                <MessageCircle className="w-4 h-4 text-[#00A83D]" />
                {settings.whatsapp_number || 'WhatsApp'}
              </a>
              <span className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#00A83D]" />
                {cms.global.support}
              </span>
              <span className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#00A83D]" />
                {cms.global.email}
              </span>
              <span className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00A83D]" />
                {cms.global.delivery}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>Copyright {new Date().getFullYear()} {settings.shop_name || 'Sacca Car Beauty'}. All rights reserved.</p>
          <a
            href="https://touchpointe.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#111111] transition-colors"
          >
            Powered by touchpointe.digital
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }) {
  return (
    <div>
      <h3 className="text-[#111111] text-sm font-bold uppercase mb-5">{title}</h3>
      <ul className="space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-[#111111] transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
