import { Router } from "express";
import auth from "../middleware/auth.js";
import { confirmBooking, getMyBookings, reserveSeats } from "../controllers/bookings.controller.js";

const router = Router();

router.use(auth);
router.post("/reserve", reserveSeats);
router.post("/confirm", confirmBooking);
router.get("/", getMyBookings);

export default router;
