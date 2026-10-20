import mongoose from "mongoose";
import dns from "node:dns";

// Resolve SRV records using public DNS servers (fixes querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI ?? "";

export async function connectDb() {
    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}