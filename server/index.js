import dotenv from "dotenv";
import app from "./src/app.js";
import connectDb from "./src/config/db.js";
import { validateEnv } from "./src/config/env.js";
import initDatabase from "./src/config/initDatabase.js";

dotenv.config();
validateEnv();

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDb();
    await initDatabase();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
