const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const db = getFirestore();

// const saveDeviceTokens = async (email, token, source) => {
//   try {
//     const deviceTokensRef = db.collection("deviceTokens").doc(email);
//     const deviceTokensDoc = await deviceTokensRef.get();
//     const fieldName = `${source}Tokens`;
//     if (deviceTokensDoc.exists) {
//       await deviceTokensRef.update({
//         [fieldName]: FieldValue.arrayUnion(token),
//       });
//     } else {
//       await deviceTokensRef.set({ [fieldName]: [token] });
//     }
//     return "Device token saved!";
//   } catch (error) {
//     console.log(error);
//   }
// };

// const saveTokenDetails = async (
//   email,
//   token,
//   deviceType,
//   source,
//   topics = []
// ) => {
//   try {
//     const data = {
//       createdAt: Timestamp.now(),
//       deviceType,
//       email,
//       topics,
//       source,
//     };

//     await db.collection("tokenDetails").doc(token).set(data);
//   } catch (error) {
//     throw new Error(error.details);
//   }
// };

// Test if token already exists
// const tokenExists = await checkIfDocumentExists("tokenDetails", token);
// const accountExists = await checkIfDocumentExists("deviceTokens", email);
// if (tokenExists) {
//   throw new Error("Token already exists!");
// } else {
//   //
//   let topics = [];

//   if (accountExists) {
//     topics = await getAccountTopics(email, source);
//     if (topics.length > 0) {
//       topics.forEach(async (topic) => {
//         await getMessaging().subscribeToTopic(token, topic);
//       });
//     }
//   }

//   // Save
//   await saveDeviceTokens(email, token, source);
//   await saveTokenDetails(email, token, deviceType, source, topics);
//   res.status(200).json({
//     status: "success",
//     message: "Token successfully saved",
//   });
// }

exports.saveToken = async (requestBody) => {
  const { email, token, source, deviceType } = requestBody;

  const sourceField = `${source}Tokens`;
  const tokenReference = db.doc(`tokenDetails/${token}`);
  const accountReference = db.doc(`deviceTokens/${email}`);

  try {
    await db.runTransaction(async (transaction) => {
      let topics = [];
      const tokenDocument = await transaction.get(tokenReference);
      const accountDocument = await transaction.get(accountReference);
      if (tokenDocument.exists) {
        throw new Error("Token already exists!");
      }

      if (accountDocument.exists) {
        const { [sourceField]: tokens, ...theRest } = accountDocument.data();
        console.log(tokens[0]);
        const singleTokenReference = db.doc(`tokenDetails/${tokens[0]}`);
        const singleTokenDocument = await transaction.get(singleTokenReference);
        topics = singleTokenDocument.data().topics;

        if (topics.length > 0) {
          console.log("Topic Subscription");
          //   topics.forEach(async (topic) => {
          //     await getMessaging().subscribeToTopic(token, topic);
          //   });
        }
        console.log(topics);

        // Save token details
        const tokenData = {
          createdAt: Timestamp.now(),
          deviceType,
          email,
          topics,
          source,
        };

        const newTokenReference = db.collection("tokenDetails").doc(token);

        transaction.set(newTokenReference, tokenData);
        transaction.update(accountReference, {
          [sourceField]: FieldValue.arrayUnion(token),
        });
      } else {
      }

      // Add one person to the city population.
      // Note: this could be done without a transaction
      //       by updating the population using FieldValue.increment()
      //   const newPopulation = doc.data().population + 1;
      //   t.update(cityRef, { population: newPopulation });
      return {
        status: "success",
        message: "Token saved correctly",
      };
    });

    console.log("Transaction success!");
  } catch (error) {
    console.log("Transaction failure:", error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }
};