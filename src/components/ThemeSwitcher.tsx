import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-300 hover:dark:bg-gray-700 transition-colors duration-300 focus:outline-none"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? (
          <Image src="/icons/light.svg" alt="Light Mode Icon" width={24} height={24} />
        ) : (
          <Image src="/icons/dark.svg" alt="Dark Mode Icon" width={24} height={24} />
        )}
      </button>
    </div>
  );
};
