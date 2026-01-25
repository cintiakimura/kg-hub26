import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Layout({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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