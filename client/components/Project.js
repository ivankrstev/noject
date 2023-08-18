import styles from "@/styles/Project.module.css";
import Task from "./Task";
import { Fragment, useEffect, useState } from "react";
import tasksProgressHandler from "@/utils/tasks/tasksProgressHandler";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";
import SocketClient from "@/utils/socket";

export default function Project({ selectedProject }) {
  const [tasks, setTasks] = useState();

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
      toast.error(error.response?.data?.error || error.message || "Error fetching tasks");
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
      <div id='projectMainDiv' className={styles.projectMain}>
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
                  <p>No tasks</p>
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
