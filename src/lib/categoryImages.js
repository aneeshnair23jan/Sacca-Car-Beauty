export const fallbackCategories = [
  { name: 'Seat Covers', image_url: '/images/categories/seat-covers.png' },
  { name: 'Floor Mats', image_url: '/images/categories/floor-mats.png' },
  { name: 'LED Lights', image_url: '/images/categories/led-lights.png' },
  { name: 'Car Perfumes', image_url: '/images/categories/car-perfumes.png' },
  { name: 'Dash Cameras', image_url: '/images/categories/dash-cameras.png' },
  { name: 'Cleaning Kits', image_url: '/images/categories/cleaning-kits.png' },
  { name: 'Mobile Holders', image_url: '/images/categories/mobile-holders.png' },
  { name: 'Steering Covers', image_url: '/images/categories/steering-covers.png' },
];

const categoryImages = {
  'seat covers': '/images/categories/seat-covers.png',
  'floor mats': '/images/categories/floor-mats.png',
  'led lights': '/images/categories/led-lights.png',
  'car perfumes': '/images/categories/car-perfumes.png',
  'dash cameras': '/images/categories/dash-cameras.png',
  'cleaning kits': '/images/categories/cleaning-kits.png',
  'mobile holders': '/images/categories/mobile-holders.png',
  'steering covers': '/images/categories/steering-covers.png',
  interior: '/images/categories/interior.png',
  electronics: '/images/categories/dash-cameras.png',
  'car care': '/images/categories/cleaning-kits.png',
  exterior: '/images/categories/exterior.png',
  performance: '/images/categories/performance.png',
};

export function getCategoryImage(category) {
  const key = String(category || '').trim().toLowerCase();
  return categoryImages[key] || '/images/categories/floor-mats.png';
}
