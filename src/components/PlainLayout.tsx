import PlainNavbar from "./PlainNavbar";
import Footer from "./Footer";

import { ReactNode } from "react";
import { useTheme } from "next-themes";

export default function PlainLayout({ children }: { children: ReactNode }) {
    const { theme } = useTheme();
    return (
        <div
        className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}
        data-theme={theme}
        >            
            <PlainNavbar/>
            <main className="flex-grow flex items-center justify-center w-full max-w-screen-lg mx-auto px-4 py-8">
                {children}
            </main>
            <Footer/>
        </div>
    );
}