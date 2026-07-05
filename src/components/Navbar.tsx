import openMenuIcon from "@/public/icons/open-menu.svg";
import styles from "@/styles/Navbar.module.css";
import Image from "next/image";
import Link from "next/link";
import AccountPopover from "./AccountPopover";

interface NavbarProps {
  showSidebar?: boolean;
  sidebarShowHide?: () => void;
  showBtnDashboard?: boolean;
}

export default function Navbar({ showSidebar, sidebarShowHide, showBtnDashboard }: NavbarProps) {
  return (
    <div id='navbar' className={styles.navbar}>
      <div>
        {!showSidebar && (
          <button
            title='Open Sidebar'
            className={styles.sidebarOpenBtn}
            onClick={() => sidebarShowHide && sidebarShowHide()}>
            <Image src={openMenuIcon} alt='Open Sidebar Icon' width={25} />
          </button>
        )}
        <h3 className={styles.projectName}>Noject</h3>
      </div>
      <div>
        {showBtnDashboard && (
          <Link style={{ marginRight: "0.5em" }} href='/dashboard'>
            Go to dashboard
          </Link>
        )}
        <AccountPopover />
      </div>
    </div>
  );
}
