import styles from "@/styles/Modals.module.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { toast } from "react-toastify";
import moment from "moment/moment";

export default function ModifyProjectModal({ closeModal, modifyProjectId, projects, setProjects }) {
  const [projectData, setProjectData] = useState();
  const [newProjectName, setNewProjectName] = useState();

  const getProjectData = async (projectId) => {
    try {
      const response = await api.get("/project/" + projectId);
      setProjectData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Error getting project");
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
      if (newProjectName || newProjectName !== projectData?.name) {
        handleUpdate();
        projectData.name = newProjectName;
      }
    }, 1000);
    return () => clearTimeout(updateTimeout);
  }, [newProjectName]);

  const handleUpdate = async () => {
    try {
      if (newProjectName === projectData?.name) return;
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
      console.error(error);
      toast.error(error?.response?.data.error || error.message);
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
      console.error(error);
      toast.error(error?.response?.data.error || error.message);
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
          {projectData ? moment(projectData.creation_date).format("Do MMMM YYYY, HH:mm:ss") : ""}
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
        <div className={styles.buttonGroup}>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete()}
            title='Delete project'>
            Delete
          </button>
          <button className={styles.cancelButton} onClick={() => closeModal()} title='Close modal'>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
