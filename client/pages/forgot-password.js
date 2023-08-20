import Head from "next/head";
import { Fragment } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";

export default function ForgotPassword() {
  const router = useRouter();

  const postForgotPassword = async (email) => {
    try {
      await axios.post(process.env.NEXT_PUBLIC_SERVER_URL + "/forgot-password", {
        email,
      });
      toast.info("Reset link sent. Please check your email inbox");
      router.push("/login/");
    } catch (error) {
      AxiosErrorHandler(error);
    }
  };

  return (
    <Fragment>
      <Head>
        <title>Noject - Forgot password</title>
        <meta name='description' content='Recover your password by providing your email' />
      </Head>
      <div className={[styles.vh100, "center"].join(" ")}>
        <form className={styles.form}>
          <Logo />
          <h2>Forgot password?</h2>
          <div className={[styles.inputLabelWrapper, "mt-c1"].join(" ")}>
            <label htmlFor='email'>Email</label>
            <input placeholder='Enter your email address' type='email' id='email' />
          </div>
          <button
            className={styles.btnSubmit}
            onClick={(e) => {
              e.preventDefault();
              postForgotPassword(e.target.form[0].value);
            }}>
            Send reset link
          </button>
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
