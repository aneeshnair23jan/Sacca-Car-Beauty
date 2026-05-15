import Link from 'next/link';
import { ArrowRight, BookOpen, Car, Gauge, ShieldCheck } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import { parseCmsContent } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const postIcons = [Car, ShieldCheck, Gauge];

export default function BlogPage({ cmsContent }) {
  const cms = cmsContent.blog;

  return (
    <div className="min-h-screen flex flex-col bg-[#070707]">
      <SEO title="Blog" description={cms.description} />
      <Navbar />
      <main className="flex-1">
        <section className="bg-black border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <p className="section-label">{cms.label}</p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white max-w-3xl">{cms.title}</h1>
            <p className="text-zinc-400 leading-8 mt-6 max-w-2xl">{cms.description}</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-4">
            {cms.posts.map((post, index) => {
              const Icon = postIcons[index % postIcons.length];
              return (
                <article key={post.title} className="card overflow-hidden">
                  <div className="hero-visual h-48 flex items-center justify-center">
                    <Icon className="w-16 h-16 text-white/80" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-red-500 font-bold uppercase mb-3">{post.category}</p>
                    <h2 className="text-xl font-display font-bold text-white leading-tight">{post.title}</h2>
                    <p className="text-sm text-zinc-500 leading-7 mt-4">{post.excerpt}</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 mt-6 uppercase">
                      Request Topic <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 glass p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <BookOpen className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-white font-bold">{cms.label} content is admin editable</h2>
                <p className="text-sm text-zinc-500 mt-1">Posts shown here are stored inside the MongoDB CMS content setting.</p>
              </div>
            </div>
            <Link href="/admin/content" className="btn-outline">Edit Content</Link>
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
