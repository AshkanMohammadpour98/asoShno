"use client";
import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // چک کردن تم فعلی سیستم یا ذخیره شده
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-muted/50 border border-border/50 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-muted hover:scale-105 active:scale-95 group text-foreground"
      aria-label="تغییر تم"
      title={isDark ? "حالت روز" : "حالت شب"}
    >
      <span className="text-xl transition-transform duration-500 group-hover:rotate-12">
        {isDark ? <FiSun /> : <FiMoon />}
      </span>
    </button>
  );
};

export default ThemeToggle;
