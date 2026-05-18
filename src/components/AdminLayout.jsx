import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Package, Tag, Settings, Menu, X, Car,
  ChevronRight, ExternalLink, LogOut, User, PanelsTopLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/content', label: 'Website Content', icon: PanelsTopLeft },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { admin, logout, isAuthenticated, hydrated } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated (after hydration)
  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [hydrated, isAuthenticated, router]);

  const isActive = (item) => {
    if (item.exact) return router.pathname === item.href;
    return router.pathname.startsWith(item.href);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  // Show nothing while checking auth
  if (!hydrated || !isAuthenticated) return null;

  const breadcrumb = router.pathname
    .split('/')
    .filter(Boolean)
    .slice(1)
    .join(' / ');

  return (
    <div className="admin-shell h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 text-white transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:flex lg:flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-xs">{settings.shop_name}</div>
              <div className="text-xs text-gray-400">Admin Portal</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive(item)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-700 space-y-2">
          <div className="flex items-center gap-2 px-1 mb-1">
            <div className="bg-gray-700 p-1.5 rounded-full">
              <User className="w-3.5 h-3.5 text-gray-300" />
            </div>
            <span className="text-xs text-gray-300 font-medium truncate">{admin?.username}</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-1"
          >
            <ExternalLink className="w-4 h-4" /> View Store
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full px-1"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white shadow-sm px-3 py-2.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Admin</span>
              {breadcrumb && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium capitalize">{breadcrumb}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-4 h-4" /> {admin?.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
