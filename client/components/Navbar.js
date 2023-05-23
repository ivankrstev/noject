import styles from "@/styles/Navbar.module.css";
import Image from "next/image";
import openMenuIcon from "@/public/icons/open-menu.svg";
import ProjectSettingsPopover from "./ProjectSettingsPopover";
import AccountPopover from "./AccountPopover";
import Link from "next/link";

export default function Navbar(props) {
  return (
    <div id='navbar' className={styles.navbar}>
      <div>
        {!props.showSidebar && (
          <button
            title='Open Sidebar'
            className={styles.sidebarOpenBtn}
            onClick={() => props.sidebarShowHide()}>
            <Image src={openMenuIcon} alt='Open Sidebar Icon' width={25} />
          </button>
        )}
        <h3 className={styles.projectName}>Noject</h3>
      </div>
      <div>
        {props.showBtnDashboard && (
          <Link style={{ marginRight: "0.5em" }} href='/dashboard'>
            Go to dashboard
          </Link>
        )}
        <ProjectSettingsPopover />
        <AccountPopover />
      </div>
    </div>
  );
}
