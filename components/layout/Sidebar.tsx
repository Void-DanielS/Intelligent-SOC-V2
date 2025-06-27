
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../../constants'; // Corrected path
import { NavItem } from '../../types';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-dark-card text-dark-text-secondary space-y-6 py-7 px-2 fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="px-4 mb-8">
        <h2 className="text-2xl font-semibold text-dark-text-primary">SOC Dashboard</h2>
        <p className="text-xs text-dark-text-secondary">Análisis en Tiempo Real</p>
      </div>
      <nav>
        {NAVIGATION_ITEMS.map((item: NavItem) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-150 ease-in-out hover:bg-gray-700 hover:text-dark-text-primary ${
                isActive ? 'bg-accent text-white shadow-lg' : 'text-dark-text-secondary'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          Powered by React & Tailwind
      </div>
    </div>
  );
};

export default Sidebar;
    