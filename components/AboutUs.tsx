import React from 'react';

const ABOUT_IMAGE = '/images/about-1.png';
const BOOTH_IMAGE = '/images/about-2.png';

const AboutUs: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 min-h-screen py-16">
    <section className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center gap-10 mb-16">
      <img src={ABOUT_IMAGE} alt="About SnapBooth" className="w-full md:w-1/2 rounded-lg shadow-lg object-cover h-64 md:h-80" />
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">About SnapBooth</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Founded in 2018, SnapBooth has delivered joy to <span className="font-bold text-purple-600">200+ events</span> and printed over <span className="font-bold text-purple-600">50,000 photos</span> across Malaysia and Singapore. Our mission: make every event unforgettable with fun, interactive photo experiences.</p>
        <ul className="mb-4 text-gray-600 dark:text-gray-400">
          <li>• 6 years running</li>
          <li>• 200+ events served</li>
          <li>• 50,000+ prints delivered</li>
        </ul>
        <p className="italic text-gray-500 dark:text-gray-400">"We started SnapBooth to bring people together and capture memories that last a lifetime."</p>
      </div>
    </section>
    <section className="max-w-3xl mx-auto w-full flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Our Story</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">SnapBooth began as a passion project to make events more memorable. Over the years, we've grown into a trusted partner for weddings, corporate events, and celebrations of all sizes. Our team is dedicated to delivering smiles, laughter, and lasting memories at every event.</p>
      </div>
      <img src={BOOTH_IMAGE} alt="SnapBooth in Action" className="w-full md:w-1/2 rounded-lg shadow-lg object-cover h-64 md:h-80" />
    </section>
  </div>
);

export default AboutUs; 