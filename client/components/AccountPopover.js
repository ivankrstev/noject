import Image from "next/image";
import styles from "@/styles/Navbar.module.css";
import ExpandMoreIcon from "@/public/icons/expand_circle_down.svg";
import Pic from "@/public/icons/photo.jpg";
import Link from "next/link";

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
        <img src={Pic.src} className={styles.profileImg} alt='Profile Picture' />
        <Image className={styles.expandProfile} alt='Show more' src={ExpandMoreIcon} width={15} />
      </button>
      <div id='profilePopover' className={styles.profilePopover}>
        <Link href='/account'>My account</Link>
        <button>Sign out</button>
      </div>
    </div>
  );
}
