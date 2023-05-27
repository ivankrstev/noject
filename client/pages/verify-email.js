import Head from "next/head";
import { Fragment, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import api from "@/utils/api";

export default function VerifyEmail() {
  const router = useRouter();
  const { token = "", email = "" } = router.query;

  const verifyToken = async () => {
    try {
      const response = await api.get(`/verify-email?token=${token}&email=${email}`);
      console.log(response);
      toast.success(response.data.message);
      router.push("/account");
    } catch (error) {
      console.error("error:", error);
      if (error.code === "ERR_NETWORK") toast.error("Network Error");
      else if (error.response) toast.error(error.response.data.error);
      else toast.error("Oops! Something went wrong");
      router.push("/account");
    }
  };

  useEffect(() => {
    if (token && email) verifyToken();
  }, [token]);

  return (
    <Fragment>
      <Head>
        <title>Noject - Verifying Email</title>
      </Head>
    </Fragment>
  );
}
