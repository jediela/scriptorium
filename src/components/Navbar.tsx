import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Navbar() {
  const DEFAULT_AVATAR = "/icons/account.svg";
  const [user, setUser] = useState({ avatar: DEFAULT_AVATAR, name: null });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle token to see if user is logged in (to display avatar)
  async function handleToken(){
    const token = localStorage.getItem('token');
    if (!token) {
      return { avatar: DEFAULT_AVATAR, name: null };
    }
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        return { avatar: userData.avatar || DEFAULT_AVATAR, name: userData.firstName };
      } 
      else {
        return { avatar: DEFAULT_AVATAR, name: null };
      }
    } catch (error) {
      return { avatar: DEFAULT_AVATAR, name: null };
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    toast.success('Logout successful!');
    setTimeout(() => {
      window.location.href = '/'; 
    }, 2000); 
  };

  useEffect(() => {
    async function fetchUser() {
      const userData = await handleToken();
      console.log(userData);
      setUser(userData);
    }
    fetchUser();
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Scriptorium</Link>
        <div className="relative">
          <button onClick={toggleMenu} className="focus:outline-none">
            <Image
              src={user.avatar}
              alt="User Avatar"
              width={35}
              height={35}
              className="rounded-full"
            />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
              {user.name ? (
                // Logged in user menu
                <>
                  <p className="px-4 py-2">Hi, {user.name}!</p>
                  <Link href="/editProfile" className="block px-4 py-2 hover:bg-gray-200"> Edit Profile </Link>             
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200"> Log out </button>
                </>
              ) : (
                // Visitor menu
                  <Link href="/login" className="block px-4 py-2 hover:bg-gray-200"> Log in </Link>             
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
