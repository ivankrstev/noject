import db from "../../db/index.js";

export const getReminder = async (req, res) => {
  try {
    const { t_id } = req.params;
    const [reminder] = await db.execute("SELECT * FROM reminders WHERE rt_id = ? AND ru_id = ?", [
      t_id,
      req.user,
    ]);
    if (reminder.length === 0) return res.status(200).json({ message: "Reminder not found" });
    return res.status(200).json(reminder[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
