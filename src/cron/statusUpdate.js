import cron from "node-cron";
import { Tournament } from "../model/tournamentModel.js";

cron.schedule("0 * * * *", async () => {
  const now = new Date();

  const tournaments = await Tournament.findAll();
  for (const t of tournaments) {
    let newStatus = t.status;
    if (now >= t.startDate && now <= t.endDate) {
      newStatus = "Running";
    } else if (now > t.endDate) {
      newStatus = "Completed";
    } else if (now < t.startDate) {
      newStatus = "Upcoming";
    }

    if (t.status !== newStatus) {
      t.status = newStatus;
      await t.save();
    }
  }

  console.log("[CRON] Tournament statuses updated.");
});
