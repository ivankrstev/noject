import styles from "@/styles/Project.module.css";
import Task from "./Task";
import { useEffect } from "react";
import tasksProgressHandler from "@/utils/tasksProgressHandler";

export default function Project({ selectProject }) {
  useEffect(() => {
    tasksProgressHandler();
  }, []);

  return (
    <div id='projectMainDiv' className={styles.projectMain}>
      <div className={styles.projectHeaderDiv}>
        <h2>{selectProject}</h2>
        <span id='projectProgressSpan' title='Project progress'></span>
      </div>
      <div
        id='projectTasksWrapperDiv'
        className={[styles.projectTasksWrapper, styles.noWrapLines].join(" ")}>
        <Task
          completed={true}
          levelProp={0}
          text='asdasdasdasd changing info This is a task for
        changing info This is a task for changing info'
        />
        <Task
          completed={true}
          levelProp={0}
          text='This is a task for changing info This is a task for changing info This is a task for
        changing info This is a task for changing info This is a task for changing info This is a
        task for changing info This is a task for changing info This is a task for changing info
        This is a task for changing info This is a task for'
        />
        <Task levelProp={0} text='Main task' />
        <Task levelProp={1} text='Sub task ' />
        <Task levelProp={2} text='Sub sub task ' />
        <Task levelProp={3} text='Sub sub sub task ' />
        <Task completed={true} levelProp={3} text='Sub sub sub task ' />
        <Task completed={true} levelProp={3} text='Sub sub sub task ' />
        <Task completed={true} levelProp={2} text='Sub sub task ' />
        <Task levelProp={1} text='Sub task' />
        <Task levelProp={0} text='Main Task' />
      </div>
    </div>
  );
}
