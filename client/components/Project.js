import styles from "@/styles/Project.module.css";
import Task from "./Task";
import { Fragment, useEffect, useState } from "react";
import tasksProgressHandler from "@/utils/tasksProgressHandler";
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
      socket.removeAllListeners("tasks:textChanged");
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
    if (selectedProject?.id) {
      getProjectTasks();
      SocketClient.getSocket().emit("projectRoom:join", { p_id: selectedProject.id }, (message) => {
        if (message?.error) toast.error("Realtime updates unavailable");
      });
    }
    return () => {
      SocketClient.getSocket().emit("projectRoom:leave", { p_id: selectedProject?.id });
    };
  }, [selectedProject]);

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
