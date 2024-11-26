import { ThemeSwitcher } from './ThemeSwitcher';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Navbar, NavbarBrand, NavbarContent, Input, DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar} from "@nextui-org/react";
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function Header() {
  const DEFAULT_AVATAR = "/icons/account.svg";
  const { theme } = useTheme();
  const [user, setUser] = useState({ avatar: DEFAULT_AVATAR, email: null, name: "Guest" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Handle token to see if user is logged in (to display avatar)
  async function handleToken() {
    const token = localStorage.getItem('token');
    if (!token) return { avatar: DEFAULT_AVATAR, email: null, name: "Guest" };
    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setIsAdmin(userData.isAdmin);
      return { avatar: userData.avatar || DEFAULT_AVATAR, email: userData.email, name: userData.firstName || "Guest" };
    } catch (error) {
      return { avatar: DEFAULT_AVATAR, email: null, name: "Guest" };
    }
  }
  
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.info('Logout successful!');
    setTimeout(() => {
      window.location.href = '/'; 
    }, 2000); 
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token){
      setLoggedIn(true);
    }
    async function fetchUser() {
      const userData = await handleToken();
      setUser(userData);
    }
    fetchUser();
  }, []);

  return (
    <Navbar className="pt-6 pr-3 pl-3 pb-6 border-b-2 border-gray-300">
      <NavbarContent justify="start">
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
      </NavbarContent>

      <NavbarContent className="ml-auto flex items-center gap-4">
        <ThemeSwitcher/>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform transform hover:scale-110 hover:shadow-lg focus:outline-none"
              classNames={{ img: "opacity-100" }}
              src={user.avatar}
              name={user.name}
            />
          </DropdownTrigger>
          {loggedIn ? (
            // User (logged in) dropdown
            <DropdownMenu
              aria-label="Profile Actions"
              variant="flat"
              className={`bg-opacity-95 rounded-md border min-w-[10rem] transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-black border-gray-300'
              }`}
            >
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.email}</p>
              </DropdownItem>
              <DropdownItem key="edit" href="/profile/edit" color='primary' className="text-lg text-blue-600">
                Edit Profile
              </DropdownItem>
              {isAdmin ? (
                <DropdownItem key="admin" href="/admin" color="secondary">
                  Admin Portal
                </DropdownItem>
              ) : 
                <DropdownItem href="/">
                  Home Page
                </DropdownItem>
              }
              <DropdownItem key="logout" color='danger' onClick={handleLogout} className="text-lg text-red-600">
                Logout
              </DropdownItem>
            </DropdownMenu>
          ) : (
            // Visitor dropdown
            <DropdownMenu
              aria-label="Visitor Actions"
              variant="flat"
              className={`bg-opacity-95 rounded-md border min-w-[12rem] transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-black border-gray-300'
              }`}
            >
              <DropdownItem key="guest" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{user.name}</p>
              </DropdownItem>
              <DropdownItem key="login" href="/auth/login" color='primary' className="text-lg text-blue-600">
                Login
              </DropdownItem>
              <DropdownItem key="signup" href="/auth/signup" color='primary' className="text-lg text-blue-600">
                Sign Up
              </DropdownItem>
            </DropdownMenu>
          )}
        </Dropdown>

      </NavbarContent>
    </Navbar>
  );
}
