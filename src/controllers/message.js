const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");
const { getAccountTokens } = require("./utils");

const db = getFirestore();

exports.sendToMultipleAccounts = async (req, res) => {
  const { accounts, title, body } = req.body;

  if (!title || !body || !accounts) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body and tokens array must be provided",
    });
  } else {
    const message = {
      notification: {
        title,
        body,
      },
      tokens: [],
    };
    tokens = [];
    for (let i = 0; i < accounts.length; i++) {
      const deviceTokensRef = db.collection("deviceTokens").doc(accounts[i]);
      const deviceTokenDoc = await deviceTokensRef.get();

      if (!deviceTokenDoc.exists) {
        res.status(500).json({
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
      res.status(500).json({
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
      res.status(500).json({
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
  }
};

exports.sendToSingleAccount = async (req, res) => {
  const { email, title, body, source } = req.body;
  if (!email || !title || !body) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body and email must be provided",
    });
  } else {
    const deviceTokensRef = db.collection("deviceTokens").doc(email);
    const docSnapshot = await deviceTokensRef.get();
    if (!docSnapshot.exists) {
      res.status(500).json({
        status: "fail",
        message: `Account ${email} not found!`,
      });
      return;
    }
    const tokens = await getAccountTokens(email, source);
    console.log(tokens);
    const message = {
      notification: {
        title,
        body,
      },
      tokens: tokens,
    };
    const batchResponse = await getMessaging().sendEachForMulticast(message);
    if (batchResponse.failureCount.successCount == 0) {
      res.status(500).json({
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
      res.status(500).json({
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
  }
};

exports.sendToTopic = async (req, res) => {
  const { topic, title, body } = req.body;

  if (!topic || !title || !body) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body and topic must be provided",
    });
  } else {
    const message = {
      notification: {
        title,
        body,
      },
      topic: topic,
    };

    try {
      await getMessaging().send(message);
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
  }
};

exports.sendBatch = async (req, res) => {
  const { messages } = req.body;
  if (messages && Array.isArray(messages)) {
    try {
      const responseBatch = await getMessaging().sendEach(messages);
      res.status(200).json({
        status: "success",
        message: "All messages were send.",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `There was an error: ${error}`,
      });
    }
  } else {
    res.status(400).json({
      status: "fail",
      message: "A messages array must be provided",
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

  if (token && title && body) {
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
  } else {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body and token must be provided!",
    });
  }
};
