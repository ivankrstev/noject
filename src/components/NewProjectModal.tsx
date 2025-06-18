import styles from "@/styles/Modals.module.css";
import api from "@/utils/api";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Project } from "@/types";

interface NewProjectModalProps {
  closeModal: () => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export default function NewProjectModal({
  closeModal,
  projects,
  setProjects,
}: NewProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCloseOnKey = useCallback(
    (e: KeyboardEvent): void => {
      if (e.code === "Escape") closeModal();
    },
    [closeModal]
  );

  useEffect(() => {
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);
    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, [handleCloseOnKey]);

  const handleCreatingProject = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const formElements = event.currentTarget.elements;
      const nameInput = formElements[0] as HTMLInputElement;
      const name = nameInput.value;

      const response = await api.post("/projects", { name });

      if (projects.length === 0) {
        setProjects([response.data]);
        closeModal();
        return;
      }

      const orderProjectsSavedType = localStorage.getItem("OrderProjects");
      if (orderProjectsSavedType === "creation_date_asc") {
        setProjects([...projects, response.data]);
      } else if (orderProjectsSavedType === "creation_date_desc") {
        setProjects([response.data, ...projects]);
      } else {
        const updatedProjects = [...projects, response.data];
        if (orderProjectsSavedType === "name_a-z") {
          updatedProjects.sort((a, b) => a.name.localeCompare(b.name));
        } else if (orderProjectsSavedType === "name_z-a") {
          updatedProjects.sort((b, a) => a.name.localeCompare(b.name));
        }
        setProjects(updatedProjects);
      }

      closeModal();
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data) {
        throw axiosError.response.data;
      }
      throw error;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    try {
      event.preventDefault();
      if (!isSubmitting) {
        setIsSubmitting(true);
        await toast.promise(handleCreatingProject(event), {
          pending: "Creating project",
          success: "Project created",
          error: {
            render({ data }: { data: ErrorResponse }) {
              setIsSubmitting(false);
              return data?.message || data?.error || "Error creating project";
            },
          },
        });
      }
    } catch {}
  };

  return (
    <div className={styles.fullscreenModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
        className={styles.modalContent}>
        <form onSubmit={handleSubmit}>
          <h3 className={styles.modalHeading}>Create a new project</h3>
          <label htmlFor='textInput' className={styles.textLabel}>
            Project Name:
          </label>
          <input
            id='textInput'
            type='text'
            placeholder='Enter the project name'
            className={styles.textInput}
          />
          <div className={styles.buttonGroup}>
            <button className={styles.confirmButton} type='submit'>
              {isSubmitting ? "Creating..." : "Create"}
            </button>
            <button type='button' className={styles.cancelButton} onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
