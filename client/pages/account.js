import styles from "@/styles/Account.module.css";
import Pic from "@/public/icons/account_circle.svg";
import { Fragment, useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "react-modal";
import Image from "next/image";
import CloseIcon from "@/public/icons/close.svg";
import api from "@/utils/api";
import { toast } from "react-toastify";
import GridLoader from "react-spinners/BeatLoader";
import { motion } from "framer-motion";

export default function account() {
  const [tfaPage, setTfaPage] = useState(2);
  const [openModal, setOpenModal] = useState(false);
  const [tfaActivated, setTfaActivated] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState();
  const [data, setData] = useState();
  const [qrSecret, setQrSecret] = useState("");
  const [image, setImage] = useState("");

  const enableDisableTFA = async () => {
    try {
      const userToken = document.querySelector("#userTokenTFA").value;
      const response = await api.put(tfaActivated ? "/tfa/disable/" : "tfa/enable/", { userToken });
      if (response.data.message === "Two Factor Authenitication is disabled")
        setTfaActivated(false);
      else setTfaActivated(true);
      setOpenModal(false);
      toast.success(response.data.message);
    } catch (error) {
      if (error.response) toast.error(error.response.data.error);
      else toast.error("Oops! Something went wrong");
      console.error(error);
    }
  };

  const convertImageToBase64 = (response) => {
    if (response.data.size === 0) setImage(null);
    else {
      const blob = new Blob([response.data], { type: "image/jpg" });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        let base64 = reader.result;
        setImage(base64);
      };
    }
  };

  const getDetails = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const response = await api.get("/account/all");
      setData(response.data);
      const responsePic = await api.get("/account/picture/get", { responseType: "blob" });
      convertImageToBase64(responsePic);
    } catch (error) {
      console.error(error);
      toast.error("Oops! Something went wrong");
    }
  };

  const changePassword = async (formData) => {
    try {
      const data = {
        currentPassword: formData[0].value,
        newPassword: formData[1].value,
        confirmNewPassword: formData[2].value,
      };
      await new Promise((resolve) => setTimeout(resolve, 400));
      const response = await api.put("/account/password/change", data);
      toast.success(response.data.message);
      document.querySelector("#change-password-form").reset();
    } catch (error) {
      console.error(error);
      if (error.response) toast.error(error.response.data.error);
      else toast.error("Oops! Something went wrong");
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  useEffect(() => {
    if (data) {
      setVerifiedEmail(data.verified_email);
      if (data.tfa_activated) setTfaActivated(true);
      else setTfaActivated(false);
    }
  }, [data]);

  useEffect(() => (tfaActivated ? setTfaPage(2) : setTfaPage(1)), [tfaActivated]);

  useEffect(() => {
    if (tfaPage === 1 && openModal) {
      const generateTfaSecret = async () => {
        try {
          const response = await api.post("/tfa/generate");
          setQrSecret(response.data.secret);
        } catch (error) {
          toast.error(error.response?.data.error);
          console.error(error);
        }
      };
      generateTfaSecret();
    }
  }, [tfaPage, openModal]);

  return (
    <Fragment>
      <Head>
        <title>My account - Noject</title>
      </Head>
      <Navbar showSidebar={true} showBtnDashboard={true} />
      <motion.main
        initial={{ opacity: 0, x: -200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: -100 }}
        transition={{ type: "linear" }}>
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
                <img
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
                    onChange={async (e) => {
                      try {
                        const formData = new FormData(e.target.parentNode);
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.target.previousSibling.click();
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
                    onClick={(e) => {
                      e.preventDefault();
                    }}>
                    Send confirmation link
                  </button>
                )}
                <label htmlFor='changeEmail'>Change email address:</label>
                <input id='changeEmail' type='email' placeholder='Enter your new email address' />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                  }}>
                  Send email link
                </button>
              </form>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  changePassword(e.target.elements);
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
              <div className={styles.twoFactorAuth}>
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
              </div>
            </Fragment>
          )}
        </div>
      </motion.main>
    </Fragment>
  );
}
