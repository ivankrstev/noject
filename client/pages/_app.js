import "@/styles/globals.css";
import { Space_Mono } from "@next/font/google";
import { AnimatePresence } from "framer-motion";

const inter = Space_Mono({ subsets: ["latin"], weight: "400" });

export default function App({ Component, pageProps, router }) {
  return (
    <div className={inter.className}>
      <AnimatePresence mode='wait' initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <Component key={router.asPath} {...pageProps} />
      </AnimatePresence>
    </div>
  );
}
