import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowRight, BadgeCheck, Camera, Car, CheckCircle2, ChevronRight, Gauge,
  MessageCircle, Shield, Sparkles, Star, Truck, Wrench, Zap,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import SEO from '@/components/SEO';
import { useSettings } from '@/context/SettingsContext';

const categoriesFallback = [
  'Seat Covers',
  'Floor Mats',
  'LED Lights',
  'Car Perfumes',
  'Dash Cameras',
  'Cleaning Kits',
  'Mobile Holders',
  'Steering Covers',
];

const qualityCards = [
  { title: 'Durable Materials', text: 'Selected for heat, dust, wear, and daily road abuse.', icon: Shield },
  { title: 'Perfect Fit', text: 'Chosen around clean installation and vehicle-friendly fitment.', icon: BadgeCheck },
  { title: 'Easy Installation', text: 'Accessories that feel premium without making setup complicated.', icon: Wrench },
  { title: 'Stylish Finish', text: 'Modern textures, tight forms, and an OEM-plus visual language.', icon: Sparkles },
];

const storySteps = [
  {
    title: 'Protect Your Interior',
    text: 'Seat covers, floor mats, sunshades, and organizers preserve the cabin while keeping it refined.',
    items: ['Seat Covers', 'Floor Mats', 'Sunshades'],
  },
  {
    title: 'Upgrade Your Style',
    text: 'LED accents, trims, spoilers, and exterior details add performance energy without clutter.',
    items: ['LED Kits', 'Trims', 'Spoilers'],
  },
  {
    title: 'Drive Smarter',
    text: 'Dashcams, chargers, holders, and practical tech make every trip cleaner and easier.',
    items: ['Dashcams', 'Chargers', 'Holders'],
  },
  {
    title: 'Keep It Fresh',
    text: 'Perfumes, cleaning kits, microfiber essentials, and care products keep the car showroom-ready.',
    items: ['Perfumes', 'Detailing', 'Care Kits'],
  },
];

const testimonials = [
  { name: 'Aarav M.', quote: 'The fit and finish made my cabin feel like a higher trim car.' },
  { name: 'Priya S.', quote: 'Fast WhatsApp ordering, clean recommendations, and premium products.' },
  { name: 'Rohan K.', quote: 'The LED and mats combo changed the whole night-drive feel.' },
];

