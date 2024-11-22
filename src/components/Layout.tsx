import Navbar from "./Header";
import Footer from "./Footer";
import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function Layout({ children }: { children: ReactNode }) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen flex flex-col bg-neutral-100"></div>;
    }

    return (
        <div
        className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}
        data-theme={theme}
        >             
            <Navbar/>
            <main className="flex-grow w-full max-w-screen-lg mx-auto px-4 py-8">
                {children}
            </main>
            <Footer/>
        </div>
    );
}
