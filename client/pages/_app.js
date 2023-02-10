import "@/styles/globals.css";
import { Space_Mono } from "@next/font/google";

const inter = Space_Mono({ subsets: ["latin"], weight: "400" });

export default function App({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
