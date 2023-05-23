import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { Fragment } from "react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <Fragment>
      <Head>
        <title>Noject</title>
        <meta name='description' content='Task management application' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <motion.div
        key='homepage'
        initial={{ opacity: 0, x: -200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: -100 }}
        transition={{ type: "linear" }}>
        <Link href={"/login/"}>Log In</Link>
        <Link href={"/signup/"}>Sign Up</Link>
        <Link href={"/dashboard/"}>Dasboard</Link>
      </motion.div>
    </Fragment>
  );
}
