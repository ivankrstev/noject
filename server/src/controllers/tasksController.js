import db from "../../db/index.js";

export const getAllTasks = async (req, res) => {
  try {
    let { p_id } = req.params;
    const [rows] = await db.execute("SELECT * FROM tasks WHERE p_id = ?", [p_id]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
};
