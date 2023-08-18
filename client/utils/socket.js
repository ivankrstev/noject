import { io } from "socket.io-client";

class SocketConnector {
  #socket = null;

  constructor() {
    this.initSocketConnection();
  }

  initSocketConnection() {
    if (!this.#socket) {
      this.#socket = io(process.env.NEXT_PUBLIC_SERVER_URL, {
        secure: true,
        withCredentials: true,
      });
    }
  }

  getSocket() {
    if (!this.#socket?.connected) this.#socket.connect();
    return this.#socket;
  }
}

const SocketClient = new SocketConnector();
export default SocketClient;
