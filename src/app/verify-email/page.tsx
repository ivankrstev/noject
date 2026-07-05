"use client";
import axios, { AxiosError, AxiosResponse } from "axios";
import Head from "next/head";
import { useSearchParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

interface VerifyEmailResponse {
  message: string;
}

interface ErrorResponse {
  error: string;
}

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const verifyToken = useCallback(async (): Promise<void> => {
    try {
      const response: AxiosResponse<VerifyEmailResponse> = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/verify-email?token=${token}&email=${email}`
      );
      toast.success(response.data.message);
      router.push("/login");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;

      if (axiosError.code === "ERR_NETWORK") {
        toast.error("Network Error");
      } else if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error("Oops! Something went wrong");
      }
      router.push("/login");
    }
  }, [token, email, router]);

  useEffect(() => {
    if (token && email) verifyToken();
  }, [token, email, verifyToken]);

  return (
    <Fragment>
      <Head>
        <title>Noject - Verifying Email</title>
      </Head>
    </Fragment>
  );
}
