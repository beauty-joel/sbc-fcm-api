require("dotenv").config({ path: "src/config/.env" });

const { connectFB } = require("./src/config/firestore");

connectFB();
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const db = getFirestore();

const token = "abcd4321";
const email = "test3@email.com";
const source = "app";

const data = {
  token,
  email,
  source,
};

async function saveToken(data) {
  const documentReference = db.doc(`tokenDetails/${data.token}/topics`);
  const document = await documentReference.get();
  console.log(document.data());
}

saveToken(data);
