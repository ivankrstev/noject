import cron from "node-cron";
import db from "../../db/index.js";

export default function runCronJob() {
  cron.schedule("0 0 * * *", async () => {
    // Check for expired refresh tokens every day
    try {
      await db.execute("DELETE FROM refresh_tokens WHERE expire_at > NOW()");
    } catch (error) {}
  });
}
