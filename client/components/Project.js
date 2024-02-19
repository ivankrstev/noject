import useTaskStore from "@/store/tasksStore";
import styles from "@/styles/Project.module.css";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import api from "@/utils/api";
import tasksProgressHandler from "@/utils/tasks/tasksProgressHandler";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import Task from "./Task";

export default function Project({ selectedProject }) {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const [updateTasks, setUpdateTasks] = useState(false);

  const textChangedListener = (data) => {
    const { t_id, value } = data;
    const indexToUpdate = tasks.findIndex((item) => parseInt(item.t_id) === parseInt(t_id));
    if (indexToUpdate !== undefined && indexToUpdate !== -1) {
      tasks[indexToUpdate].value = value;
      setTasks([...tasks]);
    }
  };

  const tasksReloadRequired = () => {
    setUpdateTasks(true);
    getProjectTasks();
  };

  useEffect(() => {
    if (tasks && tasks.length !== 0) tasksProgressHandler();
  }, [tasks]);

  const getProjectTasks = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (selectedProject) {
        const response = await api.get("/tasks/" + selectedProject.id);
        setTasks(response.data.tasks);
        setUpdateTasks(false);
      }
    } catch (error) {
      AxiosErrorHandler(error, router, "Error fetching tasks");
    }
  };

  useEffect(() => {
    setTasks(null);
    const projectRoomJoinListener = () => {};
    if (selectedProject?.id) {
      document.querySelector("#projectProgressSpan").innerText = "";
      getProjectTasks();
      projectRoomJoinListener();
    }
  }, [selectedProject]);

  return (
    <Fragment>
      <div
        id='projectMainDiv'
        style={{ position: updateTasks ? "relative" : "unset" }}
        className={styles.projectMain}>
        {updateTasks && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "100%",
              backgroundColor: "rgba(255,255,255,0.6)",
              zIndex: 1500,
            }}>
            <HashLoader
              style={{ left: "50%", top: "50%", position: "absolute" }}
              size={120}
              color='#0570eb'
            />
          </div>
        )}
        {selectedProject && (
          <div className={styles.projectHeaderDiv}>
            <h2>{selectedProject.name}</h2>
            <span id='projectProgressSpan' title='Project progress'></span>
          </div>
        )}
        {tasks && (
          <Fragment>
            <div id='projectTasksWrapperDiv' className={styles.projectTasksWrapper}>
              <Fragment>
                {tasks.length !== 0 ? (
                  tasks.map((e) => (
                    <Task
                      key={e.id}
                      taskId={e.id}
                      levelProp={e.level}
                      completed={e.completed}
                      valueProp={e.value}
                      projectId={selectedProject?.id}
                    />
                  ))
                ) : (
                  <div style={{ marginTop: "6em", textAlign: "center" }}>
                    <p>No tasks</p>
                    <button
                      className={styles.newTaskBtn}
                      onClick={async () => {
                        try {
                          const response = await api.post(`/tasks/${selectedProject.id}`);
                          setTasks([response.data]);
                        } catch (error) {
                          AxiosErrorHandler(error, router);
                        }
                      }}>
                      Create new task
                    </button>
                  </div>
                )}
              </Fragment>
            </div>
          </Fragment>
        )}
      </div>
      {!tasks && selectedProject && (
        <div className='center' style={{ transform: "translateY(100%)" }}>
          <HashLoader size={120} color='#0570eb' />
        </div>
      )}
      {!selectedProject && (
        <div style={{ marginTop: "6em", textAlign: "center" }}>
          <p>You have not selected a project.</p>
          {/* <span style={{ fontSize: "0.9em" }}>Select one or create a new one</span> */}
        </div>
      )}
    </Fragment>
  );
}
