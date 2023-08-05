import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import styles from "@/styles/Project.module.css";
import TaskViewProject from "@/components/TaskViewProject";
import calculateProject from "@/utils/tasksProgressHandler";
import axios from "axios";
import { toast } from "react-toastify";
import { HashLoader } from "react-spinners";

export default function ViewProject() {
  const router = useRouter();
  const [tasks, setTasks] = useState();
  const [projectData, setProjectData] = useState();

  useEffect(() => {
    if (router.query.public_link) getProjectTasks(router.query.public_link);
  }, [router.query.public_link]);

  useEffect(() => {
    if (tasks && tasks.length !== 0) calculateProject();
  }, [tasks]);

  const getProjectTasks = async (public_link) => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_SERVER_URL + "/project/share/" + public_link
      );
      setProjectData(response.data.project);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) router.push("/404");
      toast.error(error.response?.data?.error || error.message || "Something went wrong!");
    }
  };

  return (
    <Fragment>
      <Head>
        <title>Noject - View Project</title>
        <meta name='description' content='View project and its tasks if it is shared.' />
      </Head>
      {projectData && tasks && (
        <div id='projectMainDiv' className={styles.projectMain}>
          <div className={styles.projectHeaderDiv}>
            <h2>{projectData?.name}</h2>
            <span id='projectProgressSpan' title='Project progress'></span>
          </div>
          <div
            id='projectTasksWrapperDiv'
            className={[styles.projectTasksWrapper, styles.noWrapLines].join(" ")}>
            {tasks &&
              (tasks.length === 0 ? (
                <h5>No tasks created</h5>
              ) : (
                tasks.map((e) => (
                  <TaskViewProject
                    key={e.t_id}
                    level={e.level}
                    value={e.value}
                    completed={e.completed}
                  />
                ))
              ))}
          </div>
        </div>
      )}
      {!projectData && !tasks && (
        <div className='center' style={{ width: "100vw", height: "100vh" }}>
          <HashLoader size={120} color='#0570eb' />
        </div>
      )}
    </Fragment>
  );
}
