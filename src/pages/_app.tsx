import "@/styles/globals.css";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider} from "next-themes";
import { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <Component {...pageProps} />
      </ThemeProvider>
    </NextUIProvider>
  );
}