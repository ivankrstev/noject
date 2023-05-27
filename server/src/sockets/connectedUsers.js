let connectedUsers = {};

export const setSocketId = (email, socketId) => (connectedUsers[email] = socketId);
export const getSocketId = (email) => connectedUsers[email];
