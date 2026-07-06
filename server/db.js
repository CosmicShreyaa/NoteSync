import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/notesync";

let isUsingMockDB = false;

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    // Attempt connection with a short timeout to prevent hanging if MongoDB is not running
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.warn("\n========================================================");
    console.warn("WARNING: Could not connect to MongoDB at:", MONGODB_URI);
    console.warn("Error message:", error.message);
    console.warn("The server will start in IN-MEMORY MOCK DB fallback mode.");
    console.warn("Note: Changes will not persist after server restarts.");
    console.warn("========================================================\n");
    isUsingMockDB = true;
  }
}

export function isMockDB() {
  return isUsingMockDB;
}
