import DeleteIcon from "@/public/icons/delete.svg";
import CollaboratorsIcon from "@/public/icons/group_users.svg";
import styles from "@/styles/Modals.module.css";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import api from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import moment from "moment/moment";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ChangeCollaboratorsModal from "./ChangeCollaboratorsModal";

export default function ModifyProjectModal({ closeModal, modifyProjectId, projects, setProjects }) {
  const router = useRouter();
  const [projectData, setProjectData] = useState();
  const [newProjectName, setNewProjectName] = useState();
  const [showCollaboratorsModal, setCollaboratorsModal] = useState(false);

  const getProjectData = async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      setProjectData(response.data.project);
    } catch (error) {
      AxiosErrorHandler(error, router, "Error getting project");
    }
  };

  useEffect(() => {
    const handleCloseOnKey = (e) => e.code === "Escape" && closeModal();
    getProjectData(modifyProjectId);
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);
    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, []);

  useEffect(() => {
    const updateTimeout = setTimeout(() => {
      if (newProjectName !== projectData?.name) {
        handleUpdate();
        projectData.name = newProjectName;
      }
    }, 1000);
    return () => clearTimeout(updateTimeout);
  }, [newProjectName]);

  const handleUpdate = async () => {
    try {
      if (!newProjectName || newProjectName === "" || newProjectName === projectData?.name) return;
      await api.put(`/projects/${modifyProjectId}`, { name: newProjectName });
      const indexToUpdate = projects.findIndex((item) => item.id === modifyProjectId);
      if (indexToUpdate !== -1) projects[indexToUpdate].name = newProjectName;
      const orderProjectsSavedType = localStorage.getItem("OrderProjects");
      if (orderProjectsSavedType === "name_a-z")
        projects.sort((a, b) => a.name.localeCompare(b.name));
      else if (orderProjectsSavedType === "name_z-a")
        projects.sort((b, a) => a.name.localeCompare(b.name));
      setProjects([...projects]);
      toast.success("Project name updated");
    } catch (error) {
      AxiosErrorHandler(error, router);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${modifyProjectId}`);
      toast.success("Project deleted");
      const indexToDelete = projects.findIndex((item) => item.id === modifyProjectId);
      if (indexToDelete !== -1) {
        projects.splice(indexToDelete, 1);
        setProjects([...projects]);
      }
      closeModal();
    } catch (error) {
      AxiosErrorHandler(error, router);
    }
  };

  const handleProjectSharing = async (status) => {
    try {
      if (status) {
        await api.put(`/projects/${modifyProjectId}/share`);
        setProjectData({ ...projectData, isPublic: true });
      } else {
        await api.delete(`/projects/${modifyProjectId}/share`);
        setProjectData({ ...projectData, isPublic: false });
      }
    } catch (error) {
      AxiosErrorHandler(error, router);
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
                onInput={(e) => handleProjectSharing(e.target.checked)}
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
                onClick={(e) => {
                  navigator.clipboard.writeText(
                    window.location.origin + e.currentTarget.previousSibling.lastChild.textContent
                  );
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
