import Logo from "@/components/Logo";
import styles from "@/styles/SignUpLogIn.module.css";
import { AuthReloginError } from "@/types";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import axios from "axios";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, Fragment } from "react";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const router = useRouter();

  const postForgotPassword = async (email: string): Promise<void> => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/forgot-password`, { email });
      toast.info("Reset link sent. Please check your email inbox");
      router.push("/login/");
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.elements[0] as HTMLInputElement;
    postForgotPassword(emailInput.value);
  };

  return (
    <Fragment>
      <Head>
        <title>Noject - Forgot password</title>
        <meta name='description' content='Recover your password by providing your email' />
      </Head>
      <div className={[styles.vh100, "center"].join(" ")}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Logo />
          <h2>Forgot password?</h2>
          <div className={[styles.inputLabelWrapper, "mt-c1"].join(" ")}>
            <label htmlFor='email'>Email</label>
            <input placeholder='Enter your email address' type='email' id='email' />
          </div>
          <button className={styles.btnSubmit} type='submit'>
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
