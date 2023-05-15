import styles from "@/styles/Sidebar.module.css";
import closeMenuIcon from "@/public/icons/close-menu.svg";
import Image from "next/image";

export default function Sidebar(props) {
  return (
    <div className={[styles.sidebar, !props.showSidebar && styles.sidebarHide].join(" ")}>
      <div className={styles.headerWrapper}>
        <h3>Workspaces</h3>
        <button
          title='Close Sidebar'
          className={styles.sidebarCloseBtn}
          onClick={() => props.sidebarShowHide(!props.showSidebar)}>
          <Image width={25} src={closeMenuIcon} alt='Close Sidebar Icon' />
        </button>
      </div>
      <div className={styles.myProjHeader}>
        <h5>My projects</h5>
        <div className={styles.orderMyProj}>
          <h6>Order by:</h6>
          <select onChange={(e) => console.log(e.target.value)}>
            <option value='Alphabetically'>Alphabetically</option>
            <option value='Creation Date'>Creation Date</option>
            <option value='Modification Date'>Modification Date</option>
          </select>
        </div>
      </div>
      <div id='p1' className={styles.sidebarProjectItem} title='Weather Report for the cast'>
        <div className={styles.sidebarProjectSquare}>W</div>
        <p>Weather Report for the cast</p>
      </div>
      <div id='p2' className={styles.sidebarProjectItem} title='Task Manager'>
        <div className={styles.sidebarProjectSquare}>T</div>
        <p>Task Manager</p>
      </div>
      <h5>Shared projects</h5>
    </div>
  );
}
