import ProductForm from '@/components/AdminProductForm';

export default function NewProduct() {
  return <ProductForm />;
}

export async function getServerSideProps() {
  const { getSettingsFromDb } = await import('@/lib/getSettings');
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}
