import React from 'react';

const SERVICES = [
  {
    icon: '📸',
    title: 'Instant Print',
    desc: 'High-quality instant prints for every guest, every time.',
    img: '/images/service-1.png',
    link: '#',
    category: 'Print Booths',
  },
  {
    icon: '📷',
    title: 'DSLR Booth',
    desc: 'Professional DSLR camera for studio-quality photos.',
    img: '/images/service-2.png',
    link: '#',
    category: 'Photo Booths',
  },
  {
    icon: '🔁',
    title: 'GIF/Boomerang',
    desc: 'Create fun GIFs and boomerangs, perfect for sharing.',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    link: '#',
    category: 'Animated Booths',
  },
  {
    icon: '🟩',
    title: 'Green Screen',
    desc: 'Custom backgrounds with green screen magic.',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    link: '#',
    category: 'Special Effects',
  },
  {
    icon: '🌀',
    title: '360 Spin',
    desc: 'Immersive 360° video booth for show-stopping moments.',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    link: '#',
    category: 'Video Booths',
  },
  {
    icon: '🖨️',
    title: 'Printer Kiosk',
    desc: 'Self-service print kiosks for fast, easy reprints.',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    link: '#',
    category: 'Print Booths',
  },
];

const categories = Array.from(new Set(SERVICES.map(s => s.category)));

const Services: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 min-h-screen py-16">
    <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-10">Our Booths & Services</h1>
    {categories.map(category => (
      <section key={category} className="mb-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">{category}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {SERVICES.filter(s => s.category === category).map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center text-center hover:scale-105 transition-transform">
              <img src={s.img} alt={s.title} className="w-full h-40 object-cover rounded mb-4" />
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">{s.title}</div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{s.desc}</p>
              <a href={s.link} className="text-blue-600 font-semibold hover:underline">Learn More</a>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default Services; 