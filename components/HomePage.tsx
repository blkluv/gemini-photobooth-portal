import React from 'react';

// Placeholder images and data
const HERO_IMAGE = '/images/hero-1.png';
const HERO_IMAGE_ALT = '/images/hero-2.png'; // Optionally use for alternate hero or as a background
const ABOUT_IMAGE = '/images/about-1.png';
const ABOUT_IMAGE_2 = '/images/about-2.png';
const TESTIMONIAL_IMAGE_1 = '/images/testimonial-1.jpg';
const TESTIMONIAL_IMAGE_2 = '/images/testimonial-2.jpg';
const TESTIMONIAL_IMAGE_3 = '/images/testimonial-3.jpg';
const SERVICE_IMAGE_1 = '/images/service-1.png';
const SERVICE_IMAGE_2 = '/images/service-2.png';
const SERVICE_IMAGE_GIF = '/images/service-gifbooth-1.jpg';
const SERVICE_IMAGE_360 = '/images/service-360spin-1.jpg';
const SERVICE_IMAGE_GREEN = '/images/service-greenscreen-1.jpg';
const SERVICE_IMAGE_KIOSK = '/images/service-printerkiosk-1.jpg';
const CONTACT_IMAGE_1 = '/images/contact-1.png';
const CONTACT_IMAGE_2 = '/images/contact-2.png';
const BG_IMAGE_1 = '/images/bg-1.png';
const BG_IMAGE_2 = '/images/bg-2.png';
const CLIENT_LOGOS = [
  '/images/client-logo-1.png',
  '/images/client-logo-2.png',
];
const TESTIMONIALS = [
  {
    quote: 'LumeeBooth made our company gala unforgettable. Guests loved the instant prints & boomerang videos!',
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
    price: '$199',
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
    price: '$299',
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
  <section className="relative flex flex-col items-center justify-center w-full py-16 text-center bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
    <img src={HERO_IMAGE} alt="SnapBooth Hero" className="relative z-10 object-cover w-full h-64 max-w-2xl mx-auto mb-8 shadow-lg rounded-xl" />
    {/* Optionally, add a blurred background image */}
    {/* <img src={BG_IMAGE_1} alt="Background" className="absolute inset-0 z-0 object-cover w-full h-full opacity-20" /> */}
    <h1 className="z-10 mb-4 text-4xl font-extrabold text-gray-800 md:text-5xl dark:text-white">LumeeBooth – Capture the Moment, Share the Joy</h1>
    <p className="z-10 mb-8 text-lg text-gray-600 dark:text-gray-300">Photo & video booths for weddings, corporate, birthdays—with instant prints, GIFs, 360 & more!</p>
    <a href="#contact" className="z-10 px-8 py-4 text-xl font-bold text-white transition bg-purple-600 rounded-full shadow-lg hover:bg-purple-700">Book Now</a>
  </section>
);

const ServicesSection = () => (
  <section className="w-full max-w-5xl py-16 mx-auto" id="services">
    <h2 className="mb-10 text-3xl font-bold text-center text-gray-800 dark:text-white">Our Booths & Services</h2>
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
      {SERVICES.map((s, i) => (
        <div key={i} className="flex flex-col items-center p-6 text-center transition-transform bg-white rounded-lg shadow dark:bg-gray-800 hover:scale-105">
          {/* Use service images for the first two cards as examples, and new images for others */}
          {i === 0 && <img src={SERVICE_IMAGE_1} alt={s.title} className="object-cover w-full h-32 mb-4 rounded" />}
          {i === 1 && <img src={SERVICE_IMAGE_2} alt={s.title} className="object-cover w-full h-32 mb-4 rounded" />}
          {i === 2 && <img src={SERVICE_IMAGE_GIF} alt={s.title} className="object-cover w-full h-32 mb-4 rounded" />}
          {i === 3 && <img src={SERVICE_IMAGE_GREEN} alt={s.title} className="object-cover w-full h-32 mb-4 rounded" />}
          {i === 4 && <img src={SERVICE_IMAGE_360} alt={s.title} className="object-cover w-full h-32 mb-4 rounded" />}
          {i === 5 && <img src={SERVICE_IMAGE_KIOSK} alt={s.title} className="object-cover w-full h-32 mb-4 rounded" />}
          <div className="mb-4 text-5xl">{s.icon}</div>
          <div className="mb-2 text-lg font-bold text-purple-600 dark:text-purple-400">{s.title}</div>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{s.desc}</p>
          <a href={s.link} className="font-semibold text-blue-600 hover:underline">Learn More</a>
        </div>
      ))}
    </div>
  </section>
);

const PricingSection = () => (
  <section className="w-full max-w-4xl py-16 mx-auto" id="pricing">
    <h2 className="mb-10 text-3xl font-bold text-center text-gray-800 dark:text-white">Pricing & Packages</h2>
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      {PRICING.map((p, i) => (
        <div key={i} className={`rounded-lg shadow-lg p-8 flex flex-col items-center bg-white dark:bg-gray-800 border-2 ${p.highlight ? 'border-purple-600' : 'border-transparent'}`}> 
          <div className="mb-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{p.name}</div>
          <div className="mb-2 text-3xl font-extrabold dark:text-white">{p.price}</div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">{p.duration} / {p.keys}</div>
          <ul className="w-full pl-5 mb-4 text-left text-gray-600 list-disc dark:text-gray-300">
            {p.features.map((f, j) => <li key={j}>{f}</li>)}
          </ul>
          <a href={p.link} className={`mt-auto bg-purple-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-purple-700 transition w-full text-center ${p.highlight ? 'ring-2 ring-purple-400' : ''}`}>{p.cta}</a>
        </div>
      ))}
    </div>
    <div className="mt-8 text-center text-gray-700 dark:text-gray-300">
      <span>Want to try it out? </span>
      <a href="#contact" className="font-semibold text-blue-600 underline">Get a Free Trial Key</a>
    </div>
  </section>
);

const AboutSection = () => (
  <section className="flex flex-col items-center w-full max-w-4xl gap-10 py-16 mx-auto md:flex-row" id="about">
    <img src={ABOUT_IMAGE} alt="About SnapBooth" className="object-cover w-full h-64 rounded-lg shadow-lg md:w-1/2 md:h-80" />
    <div className="flex-1">
      <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">About LumeeBooth</h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">Founded in 2016, Lumeebooth has delivered joy to <span className="font-bold text-purple-600">200+ events</span> and printed over <span className="font-bold text-purple-600">50,000 photos</span> across Metro Atlanta and the world. Our mission: make every event unforgettable with fun, interactive photo experiences.</p>
      <ul className="mb-4 text-gray-600 dark:text-gray-400">
        <li>• 8 years running</li>
        <li>• 800+ events served</li>
        <li>• 50,000+ prints delivered</li>
      </ul>
      <p className="italic text-gray-500 dark:text-gray-400">"We started LumeeBooth to bring people together and capture memories that last a lifetime."</p>
    </div>
  </section>
);

const TestimonialsSection = () => (
  <section className="w-full max-w-4xl py-16 mx-auto" id="testimonials">
    <h2 className="mb-10 text-3xl font-bold text-center text-gray-800 dark:text-white">Clients & Testimonials</h2>
    <div className="flex flex-wrap justify-center gap-8 mb-8">
      <img src={TESTIMONIAL_IMAGE_1} alt="Testimonial 1" className="object-cover w-24 h-24 border-4 border-purple-200 rounded-full dark:border-purple-400" />
      <img src={TESTIMONIAL_IMAGE_2} alt="Testimonial 2" className="object-cover w-24 h-24 border-4 border-purple-200 rounded-full dark:border-purple-400" />
      <img src={TESTIMONIAL_IMAGE_3} alt="Testimonial 3" className="object-cover w-24 h-24 border-4 border-purple-200 rounded-full dark:border-purple-400" />
    </div>
    <div className="flex flex-col items-stretch justify-center gap-8 md:flex-row">
      {TESTIMONIALS.map((t, i) => (
        <div key={i} className="flex flex-col justify-between flex-1 p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <p className="mb-4 text-lg italic">“{t.quote}”</p>
          <div className="font-semibold text-right text-purple-600 dark:text-purple-400">– {t.author}</div>
        </div>
      ))}
    </div>
  </section>
);

const ContactSection = () => (
  <section className="w-full max-w-xl py-16 mx-auto text-center" id="contact">
    <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Contact Us</h2>
    <img src={CONTACT_IMAGE_1} alt="Contact Visual" className="object-cover w-40 h-40 mx-auto mb-6 rounded-full shadow-lg" />
    <p className="mb-6 text-gray-600 dark:text-gray-300">Questions? Custom packages? Reach out or book your booth now!</p>
    <div className="flex flex-col gap-4 mb-8">
      <a href="https://wa.me/60123456789?text=Hi%20SnapBooth!%20I%20want%20to%20book." target="_blank" rel="noopener noreferrer" className="px-6 py-3 font-bold text-white transition bg-green-500 rounded-full shadow hover:bg-green-600">WhatsApp Us</a>
      <a href="mailto:hello@snapbooth.com" className="font-semibold text-blue-600 underline">Email: rentme@lumeebooth.com</a>
    </div>
    <form className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <input type="text" placeholder="Your Name" className="w-full px-4 py-3 text-center border border-gray-300 rounded dark:text-black" required />
      <input type="date" placeholder="Event Date" className="w-full px-4 py-3 text-center border border-gray-300 rounded dark:text-black" required />
      <select className="w-full px-4 py-3 text-center border border-gray-300 rounded dark:text-black" required>
        <option value="">Select Booth Type</option>
        {SERVICES.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
      </select>
      <input type="number" placeholder="Estimated Headcount" className="w-full px-4 py-3 text-center border border-gray-300 rounded dark:text-black" min={1} required />
      <button type="submit" className="w-full px-8 py-3 font-bold text-white transition bg-purple-600 rounded-full shadow hover:bg-purple-700">Book Now</button>
    </form>
  </section>
);

const Footer = () => (
  <footer className="sticky bottom-0 z-20 w-full py-6 mt-20 text-sm text-center text-gray-500 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    © 2025 Lumeebooth | <a href="#" className="underline">Privacy</a> | <a href="#" className="underline">Terms</a>
  </footer>
);

const StickyContactButton = () => (
  <a href="https://wa.me/4048895545?text=Hi%20LumeeBooth!%20I%20want%20to%20book." target="_blank" rel="noopener noreferrer" className="fixed z-50 px-6 py-3 font-bold text-white transition bg-green-500 rounded-full shadow-lg bottom-6 right-6 hover:bg-green-600">
    WhatsApp Book Now
  </a>
);

const HomePage: React.FC = () => (
  <div className="relative min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
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