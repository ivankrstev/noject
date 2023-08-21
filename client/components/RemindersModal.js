import styles from "@/styles/Modals.module.css";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DeleteIcon from "@/public/icons/delete.svg";
import Image from "next/image";
import { toast } from "react-toastify";

export default function RemindersModal({ closeModal, t_id }) {
  const router = useRouter();
  const [data, setData] = useState({});
  const [reminderTime, setReminderTime] = useState(null);

  const getTaskData = async () => {
    try {
      const taskDetails = await api.get(`/tasks/details/${t_id}`);
      setData(taskDetails.data);
      if (taskDetails.data.reminder) {
        setReminderTime(new Date(taskDetails.data.reminder.reminder_time));
        document.querySelector("#when_to_remind_select").value =
          taskDetails.data.reminder.when_to_remind;
      }
    } catch (error) {
      AxiosErrorHandler(error, router);
      closeModal();
    }
  };

  const handleCreatingReminder = async () => {
    try {
      const when_to_remind = document.querySelector("#when_to_remind_select").value;
      await api.post("/reminders/" + t_id, {
        reminder_time: reminderTime,
        when_to_remind,
      });
      toast.success("Reminder created");
      closeModal();
    } catch (error) {
      console.error(error);
      AxiosErrorHandler(error, router);
      closeModal();
    }
  };

  const handleUpdatingReminder = async () => {
    try {
      const when_to_remind = document.querySelector("#when_to_remind_select").value;
      await api.put("/reminders/" + t_id, {
        reminder_time: reminderTime,
        when_to_remind,
      });
      toast.success("Reminder updated");
      closeModal();
    } catch (error) {
      console.error(error);
      AxiosErrorHandler(error, router);
      closeModal();
    }
  };

  const handleDeletingReminder = async () => {
    try {
      await api.delete("/reminders/" + t_id);
      toast.success("Reminder deleted");
      closeModal();
    } catch (error) {
      AxiosErrorHandler(error, router);
      closeModal();
    }
  };

  useEffect(() => {
    const handleCloseOnKey = (e) => e.code === "Escape" && closeModal();
    getTaskData();
    document.documentElement.style.overflowY = "hidden";
    document.addEventListener("keydown", handleCloseOnKey);
    return () => {
      document.documentElement.style.overflowY = "auto";
      document.removeEventListener("keydown", handleCloseOnKey);
    };
  }, []);

  return (
    <div className={styles.fullscreenModal}>
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ ease: "easeInOut", duration: 0.3 }}
        className={styles.modalContent}>
        <h5>
          Creation date:{" "}
          {data.task ? moment(data.task.creation_date).format("Do MMMM YYYY, HH:mm") : ""}
        </h5>
        <h5>Created by: {data.task ? data.task.created_by : ""}</h5>
        {data.task && data.task.completed === 1 && (
          <h5>Completed by: {data.task ? data.task.completed_by : ""}</h5>
        )}
        <div style={{ display: "flex", flexDirection: "column", margin: "1em 0" }}>
          {!data.reminder && (
            <div>
              <h5>Create reminder:</h5>
              <DatePicker
                dateFormat='d MMMM, yyyy H:mm'
                showTimeSelect
                onChange={(date) => setReminderTime(date)}
                selected={reminderTime}
                shouldCloseOnSelect={true}
              />
              <select id='when_to_remind_select' title='Select when to remind'>
                <option defaultValue value='0'>
                  At time of event
                </option>
                <option value='5m'>5</option>
                <option value='10m'>10m</option>
                <option value='15m'>15m</option>
                <option value='30m'>30m</option>
                <option value='1h'>1h</option>
                <option value='12h'>12h</option>
                <option value='24h'>24h</option>
              </select>
            </div>
          )}
          {data.reminder && (
            <div>
              <h5>Current reminder:</h5>
              <DatePicker
                dateFormat='d MMMM, yyyy H:mm'
                showTimeSelect
                onChange={(date) => setReminderTime(date)}
                selected={reminderTime}
              />
              <select id='when_to_remind_select' title='Select when to remind'>
                <option defaultValue value='0'>
                  At time of event
                </option>
                <option value='5m'>5</option>
                <option value='10m'>10m</option>
                <option value='15m'>15m</option>
                <option value='30m'>30m</option>
                <option value='1h'>1h</option>
                <option value='12h'>12h</option>
                <option value='24h'>24h</option>
              </select>
            </div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          {!data.reminder && (
            <button className={styles.confirmButton} onClick={() => handleCreatingReminder()}>
              Create
            </button>
          )}
          {data.reminder && (
            <button className={styles.confirmButton} onClick={() => handleUpdatingReminder()}>
              Update
            </button>
          )}
          {data.reminder && (
            <button
              className={styles.deleteButton}
              onClick={() => handleDeletingReminder()}
              title='Delete reminder'>
              <Image src={DeleteIcon} alt='Delete' width={25} />
            </button>
          )}
          <button className={styles.cancelButton} onClick={() => closeModal()} title='Close modal'>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
