import Head from "next/head";
import { useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  return (
    <motion.main
      initial={{ opacity: 0, x: -200, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 0, y: -100 }}
      transitionEnd={{
        display: "none",
      }}
      transition={{ type: "linear" }}>
      <Head>
        <title>Noject - Reset password</title>
      </Head>
      <div className={[styles.vh100, "center"].join(" ")}>
        <form className={styles.form}>
          <Logo />
          <h2>Forgot password?</h2>
          <div className={[styles.inputLabelWrapper, "mt-c1"].join(" ")}>
            <label for='email'>Email</label>
            <input
              placeholder='Enter your email address'
              type='email'
              id='email'
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className={styles.btnSubmit}>Send reset link</button>
          <span className={styles.alterBtns}>
            <Link href='/login'>Log in</Link>
            <span className='colorGrey'>{" or "}</span>
            <Link href='/signup'>Sign up</Link>
          </span>
        </form>
      </div>
    </motion.main>
  );
}