export default function HomePage() {
  const { settings } = useSettings();
  const storyRef = useRef(null);
  const categoryTrackRef = useRef(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}`;
  const categoryNames = categories.length ? categories.map((item) => item.name) : categoriesFallback;

  const storeJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: settings.shop_name || 'AutoLux Accessories',
    description: settings.shop_description || 'Premium car accessories with WhatsApp ordering.',
    telephone: settings.whatsapp_number || '',
  }), [settings]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?featured=1&limit=8'),
      axios.get('/api/products?best_seller=1&limit=8'),
      axios.get('/api/categories'),
    ]).then(([featured, best, categoryRes]) => {
      setFeaturedProducts(featured.data.products || []);
      setBestSellers(best.data.products || []);
      setCategories((categoryRes.data || []).filter((item) => item.product_count > 0));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let lenis;
    let rafId;
    let ctx;

    async function setupScroll() {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, smoothWheel: true });
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
      lenis.on('scroll', ScrollTrigger.update);

      ctx = gsap.context(() => {
        gsap.utils.toArray('.reveal-copy').forEach((el) => {
          gsap.fromTo(el, { y: 36, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          });
        });

        if (categoryTrackRef.current) {
          gsap.to(categoryTrackRef.current, {
            xPercent: -35,
            ease: 'none',
            scrollTrigger: {
              trigger: categoryTrackRef.current,
              start: 'top 80%',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }
      });
    }

    setupScroll();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <SEO
        title="AutoLux Accessories"
        description="Premium scroll-animation car accessories storefront with WhatsApp checkout."
        jsonLd={storeJsonLd}
      />
      <Navbar />

      <main className="flex-1">
        <CinematicCarStory />
        <StoryIntro whatsappHref={whatsappHref} />
        <CategoryShowcase categoryNames={categoryNames} trackRef={categoryTrackRef} />
        <QualitySection />
        <ProductCollection loading={loading} products={bestSellers.length ? bestSellers : featuredProducts} />
        <ScrollStory storyRef={storyRef} />
        <WhatsAppCheckout whatsappHref={whatsappHref} />
        <Testimonials />
        <ContactCTA whatsappHref={whatsappHref} />
      </main>

      <Footer />
    </div>
  );
}

function CinematicCarStory() {
  const sceneRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.025, 0.055], [1, 0.18, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.055], [0, -260]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.48, 1], [0.18, 0.38, 0.24]);

  return (
    <section ref={sceneRef} data-cinematic-section className="relative h-[360vh] bg-white">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#F5F7F8]">
        <div className="absolute inset-0 surface-grid opacity-50" />
        <motion.div style={{ opacity: glowOpacity }} className="absolute left-1/2 top-[58%] h-[46vw] max-h-[520px] w-[84vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8DFF2F] blur-[90px]" />

        <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-x-0 top-[8vh] z-20 px-4 text-center pointer-events-none">
          <p className="section-label">AutoLux Accessories</p>
          <h1 className="mx-auto max-w-6xl text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.9]">
            Redefine Your Drive
          </h1>
          <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3 pointer-events-auto">
            <Link href="/shop" className="btn-primary px-8 py-4">Shop Accessories <ArrowRight className="w-4 h-4" /></Link>
            <a href="#collection" className="btn-outline px-8 py-4">Explore Collection</a>
          </div>
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 pt-8">
          <div className="cinematic-model-frame">
            <ThreeCinematicCar progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreeCinematicCar({ progress }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let renderer;
    let frameId;
    let disposed = false;
    const unsubscribe = { current: null };

    async function setup() {
      const THREE = await import('three');
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
      if (disposed || !mountRef.current) return;

      const mount = mountRef.current;
      const scene = new THREE.Scene();
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 3.2, 8.4);
      camera.lookAt(0, 0.5, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mount.appendChild(renderer.domElement);

      const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe8dd, 2.8);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
      keyLight.position.set(4, 7, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      scene.add(keyLight);

      const limeLight = new THREE.PointLight(0x8dff2f, 32, 11);
      limeLight.position.set(0, 1.4, 2.4);
      scene.add(limeLight);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 8),
        new THREE.ShadowMaterial({ opacity: 0.13 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.08;
      floor.receiveShadow = true;
      scene.add(floor);

      const car = new THREE.Group();
      scene.add(car);

      const materials = {
        body: new THREE.MeshPhysicalMaterial({
          color: 0x080909,
          metalness: 0.88,
          roughness: 0.18,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        }),
        dark: new THREE.MeshStandardMaterial({ color: 0x050606, metalness: 0.55, roughness: 0.28 }),
        glass: new THREE.MeshPhysicalMaterial({
          color: 0x1d3425,
          metalness: 0,
          roughness: 0.08,
          transmission: 0.3,
          transparent: true,
          opacity: 0.5,
        }),
        leather: new THREE.MeshStandardMaterial({ color: 0x9a5a24, metalness: 0.12, roughness: 0.46 }),
        lime: new THREE.MeshStandardMaterial({ color: 0x8dff2f, emissive: 0x59aa12, emissiveIntensity: 1.15 }),
        trim: new THREE.MeshStandardMaterial({ color: 0xb9c2c7, metalness: 0.72, roughness: 0.24 }),
        mat: new THREE.MeshStandardMaterial({ color: 0x151a1b, roughness: 0.78 }),
        tire: new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.1, roughness: 0.62 }),
        brake: new THREE.MeshStandardMaterial({ color: 0xd82020, metalness: 0.28, roughness: 0.26 }),
      };

      const parts = [];
      const accessoryParts = [];
      const shellParts = [];

      function addBox(name, size, pos, mat, parent = car, scatter = null, bevel = false, radius = 0.06) {
        const geo = new RoundedBoxGeometry(size[0], size[1], size[2], 6, Math.min(radius, size[0] * 0.18, size[1] * 0.3, size[2] * 0.18));
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = name;
        mesh.position.set(pos[0], pos[1], pos[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        parts.push(mesh);
        if (scatter) accessoryParts.push({ mesh, origin: mesh.position.clone(), target: new THREE.Vector3(...scatter.pos), rot: scatter.rot || [0, 0, 0] });
        if (bevel) shellParts.push({ mesh, origin: mesh.position.clone(), target: new THREE.Vector3(...(bevel.pos || pos)), rot: bevel.rot || [0, 0, 0] });
        return mesh;
      }

      function addCylinder(name, radius, depth, pos, mat, parent = car, scatter = null, rotation = [Math.PI / 2, 0, 0]) {
        const geo = new THREE.CylinderGeometry(radius, radius, depth, 48);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = name;
        mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
        mesh.position.set(pos[0], pos[1], pos[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        parts.push(mesh);
        if (scatter) accessoryParts.push({ mesh, origin: mesh.position.clone(), target: new THREE.Vector3(...scatter.pos), rot: scatter.rot || [0, 0, 0] });
        return mesh;
      }

      function addEllipsoid(name, scale, pos, mat, parent = car, scatter = null, rotation = [0, 0, 0]) {
        const geo = new THREE.SphereGeometry(1, 48, 24);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = name;
        mesh.scale.set(scale[0], scale[1], scale[2]);
        mesh.position.set(pos[0], pos[1], pos[2]);
        mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        parts.push(mesh);
        if (scatter) accessoryParts.push({ mesh, origin: mesh.position.clone(), target: new THREE.Vector3(...scatter.pos), rot: scatter.rot || [0, 0, 0] });
        return mesh;
      }

      addEllipsoid('sedan-main-body', [3.0, 0.42, 0.83], [0, 0.06, 0], materials.body);
      addBox('lower-aero-sill', [5.75, 0.18, 1.58], [0, -0.42, 0], materials.dark, car, null, false, 0.08);
      addBox('front-nose', [1.42, 0.36, 1.42], [-2.75, -0.02, 0], materials.body, car, null, { pos: [-4.55, 0.12, 0.72], rot: [0.1, -0.2, -0.08] }, 0.14);
      addBox('rear-quarter', [1.24, 0.4, 1.42], [2.74, -0.02, 0], materials.body, car, null, { pos: [4.45, 0.12, -0.62], rot: [-0.08, 0.16, 0.08] }, 0.14);
      addEllipsoid('cabin-glass', [1.58, 0.5, 0.67], [0.22, 0.78, 0], materials.glass, car, null, [-0.03, 0, 0]);
      addBox('roof-panel', [2.55, 0.16, 1.18], [0.34, 1.15, 0], materials.body, car, null, { pos: [0.14, 2.42, 0], rot: [0.05, 0, 0] }, 0.08);
      addBox('windshield', [1.18, 0.06, 1.06], [-1.08, 0.83, 0], materials.glass, car, null, { pos: [-1.72, 1.88, 0.4], rot: [0.5, -0.12, -0.06] }, 0.04);
      addBox('rear-glass', [1.02, 0.06, 1.04], [1.5, 0.82, 0], materials.glass, car, null, { pos: [2.22, 1.82, -0.38], rot: [-0.34, 0.12, 0.06] }, 0.04);

      addBox('left-door-front', [1.18, 0.78, 0.08], [-0.95, 0.12, 0.84], materials.body, car, null, { pos: [-2.38, 0.62, 1.94], rot: [0, -0.78, 0.16] }, 0.08);
      addBox('left-door-rear', [1.08, 0.74, 0.08], [0.48, 0.12, 0.84], materials.body, car, null, { pos: [0.32, 0.82, 2.2], rot: [0, -0.38, 0.12] }, 0.08);
      addBox('right-door-front', [1.18, 0.78, 0.08], [-0.95, 0.12, -0.84], materials.body, car, null, { pos: [-2.38, 0.62, -1.94], rot: [0, 0.78, -0.16] }, 0.08);
      addBox('right-door-rear', [1.08, 0.74, 0.08], [0.48, 0.12, -0.84], materials.body, car, null, { pos: [0.32, 0.82, -2.2], rot: [0, 0.38, -0.12] }, 0.08);
      addBox('front-lime-light', [1.25, 0.05, 0.06], [-2.95, 0.12, 0.42], materials.lime, car, { pos: [-3.9, 0.82, 1.46], rot: [0.1, 0.5, 0.1] }, false, 0.02);
      addBox('rear-lime-light', [0.95, 0.05, 0.06], [2.98, 0.12, -0.42], materials.lime, car, { pos: [3.85, 0.78, -1.44], rot: [-0.1, -0.5, -0.1] }, false, 0.02);

      const chassis = addBox('chassis', [5.8, 0.18, 1.7], [0, -0.55, 0], materials.dark);
      chassis.scale.y = 1;

      const wheelPositions = [[-2.05, -0.54, 0.98], [2.05, -0.54, 0.98], [-2.05, -0.54, -0.98], [2.05, -0.54, -0.98]];
      wheelPositions.forEach((pos, index) => {
        addCylinder(`wheel-${index}`, 0.43, 0.28, pos, materials.tire, car, {
          pos: [pos[0] + (pos[0] < 0 ? -0.8 : 0.8), -0.72, pos[2] + (pos[2] > 0 ? 1.4 : -1.4)],
          rot: [Math.PI / 2, 0.2, 0],
        });
        addCylinder(`rim-${index}`, 0.25, 0.31, pos, materials.trim, car, {
          pos: [pos[0] + (pos[0] < 0 ? -0.9 : 0.9), -0.72, pos[2] + (pos[2] > 0 ? 1.55 : -1.55)],
          rot: [Math.PI / 2, 0.2, 0],
        });
        addBox(`brake-${index}`, [0.1, 0.22, 0.26], [pos[0], -0.54, pos[2] > 0 ? 1.12 : -1.12], materials.brake, car, {
          pos: [pos[0] + (pos[0] < 0 ? -1.05 : 1.05), -0.58, pos[2] + (pos[2] > 0 ? 1.72 : -1.72)],
          rot: [0.2, 0.2, 0],
        }, false, 0.03);
      });

      addBox('dashboard', [1.35, 0.28, 1.18], [-1.05, 0.12, 0], materials.dark, car, { pos: [-2.25, 1.05, 0], rot: [0.2, 0.2, 0.05] });
      addCylinder('steering', 0.25, 0.05, [-1.42, 0.28, 0.42], materials.dark, car, { pos: [-2.35, 0.92, 1.12], rot: [1.4, 0.1, -0.5] }, [Math.PI / 2, 0, 0]);
      addBox('dashcam', [0.28, 0.16, 0.16], [-1.6, 0.78, 0], materials.dark, car, { pos: [-2.8, 1.9, 0.48], rot: [0.2, -0.4, 0.1] });
      addBox('phone-holder', [0.16, 0.34, 0.08], [-0.92, 0.36, 0.48], materials.dark, car, { pos: [-1.65, 1.1, 1.55], rot: [0.5, 0.25, -0.3] });
      addBox('perfume', [0.16, 0.26, 0.16], [-0.2, 0.02, 0.48], materials.lime, car, { pos: [0.5, 1.15, 1.72], rot: [0.2, 0.45, 0.2] });

      [['seat-front-left', -0.35, 0.42], ['seat-front-right', -0.35, -0.42], ['seat-rear-left', 0.85, 0.42], ['seat-rear-right', 0.85, -0.42]].forEach(([name, x, z], i) => {
        addBox(name, [0.48, 0.66, 0.36], [x, -0.03, z], materials.leather, car, {
          pos: [x + (i % 2 ? 0.9 : -0.9), 0.72 + i * 0.05, z + (z > 0 ? 1.45 : -1.45)],
          rot: [0.15, z > 0 ? -0.25 : 0.25, z > 0 ? 0.12 : -0.12],
        });
      });

      addBox('mat-left', [1.1, 0.04, 0.46], [0.1, -0.44, 0.42], materials.mat, car, { pos: [-0.75, -0.84, 1.72], rot: [0.04, 0.2, 0.08] });
      addBox('mat-right', [1.1, 0.04, 0.46], [0.1, -0.44, -0.42], materials.mat, car, { pos: [0.75, -0.84, -1.72], rot: [-0.04, -0.2, -0.08] });
      addBox('ambient-left', [2.2, 0.04, 0.04], [0, 0.42, 0.78], materials.lime, car, { pos: [1.8, 1.35, 1.92], rot: [0, 0.5, 0.1] });
      addBox('ambient-right', [2.2, 0.04, 0.04], [0, 0.42, -0.78], materials.lime, car, { pos: [1.8, 1.35, -1.92], rot: [0, -0.5, -0.1] });

      const targetRotations = new Map();
      accessoryParts.forEach((item) => targetRotations.set(item.mesh, new THREE.Euler(item.rot[0], item.rot[1], item.rot[2])));
      shellParts.forEach((item) => targetRotations.set(item.mesh, new THREE.Euler(item.rot[0], item.rot[1], item.rot[2])));

      car.rotation.set(-0.05, -0.36, 0);
      car.position.set(0, -0.05, 0);

      let currentProgress = 0;
      unsubscribe.current = progress.on('change', (value) => { currentProgress = value; });

      const resize = () => {
        if (!mountRef.current || !renderer) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', resize);
      resize();

      const ease = (value) => value * value * (3 - 2 * value);
      const clamp01 = (value) => Math.max(0, Math.min(1, value));

      const animate = () => {
        const zoom = ease(clamp01(currentProgress / 0.4));
        const explode = ease(clamp01((currentProgress - 0.32) / 0.45));
        const rotate = ease(clamp01((currentProgress - 0.08) / 0.6));

        camera.position.z = 8.4 - zoom * 1.4 + explode * 1.1;
        camera.position.y = 3.2 - zoom * 0.28 + explode * 0.36;
        camera.lookAt(0, 0.35, 0);

        car.rotation.y = -0.36 + rotate * 0.72;
        car.rotation.x = -0.05 - explode * 0.12;

        shellParts.forEach((item) => {
          item.mesh.position.lerpVectors(item.origin, item.target, explode);
          const target = targetRotations.get(item.mesh);
          item.mesh.rotation.x = target.x * explode;
          item.mesh.rotation.y = target.y * explode;
          item.mesh.rotation.z = target.z * explode;
        });

        accessoryParts.forEach((item, index) => {
          const delayed = ease(clamp01((explode - index * 0.025) / 0.9));
          item.mesh.position.lerpVectors(item.origin, item.target, delayed);
          const target = targetRotations.get(item.mesh);
          item.mesh.rotation.x = target.x * delayed;
          item.mesh.rotation.y = target.y * delayed;
          item.mesh.rotation.z = target.z * delayed;
        });

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };

      animate();

      mount._cleanupThree = () => {
        window.removeEventListener('resize', resize);
        if (unsubscribe.current) unsubscribe.current();
        if (frameId) cancelAnimationFrame(frameId);
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((mat) => mat.dispose());
            else obj.material.dispose();
          }
        });
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }

    setup();

    return () => {
      disposed = true;
      if (mountRef.current?._cleanupThree) mountRef.current._cleanupThree();
    };
  }, [progress]);

  return <div ref={mountRef} className="three-car-canvas" />;
}

function AccessoryCallout({ opacity, className, title, text }) {
  return (
    <motion.div style={{ opacity }} className={`cinema-callout ${className}`}>
      <span className="callout-dot" />
      <p>{title}</p>
      <small>{text}</small>
    </motion.div>
  );
}

function EngineAnimation() {
  return (
    <div className="engine-stage" aria-label="Animated working performance engine">
      <div className="engine-glow" />
      <div className="engine-block">
        <div className="engine-head">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="piston-row">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`piston piston-${item + 1}`}>
              <div className="spark" />
              <div className="piston-cap" />
              <div className="piston-rod" />
            </div>
          ))}
        </div>

        <div className="crank-case">
          <div className="crank crank-main">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="pulley pulley-left" />
          <div className="pulley pulley-right" />
          <div className="belt belt-top" />
          <div className="belt belt-bottom" />
        </div>
      </div>

      <div className="engine-caption">
        <Gauge className="w-4 h-4" />
        <span>Performance-grade accessory ecosystem</span>
      </div>
    </div>
  );
}

function LoadingExperience() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45 } }}
      className="fixed inset-0 z-[100] bg-[#111111] text-white flex items-center justify-center"
    >
      <div className="w-full max-w-xl px-6 text-center">
        <div className="mx-auto mb-8 h-24 relative overflow-hidden">
          <motion.div
            initial={{ x: '-20%' }}
            animate={{ x: '120%' }}
            transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 h-1 w-48 -translate-y-1/2 rounded-full bg-[#8DFF2F] blur-sm"
          />
          <Car className="relative z-10 mx-auto w-20 h-20 text-[#8DFF2F]" />
        </div>
        <p className="text-sm uppercase tracking-[0.22em] text-[#8DFF2F]">Loading Premium Drive Experience</p>
        <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.55, ease: 'easeInOut' }} className="h-full bg-[#8DFF2F]" />
        </div>
        <p className="mt-5 text-sm text-white/55">Upgrade your drive with premium accessories.</p>
      </div>
    </motion.div>
  );
}

function StoryIntro({ whatsappHref }) {
  return (
    <section className="bg-[#F5F7F8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center">
        <div className="reveal-copy">
          <p className="section-label">Built for drivers</p>
          <h2 className="section-title">Built for drivers who expect more.</h2>
          <p className="mt-6 text-zinc-600 leading-8">
            From interior comfort to exterior protection, every accessory is selected to improve your driving experience with premium quality and modern design.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-dark mt-8">
            <MessageCircle className="w-4 h-4" /> Talk to a specialist
          </a>
        </div>
        <div className="relative min-h-96 hero-visual rounded-[32px] border border-white brand-glow overflow-hidden reveal-copy">
          <div className="car-silhouette mt-36"><span className="wheel wheel-left" /><span className="wheel wheel-right" /></div>
          <div className="absolute top-6 right-6 glass p-4 max-w-[220px]">
            <p className="text-sm font-bold">OEM-plus styling</p>
            <p className="text-xs text-zinc-500 mt-1">Clean upgrades that feel integrated, not added on.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase({ categoryNames, trackRef }) {
  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="section-label">Collection</p>
        <h2 className="section-title">Choose your upgrade path.</h2>
      </div>
      <div ref={trackRef} className="flex gap-4 px-4 sm:px-6 lg:px-8 min-w-max">
        {[...categoryNames, ...categoriesFallback.slice(0, 4)].map((category, index) => (
          <Link
            key={`${category}-${index}`}
            href={`/shop?search=${encodeURIComponent(category)}`}
            className="group w-72 h-72 rounded-[28px] bg-[#F5F7F8] border border-[#E5E7EB] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-[#8DFF2F] hover:shadow-card-hover"
          >
            <span className="text-6xl font-display font-bold text-[#111111]/10">{String(index + 1).padStart(2, '0')}</span>
            <span>
              <span className="block text-2xl font-display font-bold text-[#111111]">{category}</span>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#00A83D]">Explore <ChevronRight className="w-4 h-4" /></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function QualitySection() {
  return (
    <section className="bg-[#F5F7F8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
        <div className="lg:sticky lg:top-28 h-max reveal-copy">
          <p className="section-label">Quality</p>
          <h2 className="section-title">Premium quality from inside out.</h2>
          <p className="mt-6 text-zinc-600 leading-8">
            Every detail is chosen for daily usability, long-term finish, and that quietly expensive automotive feel.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {qualityCards.map(({ title, text, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.08 }}
              className="card p-6 min-h-56"
            >
              <Icon className="w-7 h-7 text-[#00A83D] mb-6" />
              <h3 className="text-xl font-bold text-[#111111]">{title}</h3>
              <p className="mt-3 text-sm text-zinc-600 leading-7">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCollection({ loading, products }) {
  return (
    <section id="collection" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 reveal-copy">
          <div>
            <p className="section-label">Products</p>
            <h2 className="section-title">Accessories That Match Your Drive</h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-bold text-[#00A83D] hover:text-[#111111] uppercase">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}

function ScrollStory({ storyRef }) {
  return (
    <section ref={storyRef} className="bg-[#111111] text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_1fr] gap-12">
        <div className="lg:sticky lg:top-24 h-[560px] rounded-[32px] bg-gradient-to-br from-white/12 to-white/5 border border-white/10 overflow-hidden">
          <div className="absolute inset-0 surface-grid opacity-20" />
          <div className="relative h-full flex items-center">
            <div className="car-silhouette w-full"><span className="wheel wheel-left" /><span className="wheel wheel-right" /></div>
            {['Covers', 'LED', 'Dashcam', 'Care'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ amount: 0.65 }}
                transition={{ delay: index * 0.08 }}
                className={`absolute glass text-[#111111] px-4 py-2 text-sm font-bold ${
                  ['top-12 left-10', 'top-20 right-10', 'bottom-24 left-12', 'bottom-16 right-12'][index]
                }`}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="space-y-28 py-8">
          {storySteps.map((step, index) => (
            <div key={step.title} className="min-h-[360px] reveal-copy">
              <p className="text-[#8DFF2F] text-sm font-bold uppercase tracking-[0.18em]">Step {index + 1}</p>
              <h2 className="mt-4 text-4xl md:text-6xl font-display font-bold leading-tight">{step.title}</h2>
              <p className="mt-6 text-white/65 leading-8 max-w-xl">{step.text}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {step.items.map((item) => <span key={item} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppCheckout({ whatsappHref }) {
  return (
    <section className="bg-[#F5F7F8] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
        <div className="reveal-copy">
          <p className="section-label">WhatsApp checkout</p>
          <h2 className="section-title">Simple Checkout. Direct on WhatsApp.</h2>
          <p className="mt-6 text-zinc-600 leading-8">
            Cart, address, order summary, and message generation are built for direct confirmation with your customer.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 animate-pulse">
            <MessageCircle className="w-4 h-4" /> Start WhatsApp Order
          </a>
        </div>
        <div className="card p-6 reveal-copy">
          {['Cart', 'Address', 'Order Summary', 'WhatsApp Message'].map((item, index) => (
            <div key={item} className="flex items-center gap-4 py-4 border-b border-[#E5E7EB] last:border-0">
              <span className="w-10 h-10 rounded-full bg-[#8DFF2F] text-[#111111] flex items-center justify-center font-bold">{index + 1}</span>
              <div>
                <p className="font-bold text-[#111111]">{item}</p>
                <p className="text-sm text-zinc-500">Customer details, product names, quantities, and total amount stay in the message.</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#00A83D] ml-auto hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="section-label">Reviews</p>
        <h2 className="section-title">Trusted by car lovers</h2>
        <div className="mt-12 flex gap-4">
          {testimonials.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ y: -8 }}
              className="card p-6 min-w-[280px] sm:min-w-[360px]"
            >
              <div className="flex gap-1 text-[#8DFF2F] mb-5">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
              <p className="text-zinc-700 leading-7">"{item.quote}"</p>
              <p className="mt-6 text-sm font-bold text-[#111111]">{item.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCTA({ whatsappHref }) {
  return (
    <section className="bg-[#111111] text-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
        <div className="reveal-copy">
          <p className="text-[#8DFF2F] text-sm font-bold uppercase tracking-[0.18em] mb-3">Contact</p>
          <h2 className="text-5xl md:text-7xl font-display font-bold leading-[0.95]">Let's upgrade your ride.</h2>
          <p className="mt-6 text-white/60 leading-8 max-w-lg">
            Share your vehicle model and the kind of upgrade you want. The team can guide you directly on WhatsApp.
          </p>
        </div>
        <form className="glass p-6 space-y-4 text-[#111111]" onSubmit={(e) => e.preventDefault()}>
          <input className="input-field" placeholder="Name" />
          <input className="input-field" placeholder="Phone" />
          <input className="input-field" placeholder="Vehicle model" />
          <textarea className="input-field resize-none" rows={4} placeholder="Requirement" />
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
            <MessageCircle className="w-4 h-4" /> Send on WhatsApp
          </a>
        </form>
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 skeleton rounded w-1/3" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-5 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}
