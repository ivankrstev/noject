import Navbar from "@/components/Navbar";
import Pic from "@/public/icons/account_circle.svg";
// import CloseIcon from "@/public/icons/close.svg";
import styles from "@/styles/Account.module.css";
import { AuthReloginError } from "@/types";
import api from "@/utils/api";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { AxiosResponse } from "axios";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
// import { QRCodeCanvas } from "qrcode.react";
import { ChangeEvent, FormEvent, Fragment, useCallback, useEffect, useState } from "react";
// import Modal from "react-modal";
import GridLoader from "react-spinners/BeatLoader";
import { toast } from "react-toastify";

interface UserData {
  first_name: string;
  last_name: string;
  u_id: string;
  verified_email: boolean;
  tfa_activated: boolean;
  created_at?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ApiResponse {
  message: string;
  [key: string]: unknown;
}

export default function Account() {
  // const [tfaPage, setTfaPage] = useState<number>(2);
  // const [openModal, setOpenModal] = useState<boolean>(false);
  // const [tfaActivated, setTfaActivated] = useState<boolean>(true);
  const [verifiedEmail, setVerifiedEmail] = useState<boolean | undefined>(undefined);
  const [data, setData] = useState<UserData | undefined>(undefined);
  // const [qrSecret, setQrSecret] = useState<string>("");
  const [image, setImage] = useState<string | null>("");
  const router = useRouter();

  // const enableDisableTFA = async (): Promise<void> => {
  //   try {
  //     const userTokenInput = document.querySelector("#userTokenTFA") as HTMLInputElement;
  //     const userToken = userTokenInput.value;
  //     const response = await api.put<ApiResponse>(tfaActivated ? "/tfa/disable/" : "tfa/enable/", {
  //       userToken,
  //     });
  //     if (response.data.message === "Two Factor Authenitication is disabled")
  //       setTfaActivated(false);
  //     else setTfaActivated(true);
  //     setOpenModal(false);
  //     toast.success(response.data.message);
  //   } catch (error) {
  //     AxiosErrorHandler(error as AuthReloginError, router);
  //   }
  // };

  const convertImageToBase64 = useCallback((response: AxiosResponse): void => {
    if (response.data.size === 0) setImage(null);
    else {
      const blob = new Blob([response.data], { type: "image/jpg" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
      };
    }
  }, []);

  const getDetails = useCallback(async (): Promise<void> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const response = await api.get<UserData>("/account/all");
      setData(response.data);
      const responsePic = await api.get("/account/picture/get", { responseType: "blob" });
      convertImageToBase64(responsePic);
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  }, [convertImageToBase64, router]);

  const changePassword = async (formElements: HTMLFormControlsCollection): Promise<void> => {
    try {
      const data: PasswordChangeData = {
        currentPassword: (formElements[0] as HTMLInputElement).value,
        newPassword: (formElements[1] as HTMLInputElement).value,
        confirmNewPassword: (formElements[2] as HTMLInputElement).value,
      };
      await new Promise((resolve) => setTimeout(resolve, 400));
      const response = await api.put<ApiResponse>("/account/password/change", data);
      toast.success(response.data.message);
      const form = document.querySelector("#change-password-form") as HTMLFormElement;
      form.reset();
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  };

  useEffect(() => {
    getDetails();
  }, [getDetails]);

  useEffect(() => {
    if (data) {
      setVerifiedEmail(data.verified_email);
      // setTfaActivated(data.tfa_activated);
    }
  }, [data]);

  // useEffect(() => {
  //   if (tfaActivated) setTfaPage(2);
  //   else setTfaPage(1);
  // }, [tfaActivated]);

  // useEffect(() => {
  //   if (tfaPage === 1 && openModal) {
  //     const generateTfaSecret = async (): Promise<void> => {
  //       try {
  //         const response = await api.post<{ secret: string }>("/tfa/generate");
  //         setQrSecret(response.data.secret);
  //       } catch (error) {
  //         AxiosErrorHandler(error as AuthReloginError, router);
  //       }
  //     };
  //     generateTfaSecret();
  //   }
  // }, [tfaPage, openModal, router]);

  return (
    <Fragment>
      <Head>
        <title>Noject - My account</title>
        <meta
          name='description'
          content='Manage your account settings, profile picture, email verification and two-factor authentication on Noject.'
        />
      </Head>

      <Navbar showSidebar={true} showBtnDashboard={true} />
      <div className={styles.account}>
        <GridLoader
          loading={!data}
          color='#36d7b7'
          size={20}
          aria-label='Loading Spinner'
          data-testid='loader'
        />
        {data && (
          <Fragment>
            <div className={styles.profileInfo}>
              <Image
                src={image ? image : Pic.src}
                style={{
                  filter: image
                    ? ""
                    : "invert(27%) sepia(100%) saturate(2132%) hue-rotate(201deg) brightness(96%)contrast(96%)",
                }}
                alt='Profile Picture'
              />
              <form>
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  multiple={false}
                  name='profile_picture'
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    try {
                      const formElement = e.target.parentNode as HTMLFormElement;
                      const formData = new FormData(formElement);
                      const responsePic = await api.post("/account/picture/upload", formData, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                        responseType: "blob",
                      });
                      convertImageToBase64(responsePic);
                      toast.success("Updated profile picture");
                    } catch (error) {
                      toast.error("Oops! Something went wrong");
                      console.error(error);
                    }
                  }}
                />
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    const fileInput = e.currentTarget.previousSibling as HTMLInputElement;
                    fileInput.click();
                  }}>
                  Change Picture
                </button>
              </form>
              <h3>
                {data.first_name} {data.last_name}
              </h3>
              <p>{data.u_id}</p>
              <p>Created on: </p>
            </div>

