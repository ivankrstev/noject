import db from "../../db/index.js";

export default async function verifyProjectOwnership(req, res, next) {
  try {
    const { p_id } = req.params;
    console.log(p_id);
    if (!p_id || p_id + "" === "")
      return res.status(400).json({ error: "Project id(p_id) missing" });
    const user = req.user;
    const [rows] = await db.execute("SELECT p_id FROM projects WHERE p_id = ? AND created_by = ?", [
      p_id,
      user,
    ]);
    if (rows.length === 0)
      return res.status(403).json({ error: "Access Denied. Unauthorized Request" });
    req.p_id = p_id;
    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
}
