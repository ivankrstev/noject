import styles from "@/styles/Modals.module.css";
import api from "@/utils/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function NewProjectModal({ closeModal, projects, setProjects }) {
  const [name, setName] = useState("");

  const handleCloseOnKey = (e) => e.code === "Escape" && closeModal();
  useEffect(() => {
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);
    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, []);

  const postProject = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const response = await api.post("/projects", { name });
      if (projects.length === 0) {
        setProjects([{ ...response.data }]);
        closeModal();
        return;
      }
      const orderProjectsSavedType = localStorage.getItem("OrderProjects");
      if (orderProjectsSavedType === "creation_date_asc") setProjects([...projects, response.data]);
      else if (orderProjectsSavedType === "creation_date_desc")
        setProjects([response.data, ...projects]);
      else {
        if (orderProjectsSavedType === "name_a-z")
          projects.sort((a, b) => a.name.localeCompare(b.name));
        else if (orderProjectsSavedType === "name_z-a")
          projects.sort((b, a) => a.name.localeCompare(b.name));
        setProjects(projects);
      }
      closeModal();
    } catch (error) {
      if (error?.response?.data) throw error.response.data;
      throw error;
    }
  };

  const handleCreatingProject = async () => {
    try {
      await toast.promise(postProject(), {
        pending: "Creating project",
        success: "Project created",
        error: {
          render({ data }) {
            return data?.message || data?.error || "Error creating project";
          },
        },
      });
    } catch (error) {
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
        <h3 className={styles.modalHeading}>Create a new project</h3>
        <label htmlFor='textInput' className={styles.textLabel}>
          Project Name:
        </label>
        <input
          id='textInput'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Enter the project name'
          className={styles.textInput}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.confirmButton} onClick={() => handleCreatingProject()}>
            Create
          </button>
          <button className={styles.cancelButton} onClick={() => closeModal()}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
