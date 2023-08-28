const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const db = getFirestore();

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

exports.sentToSingleDevice = async (requestBody) => {
  const { token, title, body } = requestBody;
  const message = {
    notification: {
      title,
      body,
    },
    token,
  };
  try {
    const response = await getMessaging().send(message);
    return {
      status: "success",
      message: `Successfully sent message: ${token}`,
    };
  } catch (error) {
    return {
      status: "fail",
      message: `Failed to send message to token: ${token}`,
    };
  }
};
