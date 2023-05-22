import styles from "@/styles/Navbar.module.css";
import Image from "next/image";
import openMenuIcon from "@/public/icons/open-menu.svg";
import ProjectSettingsPopover from "./ProjectSettingsPopover";
import AccountPopover from "./AccountPopover";

export default function Navbar(props) {
  return (
    <div className={styles.navbar}>
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
        <ProjectSettingsPopover />
        <AccountPopover />
      </div>
    </div>
  );
}
