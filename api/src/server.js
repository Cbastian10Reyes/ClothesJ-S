const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup error:",
      error
    );

    process.exit(1);
  }
};

startServer();