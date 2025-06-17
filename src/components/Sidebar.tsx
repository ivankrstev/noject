import NewProjectModal from "@/components/NewProjectModal";
import addIcon from "@/public/icons/add_plus.svg";
import closeMenuIcon from "@/public/icons/close-menu.svg";
import SettingsIcon from "@/public/icons/settings.svg";
import styles from "@/styles/Sidebar.module.css";
import { AuthReloginError } from "@/types";
import api, { getAccessToken } from "@/utils/api";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import ModifyProjectModal from "./ModifyProjectModal";

interface Project {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  creation_date: string;
}

interface SelectedProject {
  id: string;
  name: string;
}

interface SidebarProps {
  showSidebar: boolean;
  sidebarShowHide: (show: boolean) => void;
  setSelectedProject: (project: SelectedProject) => void;
}

interface SharedProjectSocketData {
  project?: Project;
  idToDelete?: string;
}

export default function Sidebar({
  showSidebar,
  sidebarShowHide,
  setSelectedProject,
}: SidebarProps) {
  const router = useRouter();
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [showModifyProjectModal, setShowModifyProjectModal] = useState<boolean>(false);
  const [modifyProjectId, setModifyProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [showLoader, setShowLoader] = useState<boolean | undefined>(undefined);

  const getProjects = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (order_by_type: string): Promise<void> => {
      try {
        const response = await api.get("/projects");
        setShowLoader(true);
        setProjects(response.data.projects);
      } catch (error) {
        AxiosErrorHandler(error as AuthReloginError, router, "Error fetching projects");
      }
    },
    [router]
  );

  const getSharedProjects = useCallback(async () => {
    try {
      const response = await api.get("/projects/shared");
      setSharedProjects(response.data.sharedProjects);
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router, "Error fetching projects");
    }
  }, [router]);

  useEffect(() => {
    const localStorageSelectedProject = localStorage.getItem("selectedProject");

    if (localStorageSelectedProject) {
      const parsedProject = JSON.parse(localStorageSelectedProject) as SelectedProject;
      const id = parsedProject.id;
      let isValidProject = false;

      if (projects.length !== 0) {
        isValidProject = projects.some((project) => project.id === id);
      }

      if (sharedProjects.length !== 0 && !isValidProject) {
        isValidProject = sharedProjects.some((sharedProject) => sharedProject.id === id);
      }

      if (isValidProject) {
        setSelectedProject(parsedProject);
      }
    }
  }, [projects, sharedProjects, setSelectedProject]);

  const handleSharedProjectsSocket = useCallback(async (): Promise<void> => {
    try {
      const sharedProjectsSocket: HubConnection = new HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_SERVER_URL}/sharedProjectsHub`, {
          accessTokenFactory: async () => {
            const token = await getAccessToken();
            return token || "";
          },
        })
        .configureLogging(process.env.NEXT_PUBLIC_SIGNALR_LOGGING ? LogLevel.Debug : LogLevel.None)
        .withAutomaticReconnect()
        .build();

      await sharedProjectsSocket.start();
      console.log("shared projects socket connected");

      sharedProjectsSocket.on("NewSharedProject", (...data: SharedProjectSocketData[]) => {
        if (data.length > 1 && data[1].project) {
          setSharedProjects((state) => [data[1].project as Project, ...state]);
        }
      });

      sharedProjectsSocket.on("RemovedSharedProject", (...data: SharedProjectSocketData[]) => {
        if (data.length > 1 && data[1].idToDelete) {
          setSharedProjects((state) => state.filter((p) => p.id !== data[1].idToDelete));
        }
      });
    } catch {
      AxiosErrorHandler(null, router, "Real-time project updates are currently unavailable");
    }
  }, [router]);

  useEffect(() => {
    const orderProjectsSelect = document.getElementById("orderProjectsSelect") as HTMLSelectElement;
    if (!localStorage.getItem("OrderProjects")) {
      localStorage.setItem("OrderProjects", "name_a-z");
    }

    const orderProjectsSavedType = localStorage.getItem("OrderProjects") || "name_a-z";
    if (orderProjectsSelect) {
      orderProjectsSelect.value = orderProjectsSavedType;
    }

    getProjects(orderProjectsSavedType);
    getSharedProjects();
    handleSharedProjectsSocket();
  }, [getProjects, getSharedProjects, handleSharedProjectsSocket]);

  const orderProjects = (type: string): void => {
    const sortedProjects = [...projects];

    if (type === "name_a-z") {
      sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === "name_z-a") {
      sortedProjects.sort((b, a) => a.name.localeCompare(b.name));
    } else if (type === "creation_date_asc") {
      sortedProjects.sort(
        (a, b) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime()
      );
    } else if (type === "creation_date_desc") {
      sortedProjects.sort(
        (b, a) => new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime()
      );
    }

    setProjects([...sortedProjects]);
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
              width='23px'
              height='29.5px'
              baseColor='#B6B6B4'
              borderRadius='5px'
              style={{ margin: "0.25em 0" }}
            />
            <Skeleton
              count={5}
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
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                const target = e.currentTarget;
                const id = target.id;
                const nameElement = target.childNodes[1] as HTMLElement;
                const name = nameElement.textContent || "";
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
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  const parentElement = e.currentTarget.parentElement as HTMLElement;
                  setModifyProjectId(parentElement.id);
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
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              const target = e.currentTarget;
              const id = target.id;
              const lastChild = target.lastChild as HTMLElement;
              const name = lastChild.textContent || "";
              localStorage.setItem("selectedProject", JSON.stringify({ id, name }));
              setSelectedProject({ id, name });
            }}>
            <span
              style={{ color: project.color, backgroundColor: project.backgroundColor }}
              className={styles.sidebarProjectSquare}>
              {project.name.charAt(0).toUpperCase()}
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
