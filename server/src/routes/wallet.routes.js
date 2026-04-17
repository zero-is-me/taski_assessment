import { Router } from "express";
import auth from "../middleware/auth.js";
import { addMoney, getMyTransactions, getWallet } from "../controllers/wallet.controller.js";

const router = Router();

router.use(auth);
router.get("/", getWallet);
router.post("/add", addMoney);
router.get("/transactions", getMyTransactions);

export default router;
