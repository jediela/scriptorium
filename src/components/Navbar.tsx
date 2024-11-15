import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const DEFAULT_AVATAR = "/icons/account.svg";

// Handle token to see if user is logged in (to display avatar)
async function handleLogToken() {
  const token = localStorage.getItem('token');
  // Not logged in (visitor)
  if (!token) {
    return DEFAULT_AVATAR;
  }
  try {
    const response = await fetch('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // User logged in, display their avatar
    if (response.ok) {
      const userData = await response.json();
      return userData.avatar || DEFAULT_AVATAR;
    } 
    else {
      return DEFAULT_AVATAR;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    return DEFAULT_AVATAR;
  }
}

export default function Navbar() {
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    async function fetchAvatar() {
      const userAvatar = await handleLogToken();
      setAvatar(userAvatar);
    }
    fetchAvatar();
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Scriptorium</Link>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-4">Login</Link>
          <Image
            src={avatar}
            alt="User Avatar"
            width={30}
            height={30}
            className="rounded-full"
          />
        </div>
      </div>
    </nav>
  );
}
