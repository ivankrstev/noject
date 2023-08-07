import db from "../../db/index.js";

export default async function verifyProjectAccess(req, res, next) {
  try {
    let { p_id } = req.params;
    if (!p_id || p_id + "" === "")
      return res.status(400).json({ error: "Project id(p_id) missing" });
    const user = req.user;
    const [rows] = await db.execute(
      "SELECT EXISTS(SELECT p_id FROM projects WHERE created_by = ? AND p_id = ?) OR EXISTS(SELECT p_id FROM project_collaborators WHERE u_id = ? AND p_id = ?) as allowed",
      [user, p_id, user, p_id]
    );
    if (rows.length === 0 || !rows[0].allowed)
      return res.status(403).json({ error: "Access Denied. Unauthorized Request" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
}
