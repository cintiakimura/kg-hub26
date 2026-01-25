import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Layout({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    if (saved === 'light') {
      document.body.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('light');
  };

  return (
    <>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 border border-[#00c600] p-2 rounded bg-[#212121]"
        style={{ backgroundColor: theme === 'light' ? 'white' : '#212121' }}
      >
        {theme === 'dark' ? <Sun size={20} color="#00c600" /> : <Moon size={20} color="#00c600" />}
      </button>
      {children}
    </>
  );
}