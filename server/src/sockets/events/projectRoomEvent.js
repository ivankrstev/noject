export default function projectRoomEvent(socket) {
  socket.on("projectRoom:join", (data) => {
    if (data.p_id) socket.join("p-" + data.p_id);
  });
  socket.on("projectRoom:leave", (data) => {
    if (data.p_id) socket.leave("p-" + data.p_id);
  });
}
