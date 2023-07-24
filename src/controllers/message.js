const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

exports.sendToMultipleAccounts = async (req, res) => {
  const { accounts, title, body } = req.body;
  const message = {
    notification: {
      title,
      body,
    },
    tokens: [],
  };

  let tokens = [];
  for (let i = 0; i < accounts.length; i++) {
    const deviceTokensRef = db.collection("deviceTokens").doc(accounts[i]);
    const deviceTokenDoc = await deviceTokensRef.get();

    if (!deviceTokenDoc.exists) {
      res.status(501).json({
        status: "fail",
        message: `Account '${accounts[i]}' not found!`,
      });
      break;
    } else {
      const { deviceTokens } = deviceTokenDoc.data();
      tokens = tokens.concat(deviceTokens);
    }
  }

  message.tokens = await tokens;

  const batchResponse = await getMessaging().sendEachForMulticast(message);

  if (batchResponse.failureCount.successCount == 0) {
    res.status(501).json({
      status: "fail",
      message: "Failed to send all messages",
    });
  } else if (batchResponse.failureCount > 0) {
    const failedTokens = [];
    batchResponse.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });
    res.status(501).json({
      status: "fail",
      message: "Failed to send message to some tokens",
      data: {
        failedTokens,
      },
    });
  } else {
    res.status(200).json({
      status: "success",
      message: "All message were sent!",
    });
  }
};

exports.sendToSingleAccount = async (req, res) => {
  const { email, title, body } = req.body;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const docSnapshot = await deviceTokensRef.get();
  if (!docSnapshot.exists) {
    res.status(501).json({
      status: "fail",
      message: `Account ${email} not found!`,
    });
    return;
  }
  const { deviceTokens } = docSnapshot.data();
  const message = {
    notification: {
      title,
      body,
    },
    tokens: deviceTokens,
  };
  const batchResponse = await getMessaging().sendEachForMulticast(message);
  if (batchResponse.failureCount.successCount == 0) {
    res.status(501).json({
      status: "fail",
      message: "Failed to send all messages",
    });
  } else if (batchResponse.failureCount > 0) {
    const failedTokens = [];
    batchResponse.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(deviceTokens[idx]);
      }
    });
    res.status(501).json({
      status: "fail",
      message: "Failed to send message to some tokens",
      data: {
        failedTokens,
      },
    });
  } else {
    res.status(200).json({
      status: "success",
      message: `Message sent to ${deviceTokens.length} device(s).`,
    });
  }
};

exports.sendToTopic = async (req, res) => {
  const { topic, title, body } = req.body;

  const message = {
    notification: {
      title,
      body,
    },
    topic: topic,
  };

  try {
    const response = await getMessaging().send(message);
    console.log(response);
    res.status(200).json({
      status: "success",
      message: `Successfully sent message to topic: ${topic}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `Error sending message: ${error}`,
    });
  }
};

exports.sendBatch = async (req, res) => {
  try {
    const { messages } = req.body;
    const responseBatch = await getMessaging().sendEach(messages);
    res.status(200).json({
      status: "success",
      message: `All messages were send ${responseBatch}`,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: `There was an error: ${error}`,
    });
  }
};

exports.sendToGroup = async (req, res) => {
  const { tokens, title, body } = req.body;

  const message = {
    notification: {
      title,
      body,
    },
    tokens,
  };

  const batchResponse = await getMessaging().sendEachForMulticast(message);
  if (batchResponse.failureCount.successCount == 0) {
    res.status(501).json({
      status: "fail",
      message: "Failed to send all messages",
    });
  } else if (batchResponse.failureCount > 0) {
    const failedTokens = [];
    batchResponse.responses.forEach((resp, idx) => {
      if (!resp.success) {
        failedTokens.push(tokens[idx]);
      }
    });
    res.status(501).json({
      status: "fail",
      message: "Failed to send message to some tokens",
      data: {
        failedTokens,
      },
    });
  } else {
    res.status(200).json({
      status: "success",
      message: `Message sent to ${tokens.length} device(s).`,
    });
  }
};

exports.sentToSingleDevice = async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title,
      body,
    },
    token,
  };
  try {
    const response = await getMessaging().send(message);
    res.status(200).json({
      status: "success",
      message: `Successfully sent message: ${response}`,
    });
  } catch (error) {
    res.status(501).json({
      status: "fail",
      message: `Failed to send message to token: ${token}`,
    });
  }
};
