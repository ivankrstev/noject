import styles from "@/styles/Project.module.css";
import Task from "./Task";
import { Fragment, useEffect, useState } from "react";
import tasksProgressHandler from "@/utils/tasks/tasksProgressHandler";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import SocketClient from "@/utils/socket";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { useRouter } from "next/router";

export default function Project({ selectedProject }) {
  const router = useRouter();
  const [tasks, setTasks] = useState();
  const [updateTasks, setUpdateTasks] = useState(false);

  const textChangedListener = (data) => {
    const { t_id, value } = data;
    const indexToUpdate = tasks.findIndex((item) => parseInt(item.t_id) === parseInt(t_id));
    if (indexToUpdate !== undefined && indexToUpdate !== -1) {
      tasks[indexToUpdate].value = value;
      setTasks([...tasks]);
    }
  };

  useEffect(() => {
    if (tasks && tasks.length !== 0) tasksProgressHandler();
    const socket = SocketClient.getSocket();
    socket.on("tasks:value-changed", textChangedListener);
    return () => {
      socket.off("tasks:value-changed");
    };
  }, [tasks]);

  const getProjectTasks = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (selectedProject) {
        const response = await api.get("/tasks/" + selectedProject.id);
        setTasks(response.data);
      }
    } catch (error) {
      AxiosErrorHandler(error, router, "Error fetching tasks");
    }
  };

  useEffect(() => {
    setTasks(null);
    const socket = SocketClient.getSocket();
    const projectRoomJoinListener = () => {
      socket.emit("projectRoom:join", { p_id: selectedProject.id }, (message) => {
        if (message?.error) toast.error("Real-Time updates unavailable");
      });
    };
    if (selectedProject?.id) {
      document.querySelector("#projectProgressSpan").innerText = "";
      getProjectTasks();
      projectRoomJoinListener();
      socket.io.on("reconnect", projectRoomJoinListener);
    }
    return () => {
      socket.emit("projectRoom:leave", { p_id: selectedProject?.id });
      socket.io.off("reconnect", projectRoomJoinListener);
    };
  }, [selectedProject]);

  useEffect(() => {
    const socket = SocketClient.getSocket();
    socket.io.on("reconnect", () => {
      toast.info("Real-Time Connection Restored", { toastId: "socket-notify" });
      toast.update("socket-notify", {
        render: "Real-Time Connection Restored",
        type: toast.TYPE.INFO,
        delay: 400,
        isLoading: false,
        autoClose: 2000,
      });
    });
    socket.io.on("reconnect_attempt", (attemptNumber) => {
      if (attemptNumber === 1)
        toast.error("Real-Time Connection Failed. Retrying", {
          toastId: "socket-notify",
          isLoading: true,
          closeButton: null,
        });
      setTimeout(() => toast.dismiss("socket-notify"), 2000);
    });
    return () => socket.disconnect();
  }, []);

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
                      key={e.t_id}
                      t_id={e.t_id}
                      levelProp={e.level}
                      completed={e.completed}
                      valueProp={e.value}
                      projectId={selectedProject.id}
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
