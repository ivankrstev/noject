import Head from "next/head";
import { Fragment, useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  return (
    <Fragment>
      <Head>
        <title>Noject - Reset password</title>
      </Head>
      <div className={[styles.vh100, styles.center].join(" ")}>
        <form className={styles.form}>
          <Logo />
          <h2>Forgot password?</h2>
          <div className={[styles.inputLabelWrapper, "mt-c1"].join(" ")}>
            <label for='email'>Email address:</label>
            <input type='email' id='email' onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className={styles.btnSubmit}>Send reset link</button>
          <span className={styles.alterBtns}>
            <Link href='/login'>Log in</Link>
            <span className='colorGrey'>{" or "}</span>
            <Link href='/signup'>Sign up</Link>
          </span>
        </form>
      </div>
    </Fragment>
  );
}
