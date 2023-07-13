import styles from "@/styles/Sidebar.module.css";
import closeMenuIcon from "@/public/icons/close-menu.svg";
import addIcon from "@/public/icons/add_plus.svg";
import Image from "next/image";
import { useState } from "react";

export default function Sidebar(props) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  return (
    <div className={[styles.sidebar, !props.showSidebar && styles.sidebarHide].join(" ")}>
      <div className={styles.headerWrapper}>
        <h3>Workspaces</h3>
        <button
          title='Close Sidebar'
          className={styles.sidebarCloseBtn}
          onClick={() => props.sidebarShowHide(!props.showSidebar)}>
          <Image width={25} src={closeMenuIcon} alt='Close Sidebar Icon' />
        </button>
      </div>
      <div className={styles.myProjHeader}>
        <h5>My projects</h5>
        <button className={styles.newProjectBtn} onClick={() => setShowNewProjectModal(true)}>
          <Image width={20} src={addIcon} alt='New icon' />
          Create Project
        </button>
      </div>
      <div id='p1' className={styles.sidebarProjectItem} title='Weather Report for the cast'>
        <div className={styles.sidebarProjectSquare}>W</div>
        <p>Weather Report for the cast</p>
      </div>
      <div id='p2' className={styles.sidebarProjectItem} title='Task Manager'>
        <div className={styles.sidebarProjectSquare}>T</div>
        <p>Task Manager</p>
      </div>
      <h5>Shared projects</h5>
    </div>
  );
}
