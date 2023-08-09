import db from "../../../db/index.js";

export default function projectRoomEvent(socket) {
  socket.on("projectRoom:join", async (data, callback) => {
    try {
      const { p_id } = data;
      if (!p_id || p_id === "") return callback({ error: "Project id(p_id) missing" });
      const [rows] = await db.execute(
        "SELECT EXISTS(SELECT p_id FROM projects WHERE created_by = ? AND p_id = ?) OR EXISTS(SELECT p_id FROM project_collaborators WHERE u_id = ? AND p_id = ?) as allowed",
        [socket.user, p_id, socket.user, p_id]
      );
      if (rows.length === 0 || !rows[0].allowed)
        return callback({ error: "Access Denied. Unauthorized!" });
      if (data.p_id) socket.join("p-" + data.p_id);
    } catch (error) {
      callback({ error: "Oops! Something went wrong" });
    }
  });
  socket.on("projectRoom:leave", (data) => {
    if (data.p_id) socket.leave("p-" + data.p_id);
  });
}
