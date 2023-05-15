import styles from "@/styles/Navbar.module.css";
import Image from "next/image";
import openMenuIcon from "@/public/icons/open-menu.svg";
import ProjectSettingsPopover from "./ProjectSettingsPopover";
import AccountPopover from "./AccountPopover";

export default function Navbar(props) {
  return (
    <div className={styles.navbar}>
      {!props.showSidebar && (
        <button
          title='Open Sidebar'
          className={styles.sidebarOpenBtn}
          onClick={() => props.sidebarShowHide()}>
          <Image src={openMenuIcon} alt='Open Sidebar Icon' width={25} />
        </button>
      )}
      <h3 className={styles.projectName}>{props.selectProject}</h3>
      <ProjectSettingsPopover />
      <AccountPopover />
    </div>
  );
}
