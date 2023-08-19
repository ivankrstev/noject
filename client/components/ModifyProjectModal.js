import styles from "@/styles/Modals.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import api from "@/utils/api";
import { toast } from "react-toastify";
import moment from "moment/moment";
import ChangeCollaboratorsModal from "./ChangeCollaboratorsModal";
import CollaboratorsIcon from "@/public/icons/group_users.svg";
import DeleteIcon from "@/public/icons/delete.svg";
import { useRouter } from "next/router";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";

export default function ModifyProjectModal({ closeModal, modifyProjectId, projects, setProjects }) {
  const router = useRouter();
  const [projectData, setProjectData] = useState();
  const [newProjectName, setNewProjectName] = useState();
  const [showCollaboratorsModal, setCollaboratorsModal] = useState(false);
  const [shareLinkProject, setShareLinkProject] = useState();

  const getProjectData = async (projectId) => {
    try {
      const response = await api.get("/project/" + projectId);
      setProjectData(response.data);
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
      const response = await api.put("/project/" + modifyProjectId, { name: newProjectName });
      const indexToUpdate = projects.findIndex((item) => item.p_id === parseInt(modifyProjectId));
      if (indexToUpdate !== -1) projects[indexToUpdate].name = response.data.name;
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
      await api.delete("/project/" + modifyProjectId);
      toast.success("Project deleted");
      const indexToDelete = projects.findIndex((item) => item.p_id === parseInt(modifyProjectId));
      projects.splice(indexToDelete, 1);
      setProjects([...projects]);
      closeModal();
    } catch (error) {
      AxiosErrorHandler(error, router);
    }
  };

  useEffect(() => {
    if (projectData?.public_link) setShareLinkProject(projectData.public_link);
  }, [projectData]);

  const handleProjectSharing = async (status) => {
    try {
      if (status) {
        const response = await api.post("/project/share/" + modifyProjectId);
        setShareLinkProject(response.data.public_link);
      } else {
        await api.delete("/project/share/" + modifyProjectId);
        setShareLinkProject(null);
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
          {projectData ? moment(projectData.creation_date).format("Do MMMM YYYY, HH:mm") : ""}
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
                defaultChecked={projectData?.public_link}
                onInput={(e) => handleProjectSharing(e.target.checked)}
                type='checkbox'
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
          {shareLinkProject && (
            <div className={styles.shareLink}>
              <p>
                <span className='no-select'>Link: </span>
                {"/share/" + shareLinkProject}
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
