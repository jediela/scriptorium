import "@/styles/globals.css";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider} from "next-themes";

export default function App({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <Component {...pageProps} />
      </ThemeProvider>
    </NextUIProvider>
  );
}
