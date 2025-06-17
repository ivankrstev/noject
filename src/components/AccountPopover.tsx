import BlankProfilePic from "@/public/icons/account_circle.svg";
import ExpandMoreIcon from "@/public/icons/expand_circle_down.svg";
import styles from "@/styles/Navbar.module.css";
import api from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const closeProfilePopover = (event: MouseEvent): void => {
  const profilePopover = document.querySelector("#profilePopover") as HTMLDivElement;
  const profilePopoverBtn = document.querySelector("#profilePopoverBtn") as HTMLButtonElement;

  if (
    event.target !== profilePopover &&
    event.target !== profilePopoverBtn &&
    !profilePopoverBtn.contains(event.target as Node)
  ) {
    profilePopover.style.display = "none";
    document.removeEventListener("click", closeProfilePopover);
  }
};

export default function AccountPopover() {
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfilePicture();
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      await api.delete("/signout", { withCredentials: true });
      toast.success("Successfully logged out");
      router.push("/login/");
    } catch {
      toast.error("Oops! Something went wrong");
    }
  };

  const loadProfilePicture = async (): Promise<void> => {
    try {
      const response = await api.get("/account/picture/get", { responseType: "blob" });
      if (response.data.size !== 0) {
        const blob = new Blob([response.data], { type: "image/jpg" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setImage(reader.result as string);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          const profilePopover = document.querySelector("#profilePopover") as HTMLDivElement;
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
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    </div>
  );
}
