import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 bg-white shadow-md dark:bg-gray-900">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}> 
        {/* Logo or Brand Name */}
        <span className="text-2xl font-bold text-purple-600 dark:text-white">LumeeBooth</span>
      </div>
      <div className="flex items-center gap-6">
        <NavLink to="/" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>About Us</NavLink>
        <NavLink to="/services" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Services</NavLink>
        <NavLink to="/clients" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Clients</NavLink>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-purple-600 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:text-purple-600'}>Contact Us</NavLink>
        <button
          onClick={() => navigate('/contact')}
          className="px-4 py-2 ml-2 font-bold text-white transition bg-green-500 rounded-full shadow hover:bg-green-600"
        >
          Get Free Quote
        </button>
        <button
          onClick={() => navigate('/app')}
          className="px-4 py-2 ml-2 font-bold text-white transition bg-purple-600 rounded-full shadow hover:bg-purple-700"
        >
          Go to Photobooth
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 