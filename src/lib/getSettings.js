/**
 * Server-side helper — fetches settings from MongoDB directly (no HTTP round-trip).
 * Use inside getServerSideProps / getStaticProps.
 */
import { connectDb, Setting } from '@/lib/db';

export async function getSettingsFromDb() {
  await connectDb();
  const rows = await Setting.find().lean();
  const settings = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  return settings;
}
