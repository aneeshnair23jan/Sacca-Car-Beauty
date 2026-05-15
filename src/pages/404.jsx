import Link from 'next/link';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="text-9xl font-extrabold text-primary-100 select-none">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="btn-primary py-3 px-8">Go Home</Link>
          <Link href="/shop" className="btn-secondary py-3 px-8">Browse Shop</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  try {
    const initialSettings = await getSettingsFromDb();
    return { props: { initialSettings } };
  } catch {
    return { props: { initialSettings: {} } };
  }
}
