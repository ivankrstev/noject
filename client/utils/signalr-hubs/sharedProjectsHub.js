import { getAccessToken } from "@/utils/api";

class SharedProjectsSocketConnector {
  #socket = null;
  #endChar = String.fromCharCode(30);
  #hubUrl = `${process.env.NEXT_PUBLIC_SERVER_URL.replace("https", "wss")}/sharedProjectsHub`;
  #eventHandlers = {};

  constructor() {
    this.#initWebSocketConnection();
  }

  async #initWebSocketConnection() {
    if (!this.#socket) {
      const token = await getAccessToken();
      if (!token) return;
      this.#socket = new WebSocket(`${this.#hubUrl}?access_token=${token}`);
      this.#socket.addEventListener("open", () => {
        console.log(`WebSocket connection established to ${this.#hubUrl}`);
        // send the protocol & version
        this.#socket.send(`{"protocol":"json","version":1}${this.#endChar}`);
        clearInterval(this.timerId);
      });
      this.#socket.addEventListener("close", (event) => {
        console.log(`WebSocket connection closed with code ${event.code}.`);
        this.#socket = null;
        clearInterval(this.timerId);
        this.timerId = setInterval(() => this.#initWebSocketConnection(), 5000);
      });
      this.#socket.addEventListener("error", (error) => console.error("WebSocket error:", error));
      this.#socket.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data.replace(this.#endChar, ""));
          if (data.target)
            if (this.#eventHandlers[data.target]) this.#eventHandlers[data.target](data.arguments);
        } catch (error) {
          console.error("Error parsing message data:", error);
        }
      });
    }
  }

  on(eventName, callback) {
    this.#eventHandlers[eventName] = callback;
  }
}

const SharedProjectsSocketClient = new SharedProjectsSocketConnector();
export default SharedProjectsSocketClient;
