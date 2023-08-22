const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const db = getFirestore();

exports.sendToMultipleAccounts = async (requestBody) => {
  const { title, body, accounts, source } = requestBody;

  const sourceField = `${source}Tokens`;
  const message = {
    notification: {
      title,
      body,
    },
    tokens: [],
  };
  let tokens = [];

  try {
    for (let i = 0; i < accounts.length; i++) {
      const deviceTokensRef = db.collection("deviceTokens").doc(accounts[i]);
      const deviceTokenDoc = await deviceTokensRef.get();
      if (!deviceTokenDoc.exists) {
        throw new Error(`Account "${accounts[i]}" not found!`);
      } else {
        // TODO check if account has no source tokens
        const { [sourceField]: accTokens, ...theRest } = deviceTokenDoc.data();
        if (!accTokens) {
          throw new Error(`Not tokens found for ${accounts[i]}`);
        }
        tokens = tokens.concat(accTokens);
      }
    }
    console.log(tokens);

    message.tokens = tokens;

    const batchResponse = await getMessaging().sendEachForMulticast(message);

    if (batchResponse.failureCount.successCount == 0) {
      throw new Error(`Failed to send all messages!`);
    } else if (batchResponse.failureCount > 0) {
      const failedTokens = [];
      batchResponse.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      return {
        status: "fail",
        message: "Failed to send message to some tokens",
        data: {
          failedTokens,
        },
      };
    } else {
      return {
        status: "success",
        message: "All message were sent!",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }
};

exports.sendToSingleAccount = async (requestBody) => {
  const { title, body, email, source } = requestBody;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const docSnapshot = await deviceTokensRef.get();
  const sourceField = `${source}Tokens`;

  try {
    if (!docSnapshot.exists) {
      throw new Error("Account not found!");
    }
    const { [sourceField]: tokens, ...theRest } = docSnapshot.data();

    const message = {
      notification: {
        title,
        body,
      },
      tokens: tokens,
    };

    const batchResponse = await getMessaging().sendEachForMulticast(message);
    if (batchResponse.failureCount.successCount == 0) {
      return {
        status: "fail",
        message: "Failed to send all messages",
      };
    } else if (batchResponse.failureCount > 0) {
      const failedTokens = [];
      batchResponse.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      return {
        status: "fail",
        message: "Failed to send message to some tokens",
        data: {
          failedTokens,
        },
      };
    } else {
      return {
        status: "success",
        message: `Message sent to ${tokens.length} device(s).`,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }
};

exports.sendToToken = async (requestBody) => {
  const { topic, title, body } = requestBody;

  const message = {
    notification: {
      title,
      body,
    },
    topic: topic,
  };

  try {
    const topicReference = db.collection("topics").doc(topic);
    const topicDocument = await db.get(topicReference);

    if (topicDocument.exists) {
      await getMessaging().send(message);
      await topicReference.update({
        timesCalled: FieldValue.increment(1),
      });
      return {
        status: "success",
        message: `Successfully sent message to topic: ${topic}`,
      };
    } else {
      throw new Error(`Topic "${accounts[i]}" not found!`);
    }
  } catch (error) {
    console.log(error);
    return {
      status: "fail",
      message: `${error}`,
    };
  }
};

// exports.sendBatch = async (req, res) => {
//   const { messages } = req.body;
//   if (messages && Array.isArray(messages)) {
//     try {
//       const responseBatch = await getMessaging().sendEach(messages);
//       res.status(200).json({
//         status: "success",
//         message: "All messages were send.",
//       });
//     } catch (error) {
//       res.status(500).json({
//         status: "fail",
//         message: `There was an error: ${error}`,
//       });
//     }
//   } else {
//     res.status(400).json({
//       status: "fail",
//       message: "A messages array must be provided",
//     });
//   }
// };

// exports.sendToGroup = async (req, res) => {
//   const { tokens, title, body } = req.body;

//   const message = {
//     notification: {
//       title,
//       body,
//     },
//     tokens,
//   };

//   const batchResponse = await getMessaging().sendEachForMulticast(message);
//   if (batchResponse.failureCount.successCount == 0) {
//     res.status(501).json({
//       status: "fail",
//       message: "Failed to send all messages",
//     });
//   } else if (batchResponse.failureCount > 0) {
//     const failedTokens = [];
//     batchResponse.responses.forEach((resp, idx) => {
//       if (!resp.success) {
//         failedTokens.push(tokens[idx]);
//       }
//     });
//     res.status(501).json({
//       status: "fail",
//       message: "Failed to send message to some tokens",
//       data: {
//         failedTokens,
//       },
//     });
//   } else {
//     res.status(200).json({
//       status: "success",
//       message: `Message sent to ${tokens.length} device(s).`,
//     });
//   }
// };

// exports.sentToSingleDevice = async (req, res) => {
//   const { token, title, body } = req.body;

//   if (token && title && body) {
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       token,
//     };
//     try {
//       const response = await getMessaging().send(message);
//       res.status(200).json({
//         status: "success",
//         message: `Successfully sent message: ${response}`,
//       });
//     } catch (error) {
//       res.status(501).json({
//         status: "fail",
//         message: `Failed to send message to token: ${token}`,
//       });
//     }
//   } else {
//     res.status(400).json({
//       status: "fail",
//       message: "Missing fields, title, body and token must be provided!",
//     });
//   }
// };
