import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kg-theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const saved = localStorage.getItem('kg-theme') || 'dark';
    setTheme(saved);
    
    if (saved === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('kg-theme', newTheme);
    
    if (newTheme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 border border-[#00c600] p-2 rounded transition-all duration-200 hover:shadow-[0_0_8px_rgba(0,198,0,0.6)]"
        style={{ backgroundColor: theme === 'light' ? 'white' : '#212121' }}
      >
        {theme === 'dark' ? <Sun size={20} color="#00c600" /> : <Moon size={20} color="#00c600" />}
      </button>
      {children}
    </>
  );
}