import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, Fragment } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import Logo from "@/components/Logo";
import axios from "axios";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { HashLoader } from "react-spinners";

export default function ResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [renderForm, setRenderForm] = useState(false);

  useEffect(() => {
    if (router.query.reset_token) checkResetTokenValidity(router.query.reset_token);
  }, [router.query.reset_token]);

  const checkResetTokenValidity = async (reset_token) => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password/${reset_token}`);
      setIsLoading(false);
      setRenderForm(true);
    } catch (error) {
      AxiosErrorHandler(error);
      setTimeout(() => {
        setIsLoading(false);
        router.push("/forgot-password");
      }, 500);
    }
  };

  const postResetPassword = async (password, confirmPassword) => {
    try {
      const data = {
        password,
        confirmPassword,
      };
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password/${router.query.reset_token}`,
        data
      );
      router.push("/login/");
    } catch (error) {
      console.error(error);
      AxiosErrorHandler(error);
    }
  };

  return (
    <Fragment>
      <Head>
        <title>Noject - Reset password</title>
        <meta
          name='description'
          content='Reset your password with the generated link sent to year email'
        />
      </Head>
      <div>
        <div className={[styles.vh100, "center"].join(" ")}>
          {isLoading && (
            <div className='center' style={{ width: "100vw", height: "100vh" }}>
              <HashLoader size={120} color='#0570eb' />
            </div>
          )}
          {renderForm && (
            <form className={styles.form}>
              <Logo />
              <h2>Password Reset</h2>
              <div className={styles.inputLabelWrapper}>
                <label htmlFor='newPassword'>New Password</label>
                <input id='newPassword' type='password' placeholder='Enter your new password' />
              </div>
              <div className={styles.inputLabelWrapper}>
                <label htmlFor='confirmPassword'>Confirm New Password</label>
                <input
                  id='confirmPassword'
                  type='password'
                  placeholder='Confirm your new password'
                />
              </div>
              <button
                className={styles.btnSubmit}
                onClick={(e) => {
                  e.preventDefault();
                  postResetPassword(e.target.form[0].value, e.target.form[1].value);
                }}>
                Change password
              </button>
            </form>
          )}
        </div>
      </div>
    </Fragment>
  );
}
