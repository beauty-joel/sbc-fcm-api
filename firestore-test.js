const { initializeApp } = require("firebase-admin/app");
const {
  getFirestore,
  connectFirestoreEmulator,
} = require("firebase-admin/firestore");

process.env["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080";

const firebaseConfig = {
  projectId: "apapacho-app",
};

initializeApp(firebaseConfig);
// const db = getFirestore();
// const {
//   getFirestore,
//   connectFirestoreEmulator,
// } = require("firebase/firestore");

// // firebaseApps previously initialized using initializeApp()
const db = getFirestore();
const deviceTokensRef = db.collection("deviceTokens").doc("test@email.com");
deviceTokensRef.set({ deviceTokens: ["123456"] });
// connectFirestoreEmulator(db, "127.0.0.1", 8080);
