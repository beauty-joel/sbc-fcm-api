const { initializeApp, cert } = require("firebase-admin/app");
const { FIRESTORE_URL, FIREBASE_SERVICE_ACCOUNT_KEY } = process.env;

if (process.env["NODE_ENV"] == "test") {
  require("dotenv").config();
}

const serviceAccount = require(`./${FIREBASE_SERVICE_ACCOUNT_KEY}`);

const connectFB = () => {
  try {
    initializeApp({
      credential: cert(serviceAccount),
      FIRESTORE_URL,
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = { connectFB };
