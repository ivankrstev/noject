import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import visibilityOnIcon from "@/public/icons/visibility-on.svg";
import visibilityOffIcon from "@/public/icons/visibility-off.svg";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AnimatePresence, motion } from "framer-motion";
import { setAccessToken } from "@/utils/api";
import axios from "axios";
import { toast } from "react-toastify";

const handleLogin = async (body, setTfaToken, setShow2FA) => {
  try {
    // Just a short delay for showing the pending message for a moment if the request is quick
    await new Promise((resolve) => setTimeout(resolve, 400));
    const response = await axios.post("http://localhost:5000/login/", body, {
      withCredentials: true,
    });
    setAccessToken(response.data.accessToken);
    return;
  } catch (error) {
    if (error.response) {
      if (error.response.data.tfaToken) {
        setTfaToken(error.response.data.tfaToken);
        setShow2FA(true);
      }
      throw error.response.data;
    }
    throw error;
  }
};

const handleTFAVerify = async (body, setShow2FA) => {
  try {
    // Just a short delay for showing the pending message for a moment if the request is quick
    await new Promise((resolve) => setTimeout(resolve, 400));
    const response = await axios.post("http://localhost:5000/tfa/verify/", body, {
      withCredentials: true,
    });
    setAccessToken(response.data.accessToken);
    return;
  } catch (error) {
    if (error.response) {
      if (error.response.data.error === "Please log in again") setShow2FA(false);
      throw error.response.data;
    }
    throw error;
  }
};

export default function Login() {
  const [totpInputs, setTotpInputs] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [tfaToken, setTfaToken] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const router = useRouter();

  useEffect(() => {
    if (!show2FA) setPassword(null);
  }, [show2FA]);

  const postLogin = async () => {
    try {
      await toast.promise(handleLogin({ email, password }, setTfaToken, setShow2FA), {
        pending: "Logging in",
        success: "Logged in successfully",
        error: {
          render({ data, toastProps }) {
            if (data.error === "Two-Factor Authentication needed") toastProps.type = "warning";
            return data.message || data.error;
          },
        },
      });
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      console.error(error);
    }
  };

  const postTFAVerify = async (userToken) => {
    try {
      await toast.promise(handleTFAVerify({ userToken, tfaToken }, setShow2FA), {
        pending: "Logging in",
        success: "Logged in successfully",
        error: {
          render({ data }) {
            return data.message || data.error;
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
      </Head>
      <motion.main
        key='main-login'
        initial={{ opacity: 0, x: -200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: -100 }}
        transition={{ ease: "linear" }}
        className={styles.flipLoginForm}>
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
                onChange={(e) => setEmail(e.target.value)}
                value={email ? email : ""}
              />
            </div>
            <div className={styles.inputLabelWrapper}>
              <label htmlFor='password-login'>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id='password-login'
                placeholder='Enter your password'
                onChange={(e) => setPassword(e.target.value)}
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
              onClick={(e) => {
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
              Don't have an account?{" "}
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
                      const code = await window.navigator.clipboard.readText();
                      for (let i = 1; i < totpInputs.length; i++) totpInputs[i].value = code[i];
                      document.activeElement.blur();
                    }}
                    id='totpCode'
                    onFocus={() =>
                      setTotpInputs(document.querySelectorAll("#totpInputsWrapper input"))
                    }
                    onChange={(e) => e.target.value.length > 0 && totpInputs[1].focus()}
                    className={styles.totpCode}
                    required
                    maxLength='1'
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    onChange={(e) => e.target.value.length > 0 && totpInputs[2].focus()}
                    className={styles.totpCode}
                    required
                    maxLength='1'
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    onChange={(e) => e.target.value.length > 0 && totpInputs[3].focus()}
                    className={styles.totpCode}
                    required
                    maxLength='1'
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    onChange={(e) => e.target.value.length > 0 && totpInputs[4].focus()}
                    className={styles.totpCode}
                    required
                    maxLength='1'
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    onChange={(e) => e.target.value.length > 0 && totpInputs[5].focus()}
                    className={styles.totpCode}
                    required
                    maxLength='1'
                    pattern='[0-9]{1}'
                    type='text'
                  />
                  <input
                    className={styles.totpCode}
                    required
                    maxLength='1'
                    pattern='[0-9]{1}'
                    type='text'
                  />
                </div>
              </div>
              <button
                onClick={(e) => {
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
                onClick={(e) => {
                  e.preventDefault();
                  setShow2FA(false);
                }}>
                Go back
              </button>
            </form>
          </Fragment>
        </motion.div>
      </motion.main>
    </Fragment>
  );
}
