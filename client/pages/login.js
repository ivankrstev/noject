import Head from "next/head";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import visibilityOnIcon from "@/public/icons/visibility-on.svg";
import visibilityOffIcon from "@/public/icons/visibility-off.svg";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AnimatePresence, motion } from "framer-motion";

export default function Login() {
  const [totpInputs, setTotpInputs] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(true);

  return (
    <Fragment>
      <Head>
        <title>Noject - Log In</title>
      </Head>
      <motion.main
        key='main'
        initial={{ opacity: 0, x: -200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: -100 }}
        transition={{ type: "linear" }}>
        <AnimatePresence mode='wait'>
          {!show2FA && (
            <motion.div
              key='login'
              initial={{ opacity: 0, x: -200, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 0, y: -100 }}
              transition={{ type: "linear" }}
              className={[styles.vh100, "center"].join(" ")}>
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShow2FA(true);
                  }}
                  className={[styles.btnSubmit].join(" ")}>
                  Log In
                </button>
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
            </motion.div>
          )}
          {show2FA && (
            <motion.div
              key='2fa'
              initial={{ opacity: 0, x: -200, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 0, y: -100 }}
              transition={{ type: "linear" }}
              className={[styles.vh100, "center"].join(" ")}>
              <Fragment>
                <form className={styles.form}>
                  <Logo />
                  <h3 className={styles.totpHeading}>Two-factor Authentication</h3>
                  <div className='mt-c1'>
                    <label htmlFor='totpCode'>Authentication code:</label>
                    <div id='totpInputsWrapper' className={styles.totpCodeWrapper}>
                      <input
                        onInput={async (e) => {
                          console.log(await window.navigator.clipboard.readText());
                          console.log(e);
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        id='totpCode'
                        onFocus={() =>
                          setTotpInputs(document.querySelectorAll("#totpInputsWrapper input"))
                        }
                        onChange={(e) => e.target.value.length > 0 && totpInputs[1].focus()}
                        className={styles.totpCode}
                        required
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
                      let totpCode = "";
                      totpInputs.forEach((e) => (totpCode += e.value));
                    }}
                    className={[styles.btnSubmit].join(" ")}>
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
          )}
        </AnimatePresence>
      </motion.main>
    </Fragment>
  );
}
