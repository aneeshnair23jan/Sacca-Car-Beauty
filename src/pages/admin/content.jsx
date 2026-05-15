import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { getSettingsFromDb } from '@/lib/getSettings';
import { defaultCmsContent } from '@/lib/cmsDefaults';

const empty = {
  metric: { value: '', label: '' },
  feature: { title: '', text: '' },
  brand: { name: '', models: [] },
  showcase: { title: '', text: '' },
  testimonial: { quote: '', name: '' },
  card: { title: '', text: '' },
  post: { title: '', category: '', excerpt: '' },
  operatingItem: '',
};

export default function AdminContent() {
  const [content, setContent] = useState(defaultCmsContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/content')
      .then((res) => setContent(res.data))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/content', content);
      setContent(res.data);
      toast.success('Website content saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const setPath = (path, value) => {
    setContent((current) => {
      const next = structuredClone(current);
      let target = next;
      path.slice(0, -1).forEach((key) => { target = target[key]; });
      target[path[path.length - 1]] = value;
      return next;
    });
  };

  const addItem = (path, item) => {
    setContent((current) => {
      const next = structuredClone(current);
      let target = next;
      path.forEach((key) => { target = target[key]; });
      target.push(structuredClone(item));
      return next;
    });
  };

  const removeItem = (path, index) => {
    setContent((current) => {
      const next = structuredClone(current);
      let target = next;
      path.forEach((key) => { target = target[key]; });
      target.splice(index, 1);
      return next;
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={save} className="max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Website Content</h1>
            <p className="text-gray-500 text-sm mt-1">Edit every public website section from MongoDB-backed content.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary py-3 px-6">
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Content'}
          </button>
        </div>

        <Panel title="Global Website Content">
          <Text value={content.global.announcement} label="Top Announcement Bar" onChange={(v) => setPath(['global', 'announcement'], v)} />
          <Text value={content.global.footerTitle} label="Footer Title" onChange={(v) => setPath(['global', 'footerTitle'], v)} />
          <Area value={content.global.footerDescription} label="Footer Description" onChange={(v) => setPath(['global', 'footerDescription'], v)} />
          <Grid>
            <Text value={content.global.email} label="Email" onChange={(v) => setPath(['global', 'email'], v)} />
            <Text value={content.global.delivery} label="Delivery Text" onChange={(v) => setPath(['global', 'delivery'], v)} />
            <Text value={content.global.support} label="Support Text" onChange={(v) => setPath(['global', 'support'], v)} />
          </Grid>
        </Panel>

        <Panel title="Homepage Hero">
          <Text value={content.homepage.hero.label} label="Eyebrow" onChange={(v) => setPath(['homepage', 'hero', 'label'], v)} />
          <Text value={content.homepage.hero.title} label="Title" onChange={(v) => setPath(['homepage', 'hero', 'title'], v)} />
          <Area value={content.homepage.hero.description} label="Description" onChange={(v) => setPath(['homepage', 'hero', 'description'], v)} />
          <Grid>
            <Text value={content.homepage.hero.primaryCta} label="Primary CTA" onChange={(v) => setPath(['homepage', 'hero', 'primaryCta'], v)} />
            <Text value={content.homepage.hero.secondaryCta} label="Secondary CTA" onChange={(v) => setPath(['homepage', 'hero', 'secondaryCta'], v)} />
            <Text value={content.homepage.hero.badge} label="Visual Badge" onChange={(v) => setPath(['homepage', 'hero', 'badge'], v)} />
            <Text value={content.homepage.hero.noteTitle} label="Note Title" onChange={(v) => setPath(['homepage', 'hero', 'noteTitle'], v)} />
          </Grid>
          <Area value={content.homepage.hero.noteText} label="Note Text" onChange={(v) => setPath(['homepage', 'hero', 'noteText'], v)} />
        </Panel>

        <ArrayPanel title="Homepage Metrics" path={['homepage', 'metrics']} items={content.homepage.metrics} add={() => addItem(['homepage', 'metrics'], empty.metric)} remove={removeItem}>
          {(item, index) => (
            <Grid>
              <Text value={item.value} label="Value" onChange={(v) => setPath(['homepage', 'metrics', index, 'value'], v)} />
              <Text value={item.label} label="Label" onChange={(v) => setPath(['homepage', 'metrics', index, 'label'], v)} />
            </Grid>
          )}
        </ArrayPanel>

        <ArrayPanel title="Homepage Feature Strip" path={['homepage', 'features']} items={content.homepage.features} add={() => addItem(['homepage', 'features'], empty.feature)} remove={removeItem}>
          {(item, index) => <TitleText item={item} onTitle={(v) => setPath(['homepage', 'features', index, 'title'], v)} onText={(v) => setPath(['homepage', 'features', index, 'text'], v)} />}
        </ArrayPanel>

        <Panel title="Homepage Brand Story">
          <Text value={content.homepage.story.label} label="Eyebrow" onChange={(v) => setPath(['homepage', 'story', 'label'], v)} />
          <Text value={content.homepage.story.title} label="Title" onChange={(v) => setPath(['homepage', 'story', 'title'], v)} />
          <Area value={content.homepage.story.description} label="Description" onChange={(v) => setPath(['homepage', 'story', 'description'], v)} />
        </Panel>

        <ArrayPanel title="Brand Story Cards" path={['homepage', 'story', 'cards']} items={content.homepage.story.cards} add={() => addItem(['homepage', 'story', 'cards'], empty.card)} remove={removeItem}>
          {(item, index) => <TitleText item={item} onTitle={(v) => setPath(['homepage', 'story', 'cards', index, 'title'], v)} onText={(v) => setPath(['homepage', 'story', 'cards', index, 'text'], v)} />}
        </ArrayPanel>

        <Panel title="Vehicle Compatibility Finder">
          <Text value={content.homepage.finder.label} label="Eyebrow" onChange={(v) => setPath(['homepage', 'finder', 'label'], v)} />
          <Text value={content.homepage.finder.title} label="Title" onChange={(v) => setPath(['homepage', 'finder', 'title'], v)} />
          <Text value={content.homepage.finder.years.join(', ')} label="Years (comma separated)" onChange={(v) => setPath(['homepage', 'finder', 'years'], csv(v))} />
          <ArrayPanel title="Vehicle Brands" path={['homepage', 'finder', 'brands']} items={content.homepage.finder.brands} add={() => addItem(['homepage', 'finder', 'brands'], empty.brand)} remove={removeItem} nested>
            {(item, index) => (
              <Grid>
                <Text value={item.name} label="Brand Name" onChange={(v) => setPath(['homepage', 'finder', 'brands', index, 'name'], v)} />
                <Text value={(item.models || []).join(', ')} label="Models (comma separated)" onChange={(v) => setPath(['homepage', 'finder', 'brands', index, 'models'], csv(v))} />
              </Grid>
            )}
          </ArrayPanel>
        </Panel>

        <Panel title="Homepage Category and Product Section Titles">
          <Grid>
            <Text value={content.homepage.categorySection.label} label="Category Eyebrow" onChange={(v) => setPath(['homepage', 'categorySection', 'label'], v)} />
            <Text value={content.homepage.categorySection.title} label="Category Title" onChange={(v) => setPath(['homepage', 'categorySection', 'title'], v)} />
            <Text value={content.homepage.productSections.bestSellersLabel} label="Best Sellers Eyebrow" onChange={(v) => setPath(['homepage', 'productSections', 'bestSellersLabel'], v)} />
            <Text value={content.homepage.productSections.bestSellersTitle} label="Best Sellers Title" onChange={(v) => setPath(['homepage', 'productSections', 'bestSellersTitle'], v)} />
            <Text value={content.homepage.productSections.newLaunchesLabel} label="New Launches Eyebrow" onChange={(v) => setPath(['homepage', 'productSections', 'newLaunchesLabel'], v)} />
            <Text value={content.homepage.productSections.newLaunchesTitle} label="New Launches Title" onChange={(v) => setPath(['homepage', 'productSections', 'newLaunchesTitle'], v)} />
            <Text value={content.homepage.productSections.featuredLabel} label="Featured Eyebrow" onChange={(v) => setPath(['homepage', 'productSections', 'featuredLabel'], v)} />
            <Text value={content.homepage.productSections.featuredTitle} label="Featured Title" onChange={(v) => setPath(['homepage', 'productSections', 'featuredTitle'], v)} />
          </Grid>
        </Panel>

        <Panel title="Installation Showcase Section Title">
          <Text value={content.homepage.installLabel} label="Section Eyebrow" onChange={(v) => setPath(['homepage', 'installLabel'], v)} />
        </Panel>

        <ArrayPanel title="Installation Showcase" path={['homepage', 'installShowcase']} items={content.homepage.installShowcase} add={() => addItem(['homepage', 'installShowcase'], empty.showcase)} remove={removeItem}>
          {(item, index) => <TitleText item={item} onTitle={(v) => setPath(['homepage', 'installShowcase', index, 'title'], v)} onText={(v) => setPath(['homepage', 'installShowcase', index, 'text'], v)} />}
        </ArrayPanel>

        <Panel title="Testimonials Section Title">
          <Grid>
            <Text value={content.homepage.testimonialsSection.label} label="Eyebrow" onChange={(v) => setPath(['homepage', 'testimonialsSection', 'label'], v)} />
            <Text value={content.homepage.testimonialsSection.title} label="Title" onChange={(v) => setPath(['homepage', 'testimonialsSection', 'title'], v)} />
          </Grid>
        </Panel>

        <ArrayPanel title="Testimonials" path={['homepage', 'testimonials']} items={content.homepage.testimonials} add={() => addItem(['homepage', 'testimonials'], empty.testimonial)} remove={removeItem}>
          {(item, index) => (
            <Grid>
              <Area value={item.quote} label="Quote" onChange={(v) => setPath(['homepage', 'testimonials', index, 'quote'], v)} />
              <Text value={item.name} label="Customer Name" onChange={(v) => setPath(['homepage', 'testimonials', index, 'name'], v)} />
            </Grid>
          )}
        </ArrayPanel>

        <Panel title="Homepage WhatsApp CTA">
          <Text value={content.homepage.cta.eyebrow} label="Eyebrow" onChange={(v) => setPath(['homepage', 'cta', 'eyebrow'], v)} />
          <Text value={content.homepage.cta.title} label="Title" onChange={(v) => setPath(['homepage', 'cta', 'title'], v)} />
          <Area value={content.homepage.cta.description} label="Description" onChange={(v) => setPath(['homepage', 'cta', 'description'], v)} />
          <Text value={content.homepage.cta.button} label="Button Text" onChange={(v) => setPath(['homepage', 'cta', 'button'], v)} />
        </Panel>

        <Panel title="About Page">
          <Text value={content.about.label} label="Eyebrow" onChange={(v) => setPath(['about', 'label'], v)} />
          <Text value={content.about.title} label="Title" onChange={(v) => setPath(['about', 'title'], v)} />
          <Area value={content.about.description} label="Description" onChange={(v) => setPath(['about', 'description'], v)} />
          <Text value={content.about.operatingTitle} label="Operating Section Title" onChange={(v) => setPath(['about', 'operatingTitle'], v)} />
        </Panel>

        <ArrayPanel title="About Cards" path={['about', 'cards']} items={content.about.cards} add={() => addItem(['about', 'cards'], empty.card)} remove={removeItem}>
          {(item, index) => <TitleText item={item} onTitle={(v) => setPath(['about', 'cards', index, 'title'], v)} onText={(v) => setPath(['about', 'cards', index, 'text'], v)} />}
        </ArrayPanel>

        <ArrayPanel title="About Operating Items" path={['about', 'operatingItems']} items={content.about.operatingItems} add={() => addItem(['about', 'operatingItems'], empty.operatingItem)} remove={removeItem}>
          {(item, index) => <Text value={item} label="Item" onChange={(v) => setPath(['about', 'operatingItems', index], v)} />}
        </ArrayPanel>

        <Panel title="Blog Page">
          <Text value={content.blog.label} label="Eyebrow" onChange={(v) => setPath(['blog', 'label'], v)} />
          <Text value={content.blog.title} label="Title" onChange={(v) => setPath(['blog', 'title'], v)} />
          <Area value={content.blog.description} label="Description" onChange={(v) => setPath(['blog', 'description'], v)} />
        </Panel>

        <ArrayPanel title="Blog Posts" path={['blog', 'posts']} items={content.blog.posts} add={() => addItem(['blog', 'posts'], empty.post)} remove={removeItem}>
          {(item, index) => (
            <div className="space-y-3">
              <Grid>
                <Text value={item.title} label="Title" onChange={(v) => setPath(['blog', 'posts', index, 'title'], v)} />
                <Text value={item.category} label="Category" onChange={(v) => setPath(['blog', 'posts', index, 'category'], v)} />
              </Grid>
              <Area value={item.excerpt} label="Excerpt" onChange={(v) => setPath(['blog', 'posts', index, 'excerpt'], v)} />
            </div>
          )}
        </ArrayPanel>

        <Panel title="Contact Page">
          <Text value={content.contact.label} label="Eyebrow" onChange={(v) => setPath(['contact', 'label'], v)} />
          <Text value={content.contact.title} label="Title" onChange={(v) => setPath(['contact', 'title'], v)} />
          <Area value={content.contact.description} label="Description" onChange={(v) => setPath(['contact', 'description'], v)} />
          <Grid>
            <Text value={content.contact.email} label="Email" onChange={(v) => setPath(['contact', 'email'], v)} />
            <Text value={content.contact.support} label="Support Text" onChange={(v) => setPath(['contact', 'support'], v)} />
            <Text value={content.contact.delivery} label="Delivery Text" onChange={(v) => setPath(['contact', 'delivery'], v)} />
            <Text value={content.contact.whatsappMessage} label="WhatsApp Message" onChange={(v) => setPath(['contact', 'whatsappMessage'], v)} />
          </Grid>
        </Panel>
      </form>
    </AdminLayout>
  );
}

function Panel({ title, children }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function ArrayPanel({ title, path, items, add, remove, children, nested = false }) {
  const Wrapper = nested ? 'div' : Panel;
  const props = nested ? { className: 'space-y-3' } : { title };
  return (
    <Wrapper {...props}>
      {nested && <h3 className="text-sm font-bold text-gray-800">{title}</h3>}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-end mb-3">
              <button type="button" onClick={() => remove(path, index)} className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
            {children(item, index)}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn-secondary py-2 px-4">
        <Plus className="w-4 h-4" /> Add {title}
      </button>
    </Wrapper>
  );
}

function TitleText({ item, onTitle, onText }) {
  return (
    <Grid>
      <Text value={item.title} label="Title" onChange={onTitle} />
      <Area value={item.text} label="Text" onChange={onText} />
    </Grid>
  );
}

function Grid({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Text({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </label>
  );
}

function Area({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} className="input-field resize-none" />
    </label>
  );
}

function csv(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}
