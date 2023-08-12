import db from "../../db/index.js";

export default async function verifyTaskAccess(req, res, next) {
  try {
    // Check if an user can modify a task, with finding the p_id from the task, and then checking project(p_id) access
    let { t_id } = req.params;
    if (!t_id || t_id === "") return res.status(400).json({ error: "Task id(t_id) missing" });
    const [[result]] = await db.execute("SELECT p_id FROM tasks WHERE t_id = ?", [t_id]);
    if (!result) return res.status(403).json({ error: "Access Denied. Unauthorized Request" });
    const { p_id } = result;
    req.p_id = p_id;
    console.log(p_id);
    const [[{ allowed }]] = await db.execute(
      "SELECT EXISTS(SELECT p_id FROM projects WHERE created_by = ? AND p_id = ?) OR EXISTS(SELECT p_id FROM project_collaborators WHERE u_id = ? AND p_id = ?) as allowed",
      [req.user, p_id, req.user, p_id]
    );
    if (!allowed) return res.status(403).json({ error: "Access Denied. Unauthorized Request" });
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Something went wrong" });
  }
}
