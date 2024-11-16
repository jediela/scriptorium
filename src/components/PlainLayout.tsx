import PlainNavbar from "./PlainNavbar";
import Footer from "./Footer";

import { ReactNode } from "react";

export default function PlainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <PlainNavbar/>
            <main className="flex-grow flex items-center justify-center w-full max-w-screen-lg mx-auto px-4 py-8">
                {children}
            </main>
            <Footer/>
        </div>
    );
}