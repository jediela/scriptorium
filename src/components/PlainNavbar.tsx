import { ThemeSwitcher } from './ThemeSwitcher';
import {Navbar, NavbarBrand, Link} from "@nextui-org/react";

export default function PlainNavbar() {
  return (
    <Navbar className="pt-6 pr-3 pl-3 pb-6 border-b-2 border-gray-300">
      <NavbarBrand>
        <Link href='/' className="text-2xl font-bold text-inherit">SCRIPTORIUM</Link>
      </NavbarBrand>
      <ThemeSwitcher/>
    </Navbar>
  );
}