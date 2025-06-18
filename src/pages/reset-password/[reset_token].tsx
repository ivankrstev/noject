import Logo from "@/components/Logo";
import styles from "@/styles/SignUpLogIn.module.css";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, MouseEvent, useCallback, useEffect, useState } from "react";
import { HashLoader } from "react-spinners";

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

interface ApiError {
  message?: string;
  error?: string;
}

export default function ResetPassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [renderForm, setRenderForm] = useState<boolean>(false);

  const checkResetTokenValidity = useCallback(
    async (reset_token: string): Promise<void> => {
      try {
        await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password/${reset_token}`);
        setIsLoading(false);
        setRenderForm(true);
      } catch (error) {
        AxiosErrorHandler(error as AxiosError<ApiError>);
        setTimeout(() => {
          setIsLoading(false);
          router.push("/forgot-password");
        }, 500);
      }
    },
    [router]
  );

  useEffect(() => {
    const resetToken = router.query.reset_token;
    if (resetToken && typeof resetToken === "string") {
      checkResetTokenValidity(resetToken);
    }
  }, [router.query.reset_token, checkResetTokenValidity]);

  const postResetPassword = async (password: string, confirmPassword: string): Promise<void> => {
    try {
      const data: ResetPasswordData = {
        password,
        confirmPassword,
      };

      const resetToken = router.query.reset_token;
      if (!resetToken || typeof resetToken !== "string") {
        throw new Error("Invalid reset token");
      }

      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password/${resetToken}`, data);
      router.push("/login/");
    } catch (error) {
      console.error(error);
      AxiosErrorHandler(error as AxiosError<ApiError>);
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
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  // Type assertion for the form elements
                  const form = e.currentTarget.form;
                  if (form) {
                    const passwordInput = form[0] as HTMLInputElement;
                    const confirmPasswordInput = form[1] as HTMLInputElement;
                    postResetPassword(passwordInput.value, confirmPasswordInput.value);
                  }
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
