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

  const getProjects = async (order_by_type) => {
    try {
      const response = await api.get("/project/all?order_by_type=" + order_by_type);
      console.log(response.data);
      setProjects(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const orderProjectsSelect = document.getElementById("orderProjectsSelect");
    if (!localStorage.getItem("OrderProjects")) localStorage.setItem("OrderProjects", "name_a-z");
    const orderProjectsSavedType = localStorage.getItem("OrderProjects");
    orderProjectsSelect.value = orderProjectsSavedType;
    getProjects(orderProjectsSavedType);
  }, []);

  const orderProjects = (type) => {
    if (type === "name_a-z") projects.sort((a, b) => a.name.localeCompare(b.name));
    else if (type === "name_z-a") projects.sort((b, a) => a.name.localeCompare(b.name));
    else if (type === "creation_date_asc")
      projects.sort((a, b) => new Date(a.creation_date) - new Date(b.creation_date));
    else if (type === "creation_date_desc")
      projects.sort((b, a) => new Date(a.creation_date) - new Date(b.creation_date));
    setProjects([...projects]);
  };

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
          <select
            id='orderProjectsSelect'
            title='Order my projects'
            onChange={(e) => {
              localStorage.setItem("OrderProjects", e.target.value);
              orderProjects(e.target.value);
            }}>
            <option value='name_a-z'>Name A-Z</option>
            <option value='name_z-a'>Name Z-A</option>
            <option value='creation_date_asc'>Creation Date &#8593;</option>
            <option value='creation_date_desc'>Creation Date &#8595;</option>
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
          <NewProjectModal
            projects={projects}
            setProjects={setProjects}
            closeModal={() => setShowNewProjectModal(false)}
          />
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
