import styles from "@/styles/Sidebar.module.css";
import closeMenuIcon from "@/public/icons/close-menu.svg";
import addIcon from "@/public/icons/add_plus.svg";
import SettingsIcon from "@/public/icons/settings.svg";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import NewProjectModal from "@/components/NewProjectModal";
import ModifyProjectModal from "./ModifyProjectModal";
import { AnimatePresence } from "framer-motion";

export default function Sidebar(props) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showModifyProjectModal, setShowModifyProjectModal] = useState(false);
  const [modifyProjectId, setModifyProjectId] = useState(null);
  const [projects, setProjects] = useState([]);

  const getProjects = async (orderByType) => {
    try {
      const response = await api.get("/project/all");
      console.log(response.data);
      setProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

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
        <div className={styles.orderMyProj}>
          <h6>Order by:</h6>
          <select title='Order my projects' onChange={(e) => console.log(e.target.value)}>
            <option value='name'>Name</option>
            <option value='creation_date'>Creation Date</option>
            <option value='modified-date'>Modification Date</option>
          </select>
        </div>
      </div>

      {projects.length === 0 ? (
        <h4>No Projects Created</h4>
      ) : (
        projects.map((project) => (
          <div
            key={project.p_id}
            id={project.p_id}
            className={styles.sidebarProjectItem}
            title={project.name}
            onClick={() => console.log("Project clicked")}>
            <span
              style={{ color: project.color, backgroundColor: project.background_color }}
              className={styles.sidebarProjectSquare}>
              {Array.from(project.name)[0].toUpperCase()}
            </span>
            <p>{project.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setModifyProjectId(e.currentTarget.parentElement.id);
                setShowModifyProjectModal(true);
                console.log("btn clicked");
              }}
              className={styles.projectModifyBtn}>
              <Image src={SettingsIcon} width={21} alt='Project Settings' />
            </button>
          </div>
        ))
      )}

      <button className={styles.newProjectBtn} onClick={() => setShowNewProjectModal(true)}>
        <Image width={20} src={addIcon} alt='New icon' />
        Create Project
      </button>
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
