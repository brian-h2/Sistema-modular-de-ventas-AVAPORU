import { Router } from "express";
import {
  listSchedules,
  createSchedule,
  toggleSchedule,
  deleteSchedule,
  sendScheduleNow,
} from "../controllers/scheduledReports.controller.js";
const r = Router();

r.get("/", listSchedules);
r.post("/", createSchedule);
r.patch("/:id/toggle", toggleSchedule);
r.post("/:id/send-now", sendScheduleNow);
r.delete("/:id", deleteSchedule);

export default r;
