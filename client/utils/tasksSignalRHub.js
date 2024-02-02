import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { getAccessToken } from "@/utils/api";

const tasksSocket = new HubConnectionBuilder()
  .withUrl(`${process.env.NEXT_PUBLIC_SERVER_URL}/TasksHub`, {
    accessTokenFactory: async () => await getAccessToken(),
  })
  .configureLogging(process.env.NEXT_PUBLIC_SIGNALR_LOGGING ? LogLevel.Information : LogLevel.None)
  .withAutomaticReconnect()
  .build();

async function start() {
  try {
    await tasksSocket.start();
  } catch (error) {}
}

tasksSocket.onclose(async () => {
  await start();
});

start();

export default tasksSocket;
