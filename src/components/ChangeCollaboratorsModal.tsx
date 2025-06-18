import CloseIcon from "@/public/icons/close.svg";
import AddCollaboratorIcon from "@/public/icons/person_add_FILL1.svg";
import RemoveCollaboratorIcon from "@/public/icons/person_remove_fill1.svg";
import SearchIcon from "@/public/icons/search.svg";
import styles from "@/styles/Modals.module.css";
import { AuthReloginError } from "@/types";
import api from "@/utils/api";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Collaborator {
  u_id: string;
  [key: string]: unknown;
}

interface ChangeCollaboratorsModalProps {
  closeCollaboratorModal: () => void;
  modifyProjectId: string;
}

export default function ChangeCollaboratorsModal({
  closeCollaboratorModal,
  modifyProjectId,
}: ChangeCollaboratorsModalProps) {
  const router = useRouter();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchData, setSearchData] = useState<Collaborator[]>([]);
  const [search, setSearch] = useState<string | null>(null);

  const addCollaborator = async (u_id: string): Promise<void> => {
    try {
      const response = await api.post<Collaborator>("/project-collaborators/add", {
        userToAdd: u_id,
        p_id: modifyProjectId,
      });
      setCollaborators([...collaborators, response.data]);
      toast.success("Collaborator added");
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  };

  const removeCollaborator = async (u_id: string): Promise<void> => {
    try {
      const response = await api.delete<{ u_id: string }>(
        "/project-collaborators/" + modifyProjectId + "?u_id=" + u_id
      );
      toast.success("Collaborator removed");
      const indexToDelete = collaborators.findIndex((item) => item.u_id === response.data.u_id);
      collaborators.splice(indexToDelete, 1);
      setCollaborators([...collaborators]);
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  };

  const getCollaborators = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<Collaborator[]>("/project-collaborators/" + modifyProjectId);
      if (response.data.length !== 0) setCollaborators(response.data);
    } catch (error) {
      AxiosErrorHandler(error as AuthReloginError, router);
    }
  }, [modifyProjectId, router]);

  useEffect(() => {
    getCollaborators();
  }, [getCollaborators]);

  useEffect(() => {
    let searchTimeout: NodeJS.Timeout | undefined;
    if (!search || search === "") setSearchData([]);
    else if (search)
      searchTimeout = setTimeout(async () => {
        try {
          const response = await api.get<Collaborator[]>(
            "/project-collaborators/search/" + modifyProjectId + "?q=" + search
          );
          setSearchData(response.data);
        } catch (error) {
          AxiosErrorHandler(error as AuthReloginError, router);
        }
      }, 1000);
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [search, modifyProjectId, router]);

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
                const searchInput = document.querySelector(
                  "#search-input-collaborators"
                ) as HTMLInputElement;
                if (searchInput) searchInput.value = "";
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
