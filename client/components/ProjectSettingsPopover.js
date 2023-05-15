import { useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/Navbar.module.css";
import SettingsIcon from "@/public/icons/settings.svg";

const closeSettingPopover = (event) => {
  if (
    event.target !== document.querySelector("#projectSettingBtn img") &&
    event.target !== document.querySelector("#projectSettingBtn") &&
    event.target !== document.querySelector("#projectSettingsPopover") &&
    !document.querySelector("#projectSettingsPopover span").contains(event.target) &&
    !document.querySelector("#projectSettingsPopover span:nth-child(2)").contains(event.target)
  ) {
    document.querySelector("#projectSettingsPopover").style.display = "none";
    document.removeEventListener("click", closeSettingPopover);
  }
};

export default function ProjectSettingsPopover() {
  useEffect(() => {
    // Saving the project settings to the localStorage
    if (localStorage.getItem("wrapTasks") === "true")
      document.querySelector("#wrapTasksBox").checked = true;
    if (localStorage.getItem("showPercentages") === "true")
      document.querySelector("#showPercentagesBox").checked = true;
  }, []);

  return (
    <div>
      <button
        id='projectSettingBtn'
        onClick={(e) => {
          const pSettingsPopover = document.querySelector("#projectSettingsPopover");
          if (pSettingsPopover.style.display === "flex") {
            pSettingsPopover.style.display = "none";
            document.removeEventListener("click", closeSettingPopover);
          } else {
            // Add eventListener to close the popover when user clicks outside of it
            document.addEventListener("click", closeSettingPopover);
            if (
              pSettingsPopover.getBoundingClientRect().width >
              window.innerWidth - e.target.offsetLeft - 115
            )
              pSettingsPopover.style.left = e.target.offsetLeft - 115 + "px";
            else pSettingsPopover.style.left = e.target.offsetLeft + "px";
            pSettingsPopover.style.top = e.target.offsetTop + e.target.offsetHeight + "px";
            pSettingsPopover.style.display = "flex";
          }
        }}
        className={[styles.settingsBtn, "center"].join(" ")}
        title='Project Settings'>
        <Image className='center' src={SettingsIcon} width={27} alt='Project Settings' />
      </button>
      <div id='projectSettingsPopover' className={styles.projectSettingsPopover}>
        <span>
          <input
            id='wrapTasksBox'
            type='checkbox'
            onChange={(e) => localStorage.setItem("wrapTasks", e.target.checked)}
          />
          <label htmlFor='wrapTasksBox'>Wrap tasks</label>
        </span>
        <span>
          <input
            id='showPercentagesBox'
            type='checkbox'
            onChange={(e) => localStorage.setItem("showPercentages", e.target.checked)}
          />
          <label htmlFor='showPercentagesBox'>Show percentages</label>
        </span>
      </div>
    </div>
  );
}
