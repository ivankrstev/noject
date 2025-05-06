import "@/styles/globals.css";
import { Space_Mono } from "next/font/google";
import "react-loading-skeleton/dist/skeleton.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Space_Mono({ subsets: ["latin"], weight: "400" });

export default function App({ Component, pageProps }) {
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
      <Component {...pageProps} />
    </div>
  );
}
