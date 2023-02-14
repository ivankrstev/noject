import Head from "next/head";
import Image from "next/image";
import { Fragment, useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import visibilityOnIcon from "@/public/icons/visibility-on.svg";
import visibilityOffIcon from "@/public/icons/visibility-off.svg";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Fragment>
      <Head>
        <title>Noject - Log In</title>
      </Head>
      <div className={[styles.vh100, styles.center].join(" ")}>
        <form className={styles.form}>
          <Logo />
          <h2>Log In</h2>
          <div className={styles.inputLabelWrapper}>
            <label htmlFor='email-signup'>Email</label>
            <input type='email' id='email-signup' placeholder='Enter your email' />
          </div>
          <div className={styles.inputLabelWrapper}>
            <label htmlFor='password-signup'>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id='password-signup'
              placeholder='Enter your password'
            />
            <button
              className={styles.btnShowPass}
              type='button'
              onClick={() => setShowPassword(!showPassword)}>
              <Image
                src={showPassword ? visibilityOnIcon : visibilityOffIcon}
                alt='Toggle password icons'
                width={20}
              />
            </button>
          </div>
          <button className={[styles.btnSubmit].join(" ")}>Log In</button>
          <Link className={styles.alterBtns} href='/reset-password'>
            Forgot password?
          </Link>
          <p className={[styles.offerLogin, "mt-0", "colorGrey"].join(" ")}>
            Don't have an account?{" "}
            <Link className={styles.alterBtns} href='/signup'>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </Fragment>
  );
}
