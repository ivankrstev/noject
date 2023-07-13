import styles from "@/styles/Modals.module.css";
import { useEffect, useState } from "react";

export default function NewProjectModal({ closeModal }) {
  const [name, setName] = useState("");

  useEffect(() => {
    document.documentElement.style.overflowY = "hidden";
    return () => (document.documentElement.style.overflowY = "auto");
  }, []);

  const handleChange = (event) => setName(event.target.value);

  return (
    <div className={styles.fullscreenModal}>
      <div className={styles.modalContent}>
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
          <button className={styles.confirmButton}>Create</button>
          <button className={styles.cancelButton} onClick={() => closeModal()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
