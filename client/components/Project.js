import Task from "@/components/Task";
import useTaskStore from "@/store/tasksStore";
import styles from "@/styles/Project.module.css";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import api from "@/utils/api";
import { setFocusCursorOnEnd } from "@/utils/tasks/taskKeyEventsHandler";
import { addTask } from "@/utils/tasks/taskOperations";
import tasksProgressHandler from "@/utils/tasks/tasksProgressHandler";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import { HashLoader } from "react-spinners";

export default function Project({ selectedProject }) {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const taskToFocus = useTaskStore((state) => state.taskToFocus);
  const taskRefs = useRef({});
  const [updateTasks, setUpdateTasks] = useState(false);

  useEffect(() => {
    if (tasks && tasks.length !== 0) tasksProgressHandler();
  }, [tasks]);

  useEffect(() => {
    if (taskToFocus && taskRefs.current[taskToFocus])
      setFocusCursorOnEnd(taskRefs.current[taskToFocus]);
    if (taskToFocus !== null) useTaskStore.getState().setTaskToFocus(null);
  }, [taskToFocus]);

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
          <div id='projectTasksWrapperDiv' className={styles.projectTasksWrapper}>
            <Fragment>
              {tasks.length !== 0 ? (
                tasks.map((e) => (
                  <Task
                    key={e.id}
                    taskId={e.id}
                    ref={(el) => (taskRefs.current[e.id] = el)}
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
                    onClick={() => addTask(selectedProject?.id, null)}>
                    Create new task
                  </button>
                </div>
              )}
            </Fragment>
          </div>
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
