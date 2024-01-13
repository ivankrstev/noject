import styles from "@/styles/Sidebar.module.css";
import closeMenuIcon from "@/public/icons/close-menu.svg";
import addIcon from "@/public/icons/add_plus.svg";
import SettingsIcon from "@/public/icons/settings.svg";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import NewProjectModal from "@/components/NewProjectModal";
import ModifyProjectModal from "./ModifyProjectModal";
import { AnimatePresence } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { useRouter } from "next/router";
import SharedProjectsSocketClient from "@/utils/signalr-hubs/sharedProjectsHub";

export default function Sidebar({ showSidebar, sidebarShowHide, setSelectedProject }) {
  const router = useRouter();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showModifyProjectModal, setShowModifyProjectModal] = useState(false);
  const [modifyProjectId, setModifyProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [showLoader, setShowLoader] = useState();

  const getProjects = async (order_by_type) => {
    try {
      const response = await api.get("/projects?orderByType=" + order_by_type);
      setShowLoader(true);
      setProjects(response.data.projects);
    } catch (error) {
      AxiosErrorHandler(error, router, "Error fetching projects");
    }
  };

  const getSharedProjects = async () => {
    try {
      const response = await api.get("/projects/shared");
      setSharedProjects(response.data.sharedProjects);
    } catch (error) {
      AxiosErrorHandler(error, router, "Error fetching projects");
    }
  };

  useEffect(() => {
    const localStorageSelectedProject = JSON.parse(localStorage.getItem("selectedProject"));
    if (localStorageSelectedProject) {
      const id = parseInt(localStorageSelectedProject.id);
      let isValidProject = false;
      if (projects.length !== 0) isValidProject = projects.some((project) => project.p_id === id);
      if (sharedProjects.length !== 0 && !isValidProject)
        isValidProject = sharedProjects.some((sharedProject) => sharedProject.p_id === id);
      isValidProject && setSelectedProject(localStorageSelectedProject);
    }
  }, [projects, sharedProjects]);

  useEffect(() => {
    const orderProjectsSelect = document.getElementById("orderProjectsSelect");
    if (!localStorage.getItem("OrderProjects")) localStorage.setItem("OrderProjects", "name_a-z");
    const orderProjectsSavedType = localStorage.getItem("OrderProjects");
    orderProjectsSelect.value = orderProjectsSavedType;
    getProjects(orderProjectsSavedType);
    getSharedProjects();
    SharedProjectsSocketClient.on("NewSharedProject", (data) => {
      if (data.length > 1) setSharedProjects((state) => [data[1].project, ...state]);
    });
    SharedProjectsSocketClient.on("RemovedSharedProject", (data) => {
      if (data.length > 1)
        setSharedProjects((state) => state.filter((p) => p.id !== data[1].idToDelete));
    });
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
    <div className={[styles.sidebar, !showSidebar && styles.sidebarHide].join(" ")}>
      <div className={styles.headerWrapper}>
        <h3>Workspaces</h3>
        <button
          title='Close Sidebar'
          className={styles.sidebarCloseBtn}
          onClick={() => sidebarShowHide(!showSidebar)}>
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
      <button className={styles.newProjectBtn} onClick={() => setShowNewProjectModal(true)}>
        <Image width={20} src={addIcon} alt='New icon' />
        Create Project
      </button>
      <div className={styles.projectItemsWrapper}>
        {!showLoader ? (
          <div className={styles.projectLoaderWrapper}>
            <Skeleton
              count={5}
              rectangle
              width='23px'
              height='29.5px'
              baseColor='#B6B6B4'
              borderRadius='5px'
              style={{ margin: "0.25em 0" }}
            />
            <Skeleton
              count={5}
              rectangle
              width='213px'
              height='29.5px'
              baseColor='#B6B6B4'
              borderRadius='5px'
              style={{ margin: "0.25em 0" }}
            />
          </div>
        ) : projects.length === 0 ? (
          <h5 style={{ margin: "0.5em 0 0.8em 0" }}>No Projects Created</h5>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              id={project.id}
              className={styles.sidebarProjectItem}
              title={project.name}
              onClick={(e) => {
                const id = e.currentTarget.id;
                const name = e.currentTarget.childNodes[1].textContent;
                localStorage.setItem("selectedProject", JSON.stringify({ id, name }));
                setSelectedProject({ id, name });
              }}>
              <span
                style={{ color: project.color, backgroundColor: project.backgroundColor }}
                className={styles.sidebarProjectSquare}>
                {Array.from(project.name)[0].toUpperCase()}
              </span>
              <p>{project.name}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModifyProjectId(e.currentTarget.parentElement.id);
                  setShowModifyProjectModal(true);
                }}
                className={styles.projectModifyBtn}>
                <Image src={SettingsIcon} width={21} alt='Project Settings' />
              </button>
            </div>
          ))
        )}
        <h5>Shared projects</h5>
        {sharedProjects.map((project) => (
          <div
            key={project.id}
            id={project.id}
            className={styles.sidebarProjectItem}
            title={project.name}
            onClick={(e) => {
              const id = e.currentTarget.id;
              const name = e.currentTarget.lastChild.textContent;
              localStorage.setItem("selectedProject", JSON.stringify({ id, name }));
              setSelectedProject({ id, name });
            }}>
            <span
              style={{ color: project.color, backgroundColor: project.backgroundColor }}
              className={styles.sidebarProjectSquare}>
              {Array.from(project.name)[0].toUpperCase()}
            </span>
            <p>{project.name}</p>
          </div>
        ))}
      </div>
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
          <ModifyProjectModal
            modifyProjectId={modifyProjectId}
            projects={projects}
            setProjects={setProjects}
            closeModal={() => setShowModifyProjectModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
