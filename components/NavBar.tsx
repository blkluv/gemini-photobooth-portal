import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-md py-4 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}> 
        {/* Logo or Brand Name */}
        <span className="text-2xl font-bold text-purple-600 dark:text-white">Snapbooth</span>
      </div>
      <div className="flex items-center gap-6">
        <NavLink to="/" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>About Us</NavLink>
        <NavLink to="/services" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Services</NavLink>
        <NavLink to="/clients" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Clients</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Contact Us</NavLink>
        <button
          onClick={() => navigate('/contact')}
          className="ml-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-full shadow transition"
        >
          Get Free Quote
        </button>
        <button
          onClick={() => navigate('/app')}
          className="ml-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-full shadow transition"
        >
          Go to Photobooth
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 