import styles from "@/styles/Modals.module.css";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import SearchIcon from "@/public/icons/search.svg";

export default function ChangeCollaboratorsModal({ closeCollaboratorModal, modifyProjectId }) {
  const [collaborators, setCollaborators] = useState();
  const [searchData, setSearchData] = useState();
  const [search, setSearch] = useState();

  return (
    <div className={styles.fullscreenModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
        className={styles.modalContent}>
        <h3 className={styles.modalHeading}>Modify Project Collaborators</h3>
        <div className={styles.searchInputWrapper}>
          <Image className={styles.searchIcon} src={SearchIcon} alt='Search' width={20} />
          <input className={styles.textInput} placeholder='Search users' type='search' />
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.cancelButton}
            onClick={() => closeCollaboratorModal()}
            title='Close modal'>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
