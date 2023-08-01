import { io } from "socket.io-client";

class SocketConnector {
  #socket = null;

  constructor() {
    this.initSocketConnection();
  }

  initSocketConnection() {
    if (!this.#socket) {
      this.#socket = io("http://localhost:5000", { secure: true, withCredentials: true });
    }
  }

  getSocket() {
    return this.#socket;
  }
}

const SocketClient = new SocketConnector();
export default SocketClient;
