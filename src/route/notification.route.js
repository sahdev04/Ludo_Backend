import express from "express";
import {
  sendNotification,
  getUserNotifications,
  markNotificationRead,
  deleteNotification,
} from "../controller/notification.controller.js";

const router = express.Router();

// POST - send a notification
router.post("/send", sendNotification);

// GET - get all notifications for a user
router.get("/:userId", getUserNotifications);

// PATCH - mark notification as read
router.patch("/read/:id", markNotificationRead);

// DELETE - delete notification
router.delete("/:id", deleteNotification);

export default router;
