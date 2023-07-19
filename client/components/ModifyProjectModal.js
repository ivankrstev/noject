import styles from "@/styles/Modals.module.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { toast } from "react-toastify";

export default function ModifyProjectModal({ closeModal, modifyProjectId, projects, setProjects }) {
  const [projectData, setProjectData] = useState();
  const handleCloseOnKey = (e) => e.code === "Escape" && closeModal();

  const getProjectData = async (projectId) => {
    try {
      const response = await api.get("/project/" + projectId);
      setProjectData(response.data);
    } catch (error) {
      toast.error("Error getting project");
      console.error(error);
    }
  };

  useEffect(() => {
    getProjectData(modifyProjectId);
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);
    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, []);

  const handleUpdate = async () => {
    try {
      const newProjectName = document.getElementById("changeProjectNameInput").value;
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
      toast.success("Project updated");
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data || error.message);
      console.error(error);
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
        <h3 className={styles.modalHeading}>Change the project name</h3>
        <label htmlFor='textInput' className={styles.textLabel}>
          Current project name:
        </label>
        <input
          id='changeProjectNameInput'
          type='text'
          defaultValue={projectData ? projectData.name : ""}
          placeholder='Enter the project name'
          className={styles.textInput}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.confirmButton} onClick={() => handleUpdate()}>
            Update
          </button>
          <button className={styles.deleteButton}>Delete</button>
          <button className={styles.cancelButton} onClick={() => closeModal()}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
