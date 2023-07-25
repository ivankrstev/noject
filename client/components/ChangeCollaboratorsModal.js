import styles from "@/styles/Modals.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SearchIcon from "@/public/icons/search.svg";
import AddCollaboratorIcon from "@/public/icons/person_add_FILL1.svg";
import RemoveCollaboratorIcon from "@/public/icons/person_remove_fill1.svg";
import api from "@/utils/api";

export default function ChangeCollaboratorsModal({ closeCollaboratorModal, modifyProjectId }) {
  const [collaborators, setCollaborators] = useState();
  const [searchData, setSearchData] = useState([]);
  const [search, setSearch] = useState(null);

  useEffect(() => {
    let searchTimeout;
    if (!search || search === "") setSearchData([]);
    else if (search)
      searchTimeout = setTimeout(async () => {
        try {
          const response = await api.get("/project-collaborators/search?q=" + search);
          setSearchData(response.data);
        } catch (error) {
          console.error(error);
        }
      }, 1000);
    return () => searchTimeout && clearTimeout(searchTimeout);
  }, [search]);

  return (
    <div className={styles.fullscreenModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
        style={{ width: "500px" }}
        className={styles.modalContent}>
        <h3 className={styles.modalHeading}>Modify Project Collaborators</h3>
        <div className={styles.searchInputWrapper}>
          <Image className={styles.searchIcon} src={SearchIcon} alt='Search' width={20} />
          <input
            className={styles.textInput}
            placeholder='Search users'
            type='search'
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.searchList}>
            {searchData.map((e) => (
              <div key={e.u_id} className={styles.searchListItem} title='Searched user'>
                <button title='Add collaborator'>
                  <Image src={AddCollaboratorIcon} alt='Add user' width={22} />
                </button>
                <p>{e.u_id}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h5>Current collaborators:</h5>
          <div className={styles.collaboratorsList}>
            <div className={styles.collaboratorsItem}>
              <p>ivankrstev246hehehehehehehehe@gmail.com</p>
              <button title='Remove collaborator'>
                <Image src={RemoveCollaboratorIcon} alt='Remove User' width={22} />
              </button>
            </div>
          </div>
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
