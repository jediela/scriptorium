import { useTheme } from 'next-themes';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Navbar, NavbarBrand } from "@nextui-org/react";
import Link from 'next/link';


export default function PlainNavbar() {
  const { theme } = useTheme();
  return (
    <Navbar className="pt-6 pr-3 pl-3 pb-6 border-b-2 border-gray-300">
        <NavbarBrand>
        <div className="flex gap-4">
            {theme === 'dark' ? (
              <Link
                className="inline-flex justify-center whitespace-nowrap rounded-lg px-3.5 py-2.5 text-2xl font-bold text-slate-800 dark:text-slate-200 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 dark:hover:bg-slate-100 shadow focus:outline-none focus:ring focus:ring-slate-500/50 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500/50 relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
                href="/"
              >
                SCRIPTORIUM
              </Link>
            ) : (
              <Link
                className="inline-flex justify-center whitespace-nowrap rounded-lg px-3.5 py-2.5 text-2xl font-bold text-slate-800 dark:text-slate-200 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 dark:hover:bg-slate-100 shadow focus:outline-none focus:ring focus:ring-slate-500/50 focus-visible:outline-none focus-visible:ring focus-visible:ring-slate-500/50 relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
                href="/"
              >
                SCRIPTORIUM
              </Link>
            )}
            </div>   
        </NavbarBrand>
      <ThemeSwitcher/>
    </Navbar>
  );
}