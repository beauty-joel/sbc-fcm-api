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

      if (!tokens) {
        throw new Error("Tokens not found!");
      }

      if (topics && topics.includes(topic)) {
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

      const topicReference = db.collection("topics").doc(topic);
      const topicDocument = await transaction.get(topicReference);

      tokenReferenceList.forEach((tokenSnapshot) => {
        transaction.update(tokenSnapshot, {
          topics: FieldValue.arrayUnion(topic),
        });
      });

      transaction.update(accountReference, {
        [sourceTopics]: FieldValue.arrayUnion(topic),
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

exports.unsubscribeFromTopic = async (requestBody) => {
  const { email, topic, source } = requestBody;
  const sourceField = `${source}Tokens`;
  const sourceTopics = `${source}Topics`;

  const accountReference = db.doc(`deviceTokens/${email}`);
  const topicReference = db.collection("topics").doc(topic);

  let tokensReferencesList = [];
  try {
    await db.runTransaction(async (transaction) => {
      const accountDocument = await transaction.get(accountReference);
      if (!accountDocument.exists) {
        throw new Error("Account not found!");
      }

      const {
        [sourceTopics]: topics,
        [sourceField]: tokens,
        ...theRest
      } = accountDocument.data();

      if (!topics.includes(topic)) {
        throw new Error("Topic not found!");
      }

      tokens.forEach((token) => {
        const tokReferecen = db.collection("tokenDetails").doc(token);
        tokensReferencesList.push(tokReferecen);
      });

      tokensReferencesList.forEach((tokenRef) => {
        transaction.update(tokenRef, {
          topics: FieldValue.arrayRemove(topic),
        });
      });
      transaction.update(accountReference, {
        [sourceTopics]: FieldValue.arrayRemove(topic),
      });

      transaction.update(topicReference, {
        noSubscriptors: FieldValue.increment(-1),
      });
      await getMessaging().unsubscribeFromTopic(tokens, topic);
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
    message: "Unsubscribed from topic!",
  };
};

// exports.unsubscribeFromTopic = async (req, res) => {

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
