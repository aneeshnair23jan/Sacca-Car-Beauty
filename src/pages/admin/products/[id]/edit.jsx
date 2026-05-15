import { useRouter } from 'next/router';
import ProductForm from '@/components/AdminProductForm';

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  if (!id) return null;
  return <ProductForm productId={id} />;
}

export async function getServerSideProps() {
  const { getSettingsFromDb } = await import('@/lib/getSettings');
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}
