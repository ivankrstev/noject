"use client";
import Logo from "@/components/Logo";
import visibilityOffIcon from "@/public/icons/visibility-off.svg";
import visibilityOnIcon from "@/public/icons/visibility-on.svg";
import styles from "@/styles/SignUpLogIn.module.css";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, Fragment, useState } from "react";
import { toast } from "react-toastify";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  message: string;
  [key: string]: unknown;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

const handleRegister = async (data: HTMLFormControlsCollection): Promise<RegisterResponse> => {
  try {
    const body: RegisterFormData = {
      fullName: (data[0] as HTMLInputElement).value + " " + (data[1] as HTMLInputElement).value,
      email: (data[2] as HTMLInputElement).value,
      password: (data[3] as HTMLInputElement).value,
      confirmPassword: (data[5] as HTMLInputElement).value,
    };
    // Just a short delay for showing the pending message for a moment if the request is quick
    await new Promise((resolve) => setTimeout(resolve, 400));
    const response = await axios.post<RegisterResponse>(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/register/`,
      body
    );
    return response.data;
  } catch (error) {
    if ((error as AxiosError<ErrorResponse>).response) {
      throw (error as AxiosError<ErrorResponse>).response?.data;
    }
    throw error;
  }
};

const postRegister = async (
  data: HTMLFormControlsCollection,
  router: ReturnType<typeof useRouter>
): Promise<void> => {
  try {
    await toast.promise(handleRegister(data), {
      pending: "User Registration in Progress",
      success: {
        render({ data }: { data: RegisterResponse }) {
          return data.message;
        },
      },
      error: {
        render({ data }: { data: ErrorResponse }) {
          return data.message || data.error || "Error signing up";
        },
      },
    });
    setTimeout(() => router.push("/login"), 1000);
  } catch (error) {
    console.error(error);
  }
};

export default function Signup() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    postRegister(e.currentTarget.elements, router);
  };

  return (
    <Fragment>
      <Head>
        <title>Noject - Sign Up</title>
        <meta name='description' content='Sign up to create an account' />
      </Head>
      <div className={[styles.vh100, "center"].join(" ")}>
        <form onSubmit={handleSubmit} className={styles.form}>
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
          <div className={styles.inputLabelWrapper}>
            <label htmlFor='confirm-password'>Confirm password</label>
            <input type='password' id='confirm-password' placeholder='Confirm your password' />
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
