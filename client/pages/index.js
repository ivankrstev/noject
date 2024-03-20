import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";

export default function Home() {
  return (
    <Fragment>
      <Head>
        <title>Noject</title>
        <meta name='description' content='Task management application' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div>
        <Link href={"/login/"}>Log In</Link>
        <Link href={"/signup/"}>Sign Up</Link>
        <Link href={"/dashboard/"}>Dasboard</Link>
      </div>
    </Fragment>
  );
}
