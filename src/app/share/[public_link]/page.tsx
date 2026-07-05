"use client";
import TaskViewProject from "@/components/TaskViewProject";
import styles from "@/styles/Project.module.css";
import calculateProject from "@/utils/tasks/tasksProgressHandler";
import axios, { AxiosError } from "axios";
import Head from "next/head";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import { HashLoader } from "react-spinners";
import { toast } from "react-toastify";

interface Task {
  t_id: number;
  value: string;
  level: number;
  completed: boolean;
}

interface Project {
  name: string;
  id: string;
  [key: string]: unknown;
}

interface ApiResponse {
  project: Project;
  tasks: Task[];
}

interface ApiError {
  error?: string;
  message?: string;
}

export default function ViewProject() {
  const router = useRouter();
  const params = useParams();
  const publicLink = params.public_link as string;

  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [projectData, setProjectData] = useState<Project | undefined>(undefined);

  const getProjectTasks = useCallback(
    async (public_link: string): Promise<void> => {
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/project/share/${public_link}`
        );
        setProjectData(response.data.project);
        setTasks(response.data.tasks);
      } catch (error) {
        console.error(error);
        const axiosError = error as AxiosError<ApiError>;
        if (axiosError.response?.status === 404) router.push("/404");

        toast.error(
          axiosError.response?.data?.error || axiosError.message || "Something went wrong!"
        );
      }
    },
    [router]
  );

  useEffect(() => {
    if (publicLink) {
      getProjectTasks(publicLink);
    }
  }, [publicLink, getProjectTasks]);

  useEffect(() => {
    if (tasks && tasks.length !== 0) calculateProject();
  }, [tasks]);

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
