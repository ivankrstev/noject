import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import styles from "@/styles/SignUpLogIn.module.css";
import visibilityOnIcon from "public/icons/visibility-on.svg";
import visibilityOffIcon from "public/icons/visibility-off.svg";
import Link from "next/link";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";

const handleRegister = async (data) => {
  try {
    let body = {
      firstName: data[0].value,
      lastName: data[1].value,
      email: data[2].value,
      password: data[3].value,
    };
    // Just a short delay for showing the pending message for a moment if the request is quick
    await new Promise((resolve) => setTimeout(resolve, 400));
    const response = await axios.post("http://localhost:5000/register/", body);
    return response.data;
  } catch (error) {
    if (error.response) throw error.response.data;
    throw error;
  }
};

const postRegister = async (data, router) => {
  try {
    await toast.promise(handleRegister(data, router), {
      pending: "User Registration in Progress",
      success: {
        render({ data }) {
          return data.message;
        },
      },
      error: {
        render({ data }) {
          return data.message || data.error;
        },
      },
    });
    setTimeout(() => router.push("/login"), 1000);
  } catch (error) {
    console.error(error);
  }
};

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <Fragment>
      <Head>
        <title>Noject - Sign Up</title>
      </Head>
      <motion.main
        initial={{ opacity: 0, x: -200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: -100 }}
        transition={{ type: "linear" }}>
        <div className={[styles.vh100, "center"].join(" ")}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              postRegister(e.target.elements, router);
            }}
            className={styles.form}>
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
                <Image
                  alt='Toggle Password Visibility'
                  src={showPassword ? visibilityOnIcon : visibilityOffIcon}
                  width={20}
                />
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
      </motion.main>
    </Fragment>
  );
}
