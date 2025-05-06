import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect } from "react";
import { toast } from "react-toastify";

export default function VerifyEmail() {
  const router = useRouter();
  const { token = "", email = "" } = router.query;

  const verifyToken = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/verify-email?token=${token}&email=${email}`
      );
      toast.success(response.data.message);
      router.push("/login");
    } catch (error) {
      if (error.code === "ERR_NETWORK") toast.error("Network Error");
      else if (error.response) toast.error(error.response.data.error);
      else toast.error("Oops! Something went wrong");
      router.push("/login");
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
