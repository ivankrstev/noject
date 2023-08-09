import db from "../../db/index.js";

export default async function verifyTaskAccess(req, res, next) {
  try {
    let { p_id, t_id } = req.params;
    if (!t_id || t_id === "") return res.status(400).json({ error: "Project id(p_id) missing" });
    const [rows] = await db.execute(
      "SELECT EXISTS(SELECT * FROM tasks WHERE t_id = ? AND p_id = ?) as allowed",
      [t_id, p_id]
    );
    if (rows.length === 0 || !rows[0].allowed)
      return res.status(403).json({ error: "Access Denied. Unauthorized Request" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
}
