import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import { startPeriodicCleanup, cleanAllUploadsImmediately } from "./utils/fileCleanup.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");

    // Clean any old leftover uploads and start recurring cleaner
    cleanAllUploadsImmediately();
    startPeriodicCleanup(10 * 60 * 1000, 5 * 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB Connection Failed:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();