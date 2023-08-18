const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const db = getFirestore();

exports.subscribeToTopic = async (requestBody) => {
  const { email, topic, source } = requestBody;
  const sourceField = `${source}Tokens`;
  const sourceTopics = `${source}Topics`;

  const accountReference = db.doc(`deviceTokens/${email}`);

  try {
    await db.runTransaction(async (transaction) => {
      const accountDocument = await transaction.get(accountReference);
      if (!accountDocument.exists) {
        throw new Error("Account not found!");
      }

      const {
        [sourceField]: tokens,
        [sourceTopics]: topics,
        ...theRest
      } = accountDocument.data();

      if (!topics || !tokens) {
        throw new Error(
          "Tokens or topics not found, possible source field error!"
        );
      }

      if (topics.includes(topic)) {
        throw new Error("Account already subscribed to topic!");
      }

      const subscriptionResponse = await getMessaging().subscribeToTopic(
        tokens,
        topic
      );
      console.log("Successfully subscribed to topic:", subscriptionResponse);
      let tokenReferenceList = [];
      tokens.forEach((token) => {
        const tokenReference = db.collection("tokenDetails").doc(token);
        tokenReferenceList.push(tokenReference);
      });

      const tokensSnapshots = await transaction.getAll(...tokenReferenceList);

      console.log(tokensSnapshots);

      const topicReference = db.collection("topics").doc(topic);
      const topicDocument = await transaction.get(topicReference);

      tokenReferenceList.forEach((tokenSnapshot) => {
        transaction.update(tokenSnapshot, {
          topics: FieldValue.arrayUnion(topic),
        });
      });

      if (!topicDocument.exists) {
        const data = {
          createdAt: Timestamp.now(),
          lastUsedAt: Timestamp.now(),
          timesCalled: 0,
          noSubscriptors: 1,
          active: true,
          source: source,
        };

        // Add a new document in collection "topics" with ID 'topicName'
        transaction.set(topicReference, data);
      } else {
        // Update number of subscriptors
        transaction.update(topicReference, {
          noSubscriptors: FieldValue.increment(1),
        });
      }
      console.log("Successfully subscribed to topic");
    });
  } catch (error) {
    console.log(error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }

  return {
    status: "success",
    message: `Token subscribred to: '${topic}'`,
  };
};

// const db = getFirestore();

// async function checkIfDocumentExists(collection, document) {
//   try {
//     const doc = await db.collection(collection).doc(document).get();
//     return doc.exists;
//   } catch (error) {
//     console.log(error);
//   }
// }

// async function checkIfSubscribed(email, topic) {
//   const tokensRef = db.collection("tokenDetails");
//   const query = tokensRef
//     .where("email", "==", email)
//     .where("topics", "array-contains", topic);
//   const snapshot = await query.count().get();
//   if (snapshot.data().count > 0) {
//     return true;
//   } else {
//     return false;
//   }
// }

// async function registerTopic(topic, source) {
//   const topicReference = db.collection("topics").doc(topic);
//   const topicDocument = await topicReference.get();
//   const topicExists = topicDocument.exists;

//   if (!topicExists) {
//     const data = {
//       createdAt: Timestamp.now(),
//       lastUsedAt: Timestamp.now(),
//       timesCalled: 0,
//       noSubscriptors: 1,
//       active: true,
//       source: source,
//     };

//     // Add a new document in collection "topics" with ID 'topicName'
//     await topicReference.set(data);
//   } else {
//     const topicData = topicDocument.data();
//     // Update number of subscriptors
//     await topicReference.update({
//       noSubscriptors: topicData.noSubscriptors + 1,
//     });
//   }
// }

// function addTopicToTokenDetails(deviceTokens, topic) {
//   deviceTokens.forEach(async (token) => {
//     const tokenRef = db.collection("tokenDetails").doc(token);
//     await tokenRef.update({
//       topics: FieldValue.arrayUnion(topic),
//     });
//   });
// }

// function removeTopicFromTokenDetails(deviceTokens, topic) {
//   deviceTokens.forEach(async (token) => {
//     const tokenRef = db.collection("tokenDetails").doc(token);
//     await tokenRef.update({
//       topics: FieldValue.arrayRemove(topic),
//     });
//   });
// }

// exports.subscribeToTopic = async (req, res) => {
//   const { email, topic, source } = req.body;
//   const sourceField = `${source}Tokens`;
//   // TODO Refactor request validation to a middleware
//   // 1) Check request body payload
//   if (!email || !topic || !source) {
//     res.status(400).json({
//       status: "fail",
//       message: "Email, topic and source should be provided!",
//     });
//   } else {
//     // 2) Check if account document exists
//     const accountExists = await checkIfDocumentExists("deviceTokens", email);
//     if (!accountExists) {
//       res.status(404).json({
//         status: "fail",
//         message: `Account ${email} not found.`,
//       });
//     } else {
//       // 3) Check if account is already subscribed to the topic
//       const isSubscribed = await checkIfSubscribed(email, topic);

//       if (isSubscribed) {
//         res.status(404).json({
//           status: "fail",
//           message: `Account ${email} is already subscribre to the topic: ${topic}.`,
//         });
//       }
//       // 4) Subscribe to topic
//       else {
//         const deviceTokensRef = db.collection("deviceTokens").doc(email);
//         const deviceTokensDoc = await deviceTokensRef.get();
//         const { [sourceField]: tokens, ...theRest } = deviceTokensDoc.data();
//         try {
//           // Actual subscription to topic in Firebase Cloud Messaging
//           await getMessaging().subscribeToTopic(tokens, topic);
//           // Register or Create Topic to Topics Colllection
//           await registerTopic(topic, source);
//         } catch (error) {
//           res.status(501).json({
//             status: "fail",
//             message: `Error subscribing to topic:', ${error}`,
//           });
//         }
//         // Update tokens topic list
//         addTopicToTokenDetails(tokens, topic);

//         res.status(200).json({
//           status: "success",
//           message: `Successfully subscribed to topic:', ${topic}`,
//         });
//       }
//     }
//   }
// };

// exports.unsubscribeFromTopic = async (req, res) => {
//   const { email, topic, source } = req.body;

//   const sourceField = `${source}Tokens`;

//   const accountExists = await checkIfDocumentExists("deviceTokens", email);
//   const topicExists = await checkIfDocumentExists("topics", topic);

//   // TODO add validation for already unsubscribed

//   if (accountExists && topicExists) {
//     const deviceTokensRef = db.collection("deviceTokens").doc(email);
//     const deviceTokensDoc = await deviceTokensRef.get();
//     const { [sourceField]: tokens, ...theRest } = deviceTokensDoc.data();
//     try {
//       await getMessaging().unsubscribeFromTopic(tokens, topic);
//       removeTopicFromTokenDetails(tokens, topic);
//       res.status(200).json({
//         status: "success",
//         message: `Successfully unsubscribed from topic:', ${topic}`,
//       });
//     } catch (error) {
//       res.status(501).json({
//         status: "fail",
//         message: `Error unsubscribing from topic:', ${error}`,
//       });
//     }
//   } else {
//     res.status(404).json({
//       status: "fail",
//       message: "Account or topic not found:",
//     });
//   }
// };
