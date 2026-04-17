import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import Event from "../models/Event.js";
import Seat from "../models/Seat.js";
import Booking from "../models/Booking.js";

const models = [User, Wallet, Transaction, Event, Seat, Booking];

const initDatabase = async () => {
  for (const model of models) {
    await model.createCollection();
    await model.syncIndexes();
  }

  console.log("db indexes synced");
};

export default initDatabase;
