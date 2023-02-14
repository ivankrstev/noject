import Head from "next/head";
import Image from "next/image";
import { Fragment, useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import visibilityOnIcon from "public/icons/visibility-on.svg";
import visibilityOffIcon from "public/icons/visibility-off.svg";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Fragment>
      <Head>
        <title>Noject - Sign Up</title>
      </Head>
      <div className={[styles.vh100, styles.center].join(" ")}>
        <form className={styles.form}>
          <Logo />
          <h2 className={styles.textLeft}>Sign Up</h2>
          <div className={styles.nameSepar}>
            <div className={styles.inputLabelWrapper}>
              <label htmlFor='name-signup'>First Name</label>
              <input type='text' id='name-signup' placeholder='First name' />
            </div>
            <div className={styles.inputLabelWrapper}>
              <label htmlFor='surname-signup'>Last Name</label>
              <input type='text' id='surname-signup' placeholder='Last name' />
            </div>
          </div>
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
              <Image src={showPassword ? visibilityOnIcon : visibilityOffIcon} width={20} />
            </button>
          </div>
          <button className={styles.btnSubmit}>Create account</button>
          <p className={[styles.offerLogin, "colorGrey"].join(" ")}>
            Already have an account?{" "}
            <Link className={styles.alterBtns} href='/login'>
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Fragment>
  );
}
