import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    const newTheme = !darkMode ? 'dark' : 'light';
    setDarkMode(!darkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button onClick={toggleTheme}>
      <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
    </button>
  );
};


export default ThemeToggle;
