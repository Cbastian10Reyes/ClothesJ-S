const dns = require("node:dns");
const mongoose = require("mongoose");

dns.setServers(["192.168.10.1"]);

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;