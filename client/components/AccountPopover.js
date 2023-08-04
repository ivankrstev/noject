import Image from "next/image";
import styles from "@/styles/Navbar.module.css";
import ExpandMoreIcon from "@/public/icons/expand_circle_down.svg";
import BlankProfilePic from "@/public/icons/account_circle.svg";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/api";

const closeProfilePopover = (event) => {
  if (
    event.target !== document.querySelector("#profilePopover") &&
    event.target !== document.querySelector("#profilePopoverBtn") &&
    !document.querySelector("#profilePopoverBtn").contains(event.target)
  ) {
    document.querySelector("#profilePopover").style.display = "none";
    document.removeEventListener("click", closeProfilePopover);
  }
};

export default function AccountPopover() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadProfilePicture();
  }, []);

  const loadProfilePicture = async () => {
    try {
      const response = await api.get("/account/picture/get", { responseType: "blob" });
      if (response.data.size !== 0) {
        const blob = new Blob([response.data], { type: "image/jpg" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setImage(reader.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          const profilePopover = document.querySelector("#profilePopover");
          if (profilePopover.style.display === "flex") {
            profilePopover.style.display = "none";
            document.removeEventListener("click", closeProfilePopover);
          } else {
            profilePopover.style.display = "flex";
            document.addEventListener("click", closeProfilePopover);
          }
        }}
        id='profilePopoverBtn'
        className={styles.profileBtn}>
        <Image
          src={image ? image : BlankProfilePic}
          width={20}
          height={20}
          className={styles.profileImg}
          alt='Profile Picture'
          style={{
            filter: image
              ? ""
              : "invert(98%) sepia(0%) saturate(0%) hue-rotate(264deg) brightness(114%) contrast(100%)",
          }}
        />
        <Image className={styles.expandProfile} alt='Show more' src={ExpandMoreIcon} width={16} />
      </button>
      <div id='profilePopover' className={styles.profilePopover}>
        <Link href='/account'>My account</Link>
        <button>Sign out</button>
      </div>
    </div>
  );
}
