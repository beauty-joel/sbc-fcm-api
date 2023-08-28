const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const db = getFirestore();

exports.saveToken = async (requestBody) => {
  const { email, token, source, deviceType } = requestBody;

  const sourceField = `${source}Tokens`;

  // Firestore document references
  const tokenReference = db.doc(`tokenDetails/${token}`);
  const accountReference = db.doc(`deviceTokens/${email}`);

  try {
    await db.runTransaction(async (transaction) => {
      let topics = [];

      // Firestore documents
      const tokenDocument = await transaction.get(tokenReference);
      const accountDocument = await transaction.get(accountReference);

      if (tokenDocument.exists) {
        throw new Error("Token already exists!");
      }

      if (accountDocument.exists) {
        const { [sourceField]: tokens, ...theRest } = accountDocument.data();

        const singleTokenReference = db.doc(`tokenDetails/${tokens[0]}`);
        const singleTokenDocument = await transaction.get(singleTokenReference);
        topics = singleTokenDocument.data().topics;

        if (topics.length > 0) {
          console.log("Topic Subscription");
          topics.forEach(async (topic) => {
            await getMessaging().subscribeToTopic(token, topic);
          });
        }

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
        const tokenData = {
          createdAt: Timestamp.now(),
          deviceType,
          email,
          topics: [],
          source,
        };

        const newTokenReference = db.collection("tokenDetails").doc(token);
        const newAccountReference = db.collection("deviceTokens").doc(email);

        transaction.set(newTokenReference, tokenData);
        transaction.set(newAccountReference, {
          [sourceField]: [token],
        });
      }
    });
    return {
      status: "success",
      message: "Token saved correctly",
    };
  } catch (error) {
    console.log("Transaction failure:", error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }
};

exports.deleteToken = async (requestBody) => {
  const { token, source } = requestBody;

  const sourceField = `${source}Tokens`;
  const tokenReference = db.doc(`tokenDetails/${token}`);

  try {
    await db.runTransaction(async (transaction) => {
      // Firestore documents
      const tokenDocument = await transaction.get(tokenReference);

      if (tokenDocument.exists) {
        // Get the email and topics associated with the token
        const { email, topics } = tokenDocument.data();

        // Get all the tokens associated with the email
        const accountReference = db.collection("deviceTokens").doc(email);
        const accountDocument = await transaction.get(accountReference);
        const { [sourceField]: tokens, ...theRest } = accountDocument.data();

        // If there is only one token...
        if (tokens.length == 1) {
          // If tokens subscriptions...
          let topicReferencesList = [];

          if (topics.length > 0) {
            topics.forEach((topic) => {
              // Unsubscribe from Firebase Cloud Messaging Topic
              getMessaging().unsubscribeFromTopic(token, topic);
              // Update topic subscribers count
              const topicReference = db.collection("topics").doc(topic);
              topicReferencesList.push(topicReference);
            });

            console.log(topics);

            const topicsSnapshots = await transaction.getAll(
              ...topicReferencesList
            );

            topicsSnapshots.forEach((topicSnapshot) => {
              transaction.update(topicSnapshot, {
                noSubscriptors: FieldValue.increment(-1),
              });
            });
            // Delete associated "deviceTokens" dcoument.
            transaction.delete(tokenReference);
          }
        }

        if (Object.keys(theRest).length == 0 && tokens.length == 1) {
          transaction.delete(accountReference);
        } else {
          // Update account's token list to remove token
          transaction.update(accountReference, {
            [sourceField]: FieldValue.arrayRemove(token),
          });
        }
        transaction.delete(tokenReference);
      } else {
        throw new Error(`Token '${token}' not found!`);
      }
    });
  } catch (error) {
    console.log("Transaction failure:", error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }

  return {
    status: "success",
    message: "Token successfully deleted.",
  };
};
