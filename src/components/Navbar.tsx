import Link from 'next/link';
import Image from 'next/image';


export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">Scriptorium</Link>
        <div>
          <Link href="/login" className="px-4">Login</Link>
        </div>
        <button aria-label="Menu">
          <Image src="/icons/burger-menu.svg" alt="Menu Icon" width={30} height={30} />
        </button>
      </div>
    </nav>
  );
}
