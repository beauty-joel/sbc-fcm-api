require("dotenv").config({ path: "./src/config/.env" });
const { connectFB } = require("./src/config/firestore");

connectFB();

const PORT = process.env.PORT || 3001;

const app = require("./app");

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
