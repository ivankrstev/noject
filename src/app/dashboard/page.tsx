"use client";
import Navbar from "@/components/Navbar";
import Project from "@/components/Project";
import Sidebar from "@/components/Sidebar";
import styles from "@/styles/Dashboard.module.css";
import Head from "next/head";
import { Fragment, useEffect, useState } from "react";

interface SelectedProject {
  id: string;
  name: string;
}

export default function Dashboard() {
  const [showSidebar, setShowSidebar] = useState<boolean | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<SelectedProject | null>(null);

  const sidebarShowHide = (): void => setShowSidebar(!showSidebar);

  useEffect(() => {
    const show = localStorage.getItem("sidebarShow");
    if (show === "undefined" || show === "false") setShowSidebar(false);
    else setShowSidebar(true);
  }, []);

  useEffect(() => {
    if (showSidebar !== undefined) {
      localStorage.setItem("sidebarShow", showSidebar.toString());

      const navbar = document.querySelector("#navbar") as HTMLElement | null;
      const projectMainDiv = document.querySelector("#projectMainDiv") as HTMLElement | null;

      if (navbar) {
        navbar.style.width = showSidebar ? "calc(100vw - 265px)" : "100vw";
      }

      if (projectMainDiv) {
        projectMainDiv.style.width = showSidebar ? "calc(100vw - 265px)" : "100vw";
      }
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
            showSidebar={showSidebar || false}
            setSelectedProject={setSelectedProject}
          />
        </div>
        <div id='dashMain' className={styles.dashMain}>
          <Navbar showSidebar={showSidebar} sidebarShowHide={sidebarShowHide} />
          <Project selectedProject={selectedProject} />
        </div>
      </div>
    </Fragment>
  );
}
