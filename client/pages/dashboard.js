import Head from "next/head";
import styles from "@/styles/Dashboard.module.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import Project from "@/components/Project";
import { useState, useEffect, Fragment } from "react";
import { motion } from "framer-motion";

export default function Dasboard() {
  const [showSidebar, setShowSidebar] = useState();
  const [selectProject, setSelectProject] = useState("Noject");
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
      <motion.main
        key='dashboard'
        initial={{ opacity: 0, x: -200, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 0, y: -100 }}
        transition={{ ease: "easeInOut" }}>
        <div className={styles.dashboard}>
          <div>
            <Sidebar
              sidebarShowHide={sidebarShowHide}
              showSidebar={showSidebar}
              setSelectProject={setSelectProject}
            />
          </div>
          <div className={styles.dashMain}>
            <Navbar
              showSidebar={showSidebar}
              sidebarShowHide={sidebarShowHide}
              selectProject={selectProject}
            />
            <Project selectProject={selectProject} />
          </div>
        </div>
      </motion.main>
    </Fragment>
  );
}
