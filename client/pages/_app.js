import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Space_Mono } from "next/font/google";
import { AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";

const inter = Space_Mono({ subsets: ["latin"], weight: "400" });

export default function App({ Component, pageProps, router }) {
  return (
    <div className={inter.className}>
      <ToastContainer
        position='top-right'
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='colored'
      />
      <AnimatePresence mode='wait' initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <Component key={router.asPath} {...pageProps} />
      </AnimatePresence>
    </div>
  );
}
