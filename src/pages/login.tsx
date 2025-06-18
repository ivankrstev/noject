import Logo from "@/components/Logo";
import visibilityOffIcon from "@/public/icons/visibility-off.svg";
import visibilityOnIcon from "@/public/icons/visibility-on.svg";
import styles from "@/styles/SignUpLogIn.module.css";
import { setAccessToken } from "@/utils/api";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, Fragment, MouseEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface LoginCredentials {
  email?: string;
  password?: string;
}

interface TfaCredentials {
  userToken: string;
  tfaToken: string;
}

interface LoginResponse {
  accessToken: string;
  message?: string;
  tfaToken?: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
  tfaToken?: string;
}

const handleLogin = async (
  body: LoginCredentials,
  setTfaToken: (token: string) => void,
  setShow2FA: (show: boolean) => void
): Promise<void> => {
  try {
    // Just a short delay for showing the pending message for a moment if the request is quick
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!body.email)
      body.email = (document.querySelector("#email-login") as HTMLInputElement).value;
    if (!body.password)
      body.password = (document.querySelector("#password-login") as HTMLInputElement).value;
    const response = await axios.post<LoginResponse>(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login/`,
      body,
      {
        withCredentials: true,
      }
    );
    setAccessToken(response.data.accessToken);
    return;
  } catch (error) {
    console.error(error);
    if ((error as AxiosError<ErrorResponse>).response) {
      const errorResponse = (error as AxiosError<ErrorResponse>).response?.data;
      if (errorResponse?.tfaToken) {
        setTfaToken(errorResponse.tfaToken);
        setShow2FA(true);
      }
      throw errorResponse;
    }
    throw error;
  }
};

const handleTFAVerify = async (
  body: TfaCredentials,
  setShow2FA: (show: boolean) => void
): Promise<void> => {
  try {
    // Just a short delay for showing the pending message for a moment if the request is quick
    await new Promise((resolve) => setTimeout(resolve, 400));
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/tfa/verify/`,
      body,
      {
        withCredentials: true,
      }
    );
    setAccessToken(response.data.accessToken);
    return;
  } catch (error) {
    console.error(error);
    if ((error as AxiosError<ErrorResponse>).response) {
      const errorResponse = (error as AxiosError<ErrorResponse>).response?.data;
      if (errorResponse?.error === "Please log in again") setShow2FA(false);
      throw errorResponse;
    }
    throw error;
  }
};

export default function Login() {
  const [totpInputs, setTotpInputs] = useState<HTMLInputElement[]>([]);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [show2FA, setShow2FA] = useState<boolean>(false);
  const [tfaToken, setTfaToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!show2FA) setPassword("");
  }, [show2FA]);

  const postLogin = async (): Promise<void> => {
    try {
      await toast.promise(handleLogin({ email, password }, setTfaToken, setShow2FA), {
        pending: "Logging in",
        success: "Logged in successfully",
        error: {
          render({ data, toastProps }) {
            if ((data as ErrorResponse).error === "Two-Factor Authentication needed")
              toastProps.type = "warning";
            return (
              (data as ErrorResponse).message || (data as ErrorResponse).error || "Error logging in"
            );
          },
        },
      });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const postTFAVerify = async (userToken: string): Promise<void> => {
    try {
      await toast.promise(handleTFAVerify({ userToken, tfaToken }, setShow2FA), {
        pending: "Logging in",
        success: "Logged in successfully",
        error: {
          render({ data }: { data: ErrorResponse }) {
            return data.message || data.error || "Error logging in";
          },
        },
      });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Fragment>
      <Head>
        <title>Noject - Log In</title>
        <meta name='description' content='Log in to your account' />
      </Head>
      <div className={styles.flipLoginForm}>
        <motion.div
          key='login'
          className={[styles.vh100, styles.flipLoginFront, "center"].join(" ")}
          animate={show2FA ? { rotateY: 180 } : { rotateY: 0 }}
          transition={{ ease: "linear" }}>
          <form className={styles.form}>
            <Logo />
            <h2>Log In</h2>
            <div className={styles.inputLabelWrapper}>
              <label htmlFor='email-login'>Email</label>
              <input
                type='email'
                id='email-login'
                placeholder='Enter your email'
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                value={email ? email : ""}
              />
            </div>
            <div className={styles.inputLabelWrapper}>
              <label htmlFor='password-login'>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id='password-login'
                placeholder='Enter your password'
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
            <button
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                postLogin();
              }}
              className={[styles.btnSubmit].join(" ")}>
              Log In
            </button>
            <Link className={styles.alterBtns} href='/forgot-password'>
              Forgot password?
            </Link>
            <p className={[styles.offerLogin, "mt-0", "colorGrey"].join(" ")}>
              {"Don't have an account? "}
              <Link className={styles.alterBtns} href='/signup'>
                Sign Up
              </Link>
            </p>
          </form>
        </motion.div>

        <motion.div
          key='2fa'
          className={[styles.vh100, styles.flipLoginBack, "center"].join(" ")}
          initial={{ rotateY: -180 }}
          animate={show2FA ? { rotateY: 0 } : { rotateY: -180 }}
          transition={{ ease: "linear" }}>
          <Fragment>
            <form className={styles.form}>
              <Logo />
              <h3 className={styles.totpHeading}>Two-factor Authentication</h3>
              <div className='mt-c1'>
                <label htmlFor='totpCode'>Authentication code:</label>
                <div id='totpInputsWrapper' className={styles.totpCodeWrapper}>
                  <input
                    onPaste={async () => {
                      const code = await navigator.clipboard.readText();
                      for (let i = 1; i < totpInputs.length; i++) {
                        if (code[i]) totpInputs[i].value = code[i];
                      }
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    id='totpCode'
                    onFocus={() =>
                      setTotpInputs(
                        Array.from(
                          document.querySelectorAll<HTMLInputElement>("#totpInputsWrapper input")
                        )
                      )
                    }
                    aria-labelledby='First TOTP digit'
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      e.target.value.length > 0 && totpInputs[1]?.focus()
                    }
                    className={styles.totpCode}
                    required
                    maxLength={1}
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    aria-labelledby='Second TOTP digit'
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      e.target.value.length > 0 && totpInputs[2]?.focus()
                    }
                    className={styles.totpCode}
                    required
                    maxLength={1}
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    aria-labelledby='Third TOTP digit'
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      e.target.value.length > 0 && totpInputs[3]?.focus()
                    }
                    className={styles.totpCode}
                    required
                    maxLength={1}
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    aria-labelledby='Fourth TOTP digit'
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      e.target.value.length > 0 && totpInputs[4]?.focus()
                    }
                    className={styles.totpCode}
                    required
                    maxLength={1}
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    aria-labelledby='Fifth TOTP digit'
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      e.target.value.length > 0 && totpInputs[5]?.focus()
                    }
                    className={styles.totpCode}
                    required
                    maxLength={1}
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    aria-labelledby='Sixth TOTP digit'
                    className={styles.totpCode}
                    required
                    maxLength={1}
                    pattern='[0-9]{1}'
                    type='text'
                  />
                </div>
              </div>
              <button
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  let userToken = "";
                  totpInputs.forEach((e) => (userToken += e.value));
                  postTFAVerify(userToken);
                }}
                className={styles.btnSubmit}>
                Verify
              </button>
              <button
                className={styles.totpGoBack}
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  setShow2FA(false);
                }}>
                Go back
              </button>
            </form>
          </Fragment>
        </motion.div>
      </div>
    </Fragment>
  );
}
