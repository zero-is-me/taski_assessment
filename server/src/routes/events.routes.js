import { Router } from "express";
import { getEventById, getEvents, getSeatsByEvent } from "../controllers/events.controller.js";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.get("/:id/seats", getSeatsByEvent);

export default router;
