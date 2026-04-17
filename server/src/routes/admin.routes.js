import { Router } from "express";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import {
  bulkCreateSeats,
  cancelBooking,
  createEvent,
  deleteEvent,
  getAdminSeats,
  getAllBookings,
  getAllTransactions,
  updateEvent,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(auth, adminAuth);
router.post("/events", createEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);
router.post("/events/:id/seats/bulk", bulkCreateSeats);
router.get("/events/:id/seats", getAdminSeats);
router.get("/bookings", getAllBookings);
router.get("/transactions", getAllTransactions);
router.post("/bookings/:id/cancel", cancelBooking);

export default router;
