import { useTheme } from "next-themes";
import Image from "next/image";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="focus:outline-none flex items-center justify-center"
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
