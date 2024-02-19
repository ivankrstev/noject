import { getAccessToken } from "@/utils/api";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class TasksSignalRService {
  #connection;
  constructor() {
    this.#connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SERVER_URL}/TasksHub`, {
        accessTokenFactory: async () => await getAccessToken(),
      })
      .configureLogging(process.env.NEXT_PUBLIC_SIGNALR_LOGGING ? LogLevel.Debug : LogLevel.None)
      .withAutomaticReconnect()
      .build();
  }

  async #startConnection() {
    try {
      await this.#connection.start();
      console.log("signalr connection established");
    } catch (err) {
      AxiosErrorHandler(null, router, "Real-time task operations are currently unavailable");
    }
  }

  async invoke(methodName, ...args) {
    try {
      if (this.#connection.state !== "Connected") await this.#startConnection();
      return await this.#connection.invoke(methodName, ...args);
    } catch (error) {
      throw error;
    }
  }
}

const tasksSocket = new TasksSignalRService();
export default tasksSocket;
