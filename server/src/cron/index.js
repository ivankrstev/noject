import cron from "node-cron";
import db from "../../db/index.js";
import sendReminderEmail from "../utils/sendReminderEmail.js";

export default function runCronJob() {
  cron.schedule("0 0 * * *", async () => {
    // Check for expired refresh tokens every day
    try {
      await db.execute("DELETE FROM refresh_tokens WHERE expire_at > NOW()");
    } catch (error) {}
  });
  cron.schedule("*/30 * * * *", async () => {
    try {
      const [reminders] = await db.execute(
        "SELECT ru_id, users.first_name, users.last_name, DATE_FORMAT(reminder_time, '%Y-%m-%d %H:%i:00') as reminder_time, tasks.value FROM reminders INNER JOIN tasks ON rt_id = tasks.t_id INNER JOIN users ON ru_id = users.u_id WHERE DATE_FORMAT(CASE WHEN when_to_remind = '0' THEN reminder_time WHEN when_to_remind = '5m' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) MINUTE) WHEN when_to_remind = '10m' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) MINUTE) WHEN when_to_remind = '15m' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) MINUTE) WHEN when_to_remind = '30m' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) MINUTE) WHEN when_to_remind = '1h' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) HOUR) WHEN when_to_remind = '12h' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) HOUR) WHEN when_to_remind = '24h' THEN DATE_SUB(reminder_time, INTERVAL SUBSTRING(when_to_remind, 1, LENGTH(when_to_remind) - 1) HOUR) END,'%Y-%m-%d %H:%i:00') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00');"
      );
      reminders.forEach((reminder) => sendReminderEmail(reminder));
    } catch (error) {
      console.error(error);
    }
  });
}

// "*/30 * * * *"