            <form className={styles.changeEmailForm}>
              <p>Your email is {verifiedEmail ? "verified." : "not verified."}</p>
              {!verifiedEmail && (
                <button
                  onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    try {
                      const response = await api.post<ApiResponse>("/send-verify");
                      toast.success(response.data.message);
                    } catch (error) {
                      AxiosErrorHandler(error as AuthReloginError, router);
                    }
                  }}>
                  Send confirmation link
                </button>
              )}
            </form>

            <form
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                changePassword(e.currentTarget.elements);
              }}
              id='change-password-form'
              className={styles.changePasswordForm}>
              <h4>Change your password</h4>
              <label htmlFor='current-password'>Current password:</label>
              <input
                id='current-password'
                required
                type='password'
                placeholder='Enter your old password'
              />
              <label htmlFor='new-password'>New password:</label>
              <input
                required
                minLength={10}
                id='new-password'
                type='password'
                placeholder='Enter your new password'
              />
              <label htmlFor='confirm-password'>Confirm password:</label>
              <input
                minLength={10}
                required
                id='confirm-password'
                type='password'
                placeholder='Reenter your new password'
              />
              <button>Change password</button>
            </form>

            {/* <div className={styles.twoFactorAuth}>
              <p>
                Two Factor Authentication is {tfaActivated ? "enabled. " : "disabled. "}
                <button
                  className={styles.toggleTwoFactorAuthBtn}
                  onClick={() => setOpenModal(true)}>
                  {tfaActivated ? "Disable" : "Enable"}
                </button>
              </p>
              <Modal className={styles.twoFactorModal} isOpen={openModal} ariaHideApp={false}>
                <div className={styles.scanQrCode}>
                  <div className={styles.scanQrCodeHeader}>
                    <h3>
                      {!tfaActivated
                        ? "Enable two-factor authentication"
                        : "Disable two-factor authentication"}
                    </h3>
                    <button onClick={() => setOpenModal(false)}>
                      <Image src={CloseIcon} alt='Close Modal' width={30} />
                    </button>
                  </div>
                  {tfaPage === 1 && (
                    <Fragment>
                      <div className={styles.qrCodeImg}>
                        <QRCodeCanvas value={"otpauth://totp/Noject?secret=" + qrSecret} />
                      </div>
                      <p>
                        Scan the QR code or manually enter the following code:{" "}
                        <span>{qrSecret}</span>
                      </p>
                      <button className={styles.complete2FABtn} onClick={() => setTfaPage(2)}>
                        Continue
                      </button>
                    </Fragment>
                  )}
                  {tfaPage === 2 && (
                    <Fragment>
                      <label>Enter the code generated by your authentication app.</label>
                      <input type='text' id='userTokenTFA' />
                      <div className={styles.twoFactorFormButtons}>
                        {!tfaActivated && (
                          <button
                            style={{
                              backgroundColor: "grey",
                              borderColor: "grey",
                              marginRight: "0.3em",
                            }}
                            className={styles.complete2FABtn}
                            onClick={() => setTfaPage(1)}>
                            Go Back
                          </button>
                        )}
                        <button
                          className={styles.complete2FABtn}
                          onClick={() => {
                            enableDisableTFA();
                          }}>
                          Verify
                        </button>
                      </div>
                    </Fragment>
                  )}
                </div>
              </Modal>
            </div> */}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}
