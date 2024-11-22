import "@/styles/globals.css";
import {NextUIProvider} from "@nextui-org/react";
import {ThemeProvider} from "next-themes";
import { SnackbarProvider } from "notistack";
import { Slide, ToastContainer, toast } from "react-toastify";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }) {
  const snackbarRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if (snackbarRef.current) {
        snackbarRef.current.closeSnackbar();
      }
      toast.dismiss();
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  return (
    <NextUIProvider>
      <SnackbarProvider maxSnack={1} ref={snackbarRef}>
        <ToastContainer position='top-center' autoClose={1000} transition={Slide} limit={1} pauseOnFocusLoss={false}/>
        <ThemeProvider attribute="class" defaultTheme="system">
          <Component {...pageProps} />
        </ThemeProvider>
      </SnackbarProvider>
    </NextUIProvider>
  );
}
