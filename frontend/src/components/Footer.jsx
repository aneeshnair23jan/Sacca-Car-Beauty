import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MessageCircle, Mail, Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">{settings.shop_name}</div>
                <div className="text-xs text-primary-400">{settings.shop_tagline}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{settings.shop_description}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
              <li><Link to="/shop" className="hover:text-primary-400 transition-colors">Shop All Products</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">My Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <a
                href={`https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>WhatsApp: {settings.whatsapp_number}</span>
              </a>
              <p className="text-gray-500 text-xs mt-4">
                Order via WhatsApp — we'll confirm your order and arrange delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {settings.shop_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
