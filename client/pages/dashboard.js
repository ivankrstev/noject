import Head from "next/head";
import styles from "@/styles/Dashboard.module.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Project from "@/components/Project";
import { useState, useEffect, Fragment } from "react";

export default function Dashboard() {
  const [showSidebar, setShowSidebar] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const sidebarShowHide = () => setShowSidebar(!showSidebar);

  useEffect(() => {
    const show = localStorage.getItem("sidebarShow");
    show === "undefined" || show === "false" ? setShowSidebar(false) : setShowSidebar(true);
  }, []);

  useEffect(() => {
    if (showSidebar !== undefined) {
      localStorage.setItem("sidebarShow", showSidebar);
      document.querySelector("#navbar").style.width = showSidebar ? "calc(100% - 265px)" : "100%";
      document.querySelector("#projectMainDiv").style.width = showSidebar
        ? "calc(100% - 265px)"
        : "100%";
    }
  }, [showSidebar]);

  return (
    <Fragment>
      <Head>
        <title>Noject - Dashboard</title>
        <meta name='description' content='Manage projects and tasks with the Noject dashboard.' />
      </Head>
      <div className={styles.dashboard}>
        <div>
          <Sidebar
            sidebarShowHide={sidebarShowHide}
            showSidebar={showSidebar}
            setSelectedProject={setSelectedProject}
          />
        </div>
        <div className={styles.dashMain}>
          <Navbar showSidebar={showSidebar} sidebarShowHide={sidebarShowHide} />
          <Project selectedProject={selectedProject} />
        </div>
      </div>
    </Fragment>
  );
}
