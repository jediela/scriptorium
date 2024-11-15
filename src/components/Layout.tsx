import Navbar from './Navbar';
import Footer from "./Footer";

import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }){
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar/>
            <main className="flex-grow w-full max-w-screen-lg mx-auto px-4 py-8">
                {children}
            </main>
            <Footer/>
        </div>
    );
}
