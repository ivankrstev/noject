import Head from "next/head";
import styles from "@/styles/Dashboard.module.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useState, useEffect, Fragment } from "react";
import Task from "@/components/Task";
import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, x: -200, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -100 },
};

export default function Dasboard() {
  const [showSidebar, setShowSidebar] = useState();
  const [selectProject, setSelectProject] = useState("Noject");
  useEffect(() => {
    const show = localStorage.getItem("sidebarShow");
    show === "undefined" || show === "false" ? setShowSidebar(false) : setShowSidebar(true);
  }, []);
  useEffect(() => {
    if (showSidebar !== undefined) {
      localStorage.setItem("sidebarShow", showSidebar);
    }
  }, [showSidebar]);
  const sidebarShowHide = () => setShowSidebar(!showSidebar);

  return (
    <motion.main
      initial='hidden'
      animate='enter'
      exit='exit'
      variants={variants}
      transition={{ type: "linear" }}>
      <Head>
        <title>Dashboard - Noject</title>
      </Head>
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
          <Task />
        </div>
      </div>
    </motion.main>
  );
}