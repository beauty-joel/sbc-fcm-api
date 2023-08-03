const cors = require("cors");
const express = require("express");

const tokensRoutes = require("./src/routes/tokens");
const messagesRoutes = require("./src/routes/messages");
const subscriptionRoutes = require("./src/routes/subscription");

// Server
const app = express();
app.use(cors());
app.use(express.json());

// Development logging
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Routes
app.use("/sbc-fcm-api/v1/tokens", tokensRoutes);
app.use("/sbc-fcm-api/v1/messages", messagesRoutes);
app.use("/sbc-fcm-api/v1/subscriptions", subscriptionRoutes);
// TODO
// app.use("/sbc-fcm-api/v1/topics", topicsRoutes);

module.exports = app;
