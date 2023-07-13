import styles from "@/styles/Sidebar.module.css";
import closeMenuIcon from "@/public/icons/close-menu.svg";
import addIcon from "@/public/icons/add_plus.svg";
import SettingsIcon from "@/public/icons/settings.svg";
import Image from "next/image";
import { useState } from "react";
import NewProjectModal from "@/components/NewProjectModal";
import ModifyProjectModal from "./ModifyProjectModal";
import { AnimatePresence } from "framer-motion";

export default function Sidebar(props) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showModifyProjectModal, setShowModifyProjectModal] = useState(false);

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

      <div
        id='p1'
        className={styles.sidebarProjectItem}
        onClick={() => console.log("Project clicked")}
        title='Weather Report for the cast'>
        <span className={styles.sidebarProjectSquare}>W</span>
        <p>Weather Report for the cast</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowModifyProjectModal(true);
            console.log("btn clicked");
          }}
          className={styles.projectModifyBtn}>
          <Image src={SettingsIcon} width={21} alt='Project Settings' />
        </button>
      </div>

      <div
        id='p2'
        className={styles.sidebarProjectItem}
        onClick={() => console.log("Project clicked")}
        title='Task Manager'>
        <span className={styles.sidebarProjectSquare}>T</span>
        <p>Task Manager</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("btn clicked");
          }}
          className={styles.projectModifyBtn}>
          <Image src={SettingsIcon} width={21} alt='Project Settings' />
        </button>
      </div>
      <h5>Shared projects</h5>
      <AnimatePresence>
        {showNewProjectModal && (
          <NewProjectModal closeModal={() => setShowNewProjectModal(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showModifyProjectModal && (
          <ModifyProjectModal closeModal={() => setShowModifyProjectModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
