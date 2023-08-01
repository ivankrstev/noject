class SocketStore {
  constructor() {
    this.connectedUsers = new Map();
  }

  setSocketId = (email, socketId) => {
    if (!this.connectedUsers.has(email)) this.connectedUsers.set(email, []);
    this.connectedUsers.get(email).push(socketId);
  };

  getSocketIds = (email) => this.connectedUsers.get(email) || [];

  removeSocketByEmail = (email, socketId) => {
    const socketIds = this.connectedUsers.get(email);
    if (socketIds) {
      const index = socketIds.indexOf(socketId);
      if (index !== -1) socketIds.splice(index, 1);
    }
  };
}

const socketStore = new SocketStore();
Object.freeze(socketStore);
export default socketStore;
