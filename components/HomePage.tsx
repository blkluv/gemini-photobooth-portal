import React from 'react';

// Placeholder images and data
const HERO_IMAGE = '/images/hero-1.png';
const HERO_IMAGE_ALT = '/images/hero-2.png'; // Optionally use for alternate hero or as a background
const ABOUT_IMAGE = '/images/about-1.png';
const ABOUT_IMAGE_2 = '/images/about-2.png';
const TESTIMONIAL_IMAGE_1 = '/images/testimonial-1.png';
const TESTIMONIAL_IMAGE_2 = '/images/testimonial-2.png';
const SERVICE_IMAGE_1 = '/images/service-1.png';
const SERVICE_IMAGE_2 = '/images/service-2.png';
const CONTACT_IMAGE_1 = '/images/contact-1.png';
const CONTACT_IMAGE_2 = '/images/contact-2.png';
const BG_IMAGE_1 = '/images/bg-1.png';
const BG_IMAGE_2 = '/images/bg-2.png';
const CLIENT_LOGOS = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
];
const TESTIMONIALS = [
  {
    quote: 'SnapBooth made our company gala unforgettable. Guests loved the instant prints & boomerang videos!',
    author: 'Jane, Event Planner',
  },
  {
    quote: 'The 360 Spin Booth was a hit at our wedding. Everyone had so much fun!',
    author: 'Alex & Sam',
  },
];
const SERVICES = [
  {
    icon: '📸',
    title: 'Instant Print',
    desc: 'High-quality instant prints for every guest, every time.',
    link: '#',
  },
  {
    icon: '📷',
    title: 'DSLR Booth',
    desc: 'Professional DSLR camera for studio-quality photos.',
    link: '#',
  },
  {
    icon: '🔁',
    title: 'GIF/Boomerang',
    desc: 'Create fun GIFs and boomerangs, perfect for sharing.',
    link: '#',
  },
  {
    icon: '🟩',
    title: 'Green Screen',
    desc: 'Custom backgrounds with green screen magic.',
    link: '#',
  },
  {
    icon: '🌀',
    title: '360 Spin',
    desc: 'Immersive 360° video booth for show-stopping moments.',
    link: '#',
  },
  {
    icon: '🖨️',
    title: 'Printer Kiosk',
    desc: 'Self-service print kiosks for fast, easy reprints.',
    link: '#',
  },
];
const PRICING = [
  {
    name: 'Trial',
    price: 'Free',
    duration: '1 hour',
    keys: '1 trial key',
    features: [
      'All core features',
      'Unlimited captures (1 hour)',
      'QR sharing',
      'No watermark',
    ],
    cta: 'Get Free Trial',
    link: '#contact',
    highlight: false,
  },
  {
    name: 'Event',
    price: 'RM 99',
    duration: '1 event',
    keys: '1 event key',
    features: [
      'All features included',
      'Unlimited captures (event)',
      'Instant print & GIF/Boomerang',
      'Custom branding',
      'QR sharing',
    ],
    cta: 'Purchase Key',
    link: '#contact',
    highlight: true,
  },
  {
    name: 'Pro',
    price: 'RM 249',
    duration: '3 events',
    keys: '3 event keys',
    features: [
      'All Event features',
      'Priority support',
      'Analytics dashboard',
      'Multi-event management',
    ],
    cta: 'Purchase Pro',
    link: '#contact',
    highlight: false,
  },
];

const HeroSection = () => (
  <section className="w-full flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 relative">
    <img src={HERO_IMAGE} alt="SnapBooth Hero" className="mx-auto rounded-xl shadow-lg w-full max-w-2xl mb-8 object-cover h-64 z-10 relative" />
    {/* Optionally, add a blurred background image */}
    {/* <img src={BG_IMAGE_1} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" /> */}
    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-4 z-10">SnapBooth – Capture the Moment, Share the Joy</h1>
    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 z-10">Portable photo & video booths for weddings, corporate, birthdays—with instant prints, GIFs, 360 & more!</p>
    <a href="#contact" className="bg-purple-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:bg-purple-700 transition z-10">Book Now</a>
  </section>
);

const ServicesSection = () => (
  <section className="max-w-5xl mx-auto w-full py-16" id="services">
    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">Our Booths & Services</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {SERVICES.map((s, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center text-center hover:scale-105 transition-transform">
          {/* Use service images for the first two cards as examples */}
          {i === 0 && <img src={SERVICE_IMAGE_1} alt={s.title} className="w-full h-32 object-cover rounded mb-4" />}
          {i === 1 && <img src={SERVICE_IMAGE_2} alt={s.title} className="w-full h-32 object-cover rounded mb-4" />}
          <div className="text-5xl mb-4">{s.icon}</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">{s.title}</div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{s.desc}</p>
          <a href={s.link} className="text-blue-600 font-semibold hover:underline">Learn More</a>
        </div>
      ))}
    </div>
  </section>
);

