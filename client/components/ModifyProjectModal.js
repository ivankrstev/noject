import styles from "@/styles/Modals.module.css";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function ModifyProjectModal({ closeModal }) {
  const handleCloseOnKey = (e) => e.code === "Escape" && closeModal();
  useEffect(() => {
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);
    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, []);

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
          id='textInput'
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Enter the project name'
          className={styles.textInput}
        />
        <div className={styles.buttonGroup}>
          <button className={styles.confirmButton}>Update</button>
          <button className={styles.deleteButton}>Delete</button>
          <button className={styles.cancelButton} onClick={() => closeModal()}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
