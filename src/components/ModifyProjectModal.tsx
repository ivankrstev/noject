import ChangeCollaboratorsModal from "@/components/ChangeCollaboratorsModal";
import DeleteIcon from "@/public/icons/delete.svg";
import CollaboratorsIcon from "@/public/icons/group_users.svg";
import styles from "@/styles/Modals.module.css";
import { AuthReloginError } from "@/types";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import api from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment/moment";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Project {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  creation_date: string;
  createdOn?: string;
  isPublic?: boolean;
  [key: string]: unknown;
}

interface ProjectData {
  name: string;
  createdOn?: string;
  isPublic?: boolean;
  [key: string]: unknown;
}

interface ModifyProjectModalProps {
  closeModal: () => void;
  modifyProjectId: string;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

export default function ModifyProjectModal({
  closeModal,
  modifyProjectId,
  projects,
  setProjects,
}: ModifyProjectModalProps) {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | undefined>();
  const [newProjectName, setNewProjectName] = useState<string | undefined>();
  const [showCollaboratorsModal, setCollaboratorsModal] = useState<boolean>(false);

  const getProjectData = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        const response = await api.get<{ project: ProjectData }>(`/projects/${projectId}`);
        setProjectData(response.data.project);
      } catch (error) {
        AxiosErrorHandler(error as AuthReloginError, router, "Error getting project");
      }
    },
    [router]
  );

  useEffect(() => {
    const handleCloseOnKey = (e: KeyboardEvent): void => {
      if (e.code === "Escape") closeModal();
    };

    getProjectData(modifyProjectId);
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);

    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, [closeModal, modifyProjectId, router, getProjectData]);

  const handleUpdate = useCallback(async () => {
    try {
      if (!newProjectName || newProjectName === "" || newProjectName === projectData?.name) return;

      await api.put(`/projects/${modifyProjectId}`, { name: newProjectName });

      const updatedProjects = [...projects];
      const indexToUpdate = updatedProjects.findIndex((item) => item.id === modifyProjectId);

      if (indexToUpdate !== -1) {
        updatedProjects[indexToUpdate].name = newProjectName;
      }

      const orderProjectsSavedType = localStorage.getItem("OrderProjects");
      if (orderProjectsSavedType === "name_a-z") {
        updatedProjects.sort((a, b) => a.name.localeCompare(b.name));
      } else if (orderProjectsSavedType === "name_z-a") {
        updatedProjects.sort((b, a) => a.name.localeCompare(b.name));
      }

      setProjects(updatedProjects);
      toast.success("Project name updated");
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  }, [modifyProjectId, newProjectName, projectData, projects, setProjects, router]);

  useEffect(() => {
    const updateTimeout = setTimeout(() => {
      if (newProjectName !== undefined && projectData && newProjectName !== projectData.name) {
        handleUpdate();
        if (projectData) {
          projectData.name = newProjectName;
        }
      }
    }, 1000);

    return () => clearTimeout(updateTimeout);
  }, [newProjectName, projectData, handleUpdate]);

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${modifyProjectId}`);
      toast.success("Project deleted");

      const updatedProjects = [...projects];
      const indexToDelete = updatedProjects.findIndex((item) => item.id === modifyProjectId);

      if (indexToDelete !== -1) {
        updatedProjects.splice(indexToDelete, 1);
        setProjects(updatedProjects);
      }

      closeModal();
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  };

  const handleProjectSharing = async (status: boolean): Promise<void> => {
    try {
      if (status) {
        await api.put(`/projects/${modifyProjectId}/share`);
        setProjectData((prevData) => ({ ...prevData, isPublic: true } as ProjectData));
      } else {
        await api.delete(`/projects/${modifyProjectId}/share`);
        setProjectData((prevData) => ({ ...prevData, isPublic: false } as ProjectData));
      }
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  };

  return (
    <div className={styles.fullscreenModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
        className={styles.modalContent}>
        <h3 className={styles.modalHeading}>Project Details: Id {modifyProjectId}</h3>
        <h5>
          Creation date:{" "}
          {projectData && projectData.createdOn
            ? moment(projectData.createdOn).format("Do MMMM YYYY, HH:mm")
            : ""}
        </h5>
        <label htmlFor='textInput' className={styles.textLabel}>
          Change project name:
        </label>
        <input
          type='text'
          defaultValue={projectData ? projectData.name : ""}
          placeholder='Enter the project name'
          className={styles.textInput}
          onChange={(e) => setNewProjectName(e.target.value)}
          title='The project name is automatically updated'
        />
        <div className={styles.shareProjectWrapper}>
          <div>
            <h4>Project sharing</h4>
            <label className={styles.shareProjectSwitch}>
              <input
                defaultChecked={projectData?.isPublic}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleProjectSharing(e.target.checked)
                }
                type='checkbox'
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          {projectData?.isPublic && (
            <div className={styles.shareLink}>
              <p>
                <span className='no-select'>Link: </span>
                {`/share/${modifyProjectId}`}
              </p>
              <button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  const linkElement = (e.currentTarget.previousSibling as HTMLParagraphElement)
                    .lastChild as Text;
                  if (linkElement && linkElement.textContent) {
                    navigator.clipboard.writeText(window.location.origin + linkElement.textContent);
                  }
                }}>
                Copy
              </button>
            </div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.collaboratorModalBtn}
            onClick={() => setCollaboratorsModal(true)}
            title='Modify project collaborators'>
            Project <br />
            collaborators
            <Image src={CollaboratorsIcon} alt='Group users' width={30} />
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete()}
            title='Delete project'>
            <Image src={DeleteIcon} alt='Delete' width={25} />
          </button>
          <button className={styles.cancelButton} onClick={() => closeModal()} title='Close modal'>
            Close
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCollaboratorsModal && (
          <ChangeCollaboratorsModal
            modifyProjectId={modifyProjectId}
            closeCollaboratorModal={() => setCollaboratorsModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
