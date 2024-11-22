import "@/styles/globals.css";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider} from "next-themes";
import { Slide, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }) {
  return (
    <NextUIProvider>
      <ToastContainer position='top-center' autoClose={1000} transition={Slide} limit={1} pauseOnFocusLoss={false}/>
      <ThemeProvider attribute="class" defaultTheme="system">
        <Component {...pageProps} />
      </ThemeProvider>
    </NextUIProvider>
  );
}
