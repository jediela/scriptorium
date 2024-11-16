import Link from 'next/link';

export default function PlainNavbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">Scriptorium</Link>
      </div>
    </nav>
  );
}