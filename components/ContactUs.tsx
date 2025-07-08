import React from 'react';

const HERO_IMAGE = '/images/contact-1.png';
const BOOTH_TYPES = [
  'Instant Print',
  'DSLR Booth',
  'GIF/Boomerang',
  'Green Screen',
  '360 Spin',
  'Printer Kiosk',
];

const ContactUs: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 min-h-screen py-16">
    <img src={HERO_IMAGE} alt="Contact Hero" className="mx-auto rounded-xl shadow-lg w-full max-w-3xl mb-12 object-cover h-56" />
    <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-6">Contact Us</h1>
    <p className="mb-8 text-center text-gray-600 dark:text-gray-300">Questions? Custom packages? Reach out or book your booth now!</p>
    <div className="flex flex-col md:flex-row gap-8 max-w-3xl mx-auto mb-12">
      <a href="https://wa.me/60123456789?text=Hi%20SnapBooth!%20I%20want%20to%20book." target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow hover:bg-green-600 transition text-center">WhatsApp Us</a>
      <a href="mailto:hello@snapbooth.com" className="flex-1 text-blue-600 font-semibold underline text-center self-center">Email: hello@snapbooth.com</a>
    </div>
    <form className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4 items-center max-w-xl mx-auto">
      <input type="text" placeholder="Your Name" className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" required />
      <input type="date" placeholder="Event Date" className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" required />
      <select className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" required>
        <option value="">Select Booth Type</option>
        {BOOTH_TYPES.map((type, i) => <option key={i} value={type}>{type}</option>)}
      </select>
      <input type="number" placeholder="Estimated Headcount" className="w-full border border-gray-300 rounded px-4 py-3 text-center dark:text-black" min={1} required />
      <button type="submit" className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow hover:bg-purple-700 transition w-full">Book Now</button>
    </form>
  </div>
);

export default ContactUs; 