const PricingSection = () => (
  <section className="max-w-4xl mx-auto w-full py-16" id="pricing">
    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">Pricing & Packages</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PRICING.map((p, i) => (
        <div key={i} className={`rounded-lg shadow-lg p-8 flex flex-col items-center bg-white dark:bg-gray-800 border-2 ${p.highlight ? 'border-purple-600' : 'border-transparent'}`}> 
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">{p.name}</div>
          <div className="text-3xl font-extrabold mb-2 dark:text-white">{p.price}</div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">{p.duration} / {p.keys}</div>
          <ul className="mb-4 text-gray-600 dark:text-gray-300 text-left w-full list-disc pl-5">
            {p.features.map((f, j) => <li key={j}>{f}</li>)}
          </ul>
          <a href={p.link} className={`mt-auto bg-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-purple-700 transition w-full text-center ${p.highlight ? 'ring-2 ring-purple-400' : ''}`}>{p.cta}</a>
        </div>
      ))}
    </div>
    <div className="mt-8 text-center text-gray-700 dark:text-gray-300">
      <span>Want to try it out? </span>
      <a href="#contact" className="text-blue-600 font-semibold underline">Get a Free Trial Key</a>
    </div>
  </section>
);

const AboutSection = () => (
  <section className="max-w-4xl mx-auto w-full py-16 flex flex-col md:flex-row items-center gap-10" id="about">
    <img src={ABOUT_IMAGE} alt="About SnapBooth" className="w-full md:w-1/2 rounded-lg shadow-lg object-cover h-64 md:h-80" />
    <div className="flex-1">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">About SnapBooth</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">Founded in 2018, SnapBooth has delivered joy to <span className="font-bold text-purple-600">200+ events</span> and printed over <span className="font-bold text-purple-600">50,000 photos</span> across Malaysia and Singapore. Our mission: make every event unforgettable with fun, interactive photo experiences.</p>
      <ul className="mb-4 text-gray-600 dark:text-gray-400">
        <li>• 6 years running</li>
        <li>• 200+ events served</li>
        <li>• 50,000+ prints delivered</li>
      </ul>
      <p className="italic text-gray-500 dark:text-gray-400">"We started SnapBooth to bring people together and capture memories that last a lifetime."</p>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="max-w-4xl mx-auto w-full py-16" id="testimonials">
    <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-10">Clients & Testimonials</h2>
    <div className="flex flex-wrap justify-center gap-8 mb-8">
      {/* Add testimonial images */}
      <img src={TESTIMONIAL_IMAGE_1} alt="Testimonial 1" className="h-24 w-24 object-cover rounded-full border-4 border-purple-200 dark:border-purple-400" />
      <img src={TESTIMONIAL_IMAGE_2} alt="Testimonial 2" className="h-24 w-24 object-cover rounded-full border-4 border-purple-200 dark:border-purple-400" />
    </div>
    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
      {TESTIMONIALS.map((t, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex-1 flex flex-col justify-between">
          <p className="text-lg italic mb-4">“{t.quote}”</p>
          <div className="text-right font-semibold text-purple-600 dark:text-purple-400">– {t.author}</div>
        </div>
      ))}
    </div>
  </section>
);

const ContactSection = () => (
  <section className="max-w-xl mx-auto w-full py-16 text-center" id="contact">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Contact Us</h2>
    <img src={CONTACT_IMAGE_1} alt="Contact Visual" className="mx-auto mb-6 w-40 h-40 object-cover rounded-full shadow-lg" />
    <p className="mb-6 text-gray-600 dark:text-gray-300">Questions? Custom packages? Reach out or book your booth now!</p>
    <div className="flex flex-col gap-4 mb-8">
      <a href="https://wa.me/60123456789?text=Hi%20SnapBooth!%20I%20want%20to%20book." target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-green-600 transition">WhatsApp Us</a>
      <a href="mailto:hello@snapbooth.com" className="text-blue-600 font-semibold underline">Email: hello@snapbooth.com</a>
    </div>
    <form className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4 items-center">
      <input type="text" placeholder="Your Name" className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" required />
      <input type="date" placeholder="Event Date" className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" required />
      <select className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" required>
        <option value="">Select Booth Type</option>
        {SERVICES.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
      </select>
      <input type="number" placeholder="Estimated Headcount" className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" min={1} required />
      <button type="submit" className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow hover:bg-purple-700 transition w-full">Book Now</button>
    </form>
  </section>
);

const Footer = () => (
  <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-500 text-sm mt-20 sticky bottom-0 w-full z-20 border-t border-gray-200 dark:border-gray-700">
    © 2025 SnapBooth | <a href="#" className="underline">Privacy</a> | <a href="#" className="underline">Terms</a>
  </footer>
);

const StickyContactButton = () => (
  <a href="https://wa.me/60123456789?text=Hi%20SnapBooth!%20I%20want%20to%20book." target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-600 transition z-50">
    WhatsApp Book Now
  </a>
);

const HomePage: React.FC = () => (
  <div className="relative bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 min-h-screen">
    <HeroSection />
    <ServicesSection />
    <PricingSection />
    <AboutSection />
    <TestimonialsSection />
    <ContactSection />
    <Footer />
    <StickyContactButton />
  </div>
);

export default HomePage; 