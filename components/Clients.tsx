import React from 'react';

const CLIENT_LOGOS = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
  'https://upload.wikimedia.org/wikipedia/commons/1/1b/IBM_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/5/51/Google.png',
];
const TESTIMONIALS = [
  {
    quote: 'SnapBooth made our company gala unforgettable. Guests loved the instant prints & boomerang videos!',
    author: 'Jane, Event Planner',
    img: '/images/testimonial-1.png',
  },
  {
    quote: 'The 360 Spin Booth was a hit at our wedding. Everyone had so much fun!',
    author: 'Alex & Sam',
    img: '/images/testimonial-2.png',
  },
  {
    quote: 'Professional, fun, and reliable. Highly recommended for any event!',
    author: 'Michael, Corporate Client',
    img: '/images/testimonial-2.png',
  },
];

const Clients: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 min-h-screen py-16">
    <div className="flex flex-wrap justify-center gap-8 mb-12">
      <img src="/images/testimonial-1.png" alt="Testimonial Hero 1" className="h-32 w-32 object-cover rounded-full border-4 border-purple-200 dark:border-purple-400" />
      <img src="/images/testimonial-2.png" alt="Testimonial Hero 2" className="h-32 w-32 object-cover rounded-full border-4 border-purple-200 dark:border-purple-400" />
    </div>
    <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-10">Our Clients</h1>
    <div className="flex flex-wrap justify-center gap-8 mb-12">
      {CLIENT_LOGOS.map((logo, i) => (
        <img key={i} src={logo} alt="Client logo" className="h-16 w-auto object-contain grayscale hover:grayscale-0 transition" />
      ))}
    </div>
    <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {TESTIMONIALS.map((t, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col justify-between items-center">
          <img src={t.img} alt={t.author} className="h-20 w-20 object-cover rounded-full border-2 border-purple-200 dark:border-purple-400 mb-4" />
          <p className="text-lg italic mb-4">“{t.quote}”</p>
          <div className="text-right font-semibold text-purple-600 dark:text-purple-400">– {t.author}</div>
        </div>
      ))}
    </div>
  </div>
);

export default Clients; 