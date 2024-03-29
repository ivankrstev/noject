import styles from "@/styles/Modals.module.css";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import { motion } from "framer-motion";
import SearchIcon from "@/public/icons/search.svg";
import CloseIcon from "@/public/icons/close.svg";
import AddCollaboratorIcon from "@/public/icons/person_add_FILL1.svg";
import RemoveCollaboratorIcon from "@/public/icons/person_remove_fill1.svg";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";

export default function ChangeCollaboratorsModal({ closeCollaboratorModal, modifyProjectId }) {
  const router = useRouter();
  const [collaborators, setCollaborators] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [search, setSearch] = useState(null);

  const addCollaborator = async (u_id) => {
    try {
      const response = await api.post("/project-collaborators/add", {
        userToAdd: u_id,
        p_id: modifyProjectId,
      });
      setCollaborators([...collaborators, response.data]);
      toast.success("Collaborator added");
    } catch (error) {
      AxiosErrorHandler(error, router);
    }
  };

  const removeCollaborator = async (u_id) => {
    try {
      const response = await api.delete(
        "/project-collaborators/" + modifyProjectId + "?u_id=" + u_id
      );
      toast.success("Collaborator removed");
      const indexToDelete = collaborators.findIndex((item) => item.u_id === response.data.u_id);
      collaborators.splice(indexToDelete, 1);
      setCollaborators([...collaborators]);
    } catch (error) {
      AxiosErrorHandler(error, router);
    }
  };

  const getCollaborators = async () => {
    try {
      const response = await api.get("/project-collaborators/" + modifyProjectId);
      if (response.data.length !== 0) setCollaborators(response.data);
    } catch (error) {
      AxiosErrorHandler(error, router);
    }
  };

  useEffect(() => {
    getCollaborators();
  }, []);

  useEffect(() => {
    let searchTimeout;
    if (!search || search === "") setSearchData([]);
    else if (search)
      searchTimeout = setTimeout(async () => {
        try {
          const response = await api.get(
            "/project-collaborators/search/" + modifyProjectId + "?q=" + search
          );
          setSearchData(response.data);
        } catch (error) {
          AxiosErrorHandler(error, router);
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
            id='search-input-collaborators'
            className={styles.textInput}
            placeholder='Search users'
            type='search'
            onChange={(e) => setSearch(e.target.value)}
          />
          {searchData.length !== 0 && (
            <button
              className={styles.cancelSearchBtn}
              onClick={() => {
                setSearchData([]);
                document.querySelector("#search-input-collaborators").value = "";
              }}>
              <Image src={CloseIcon} alt='Search' width={20} />
            </button>
          )}
          <div className={styles.searchList}>
            {searchData.map((e) => (
              <div key={e.u_id} className={styles.searchListItem} title='Searched user'>
                <button
                  id={e.u_id}
                  onClick={(e) => addCollaborator(e.currentTarget.id)}
                  title='Add collaborator'>
                  <Image src={AddCollaboratorIcon} alt='Add user' width={22} />
                </button>
                <p>{e.u_id}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.collaboratorsList}>
          {collaborators.length === 0 ? (
            <h5>No collaborators.</h5>
          ) : (
            <Fragment>
              <h5>Current collaborators:</h5>
              {collaborators.map((e) => (
                <div key={e.u_id} className={styles.collaboratorsItem}>
                  <p>{e.u_id}</p>
                  <button
                    id={e.u_id}
                    onClick={(e) => removeCollaborator(e.currentTarget.id)}
                    title='Remove collaborator'>
                    <Image src={RemoveCollaboratorIcon} alt='Remove User' width={22} />
                  </button>
                </div>
              ))}
            </Fragment>
          )}
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
