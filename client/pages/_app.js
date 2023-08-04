import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import { Space_Mono } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import useFoucFix from "@/utils/use-fouc-fix";

const inter = Space_Mono({ subsets: ["latin"], weight: "400" });

export default function App({ Component, pageProps, router }) {
  useFoucFix();

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
        <motion.main
          key={router.asPath}
          initial={{ opacity: 0, x: -200, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 0, y: -100 }}
          transition={{ ease: "easeInOut" }}>
          <Component key={router.asPath} {...pageProps} />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
