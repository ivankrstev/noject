import db from "../../db/index.js";

export const createReminder = async (req, res) => {
  try {
    const { t_id } = req.params;
    let { reminder_time, when_to_remind } = req.body;
    if (!when_to_remind) when_to_remind = 0;
    if (!reminder_time) return res.status(400).json({ error: "reminder_time can't be empty" });
    reminder_time = new Date(reminder_time);
    await db.execute(
      "INSERT INTO reminders (rt_id, ru_id, reminder_time, when_to_remind) VALUES (?, ?, ?, ?)",
      [t_id, req.user, reminder_time, when_to_remind]
    );
    return res.status(201).json({ message: "Reminder created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const deleteReminder = async (req, res) => {
  try {
    const { t_id } = req.params;
    const [rows] = await db.execute("DELETE FROM reminders WHERE rt_id = ? AND ru_id = ?", [
      t_id,
      req.user,
    ]);
    if (rows.affectedRows === 0)
      return res.status(500).json({ error: "Oops! Something went wrong" });
    return res.status(200).json({ message: "Reminder deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};

export const updateReminder = async (req, res) => {
  try {
    const { t_id } = req.params;
    let { reminder_time, when_to_remind } = req.body;
    if (!reminder_time && !when_to_remind)
      return res.status(400).json({ error: "Nothing to update" });
    if (reminder_time) {
      reminder_time = new Date(reminder_time);
      await db.execute("UPDATE reminders SET reminder_time = ? WHERE rt_id = ? AND ru_id = ?", [
        reminder_time,
        t_id,
        req.user,
      ]);
    }
    if (reminder_time !== null || reminder_time !== undefined) {
      reminder_time = new Date(reminder_time);
      await db.execute("UPDATE reminders SET when_to_remind = ? WHERE rt_id = ? AND ru_id = ?", [
        when_to_remind,
        t_id,
        req.user,
      ]);
    }
    return res.status(200).json({ message: "Reminder updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
