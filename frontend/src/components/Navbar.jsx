import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

const Navbar = ({ toggleSidebar, darkMode, setDarkMode }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md transition-colors duration-300">
      {/* Mobile Toggle & Menu Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="font-semibold text-lg text-slate-800 dark:text-slate-100 hidden sm:inline-block">
          Console Overview
        </span>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          System Live
        </div>
      </div>
    </header>
  );
};

export default Navbar;
