import AxiosErrorHandler from "@/utils/AxiosErrorHandler";
import { getAccessToken } from "@/utils/api";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

// Define types for SignalR method names and arguments
type SignalRMethodName = string;
type SignalRArgs = unknown[];

class TasksSignalRService {
  #connection: HubConnection;

  constructor() {
    this.#connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SERVER_URL}/TasksHub`, {
        accessTokenFactory: async () => {
          const token = await getAccessToken();
          // Ensure null is never returned to SignalR
          return token || "";
        },
      })
      .configureLogging(process.env.NEXT_PUBLIC_SIGNALR_LOGGING ? LogLevel.Debug : LogLevel.None)
      .withAutomaticReconnect()
      .build();
  }

  async #startConnection(): Promise<void> {
    try {
      await this.#connection.start();
      console.log("signalr connection established");
    } catch {
      AxiosErrorHandler(null, null, "Real-time task operations are currently unavailable");
    }
  }

  async invoke<T = unknown>(methodName: SignalRMethodName, ...args: SignalRArgs): Promise<T> {
    if (this.#connection.state !== "Connected") await this.#startConnection();
    return await this.#connection.invoke<T>(methodName, ...args);
  }
}

const tasksSocket = new TasksSignalRService();
export default tasksSocket;
