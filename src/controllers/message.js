const messagesService = require("../services/messages");

exports.sendToMultipleAccounts = async (req, res) => {
  const { accounts, title, body, source } = req.body;

  if (!title || !body || !accounts || !source) {
    res.status(400).json({
      status: "fail",
      message:
        "Missing fields, title, body, emails and source array must be provided",
    });
  } else {
    const message = await messagesService.sendToMultipleAccounts(req.body);
    if (message.status == "success") {
      res.status(200).json(message);
    } else if (message.status == "fail") {
      res.status(400).json(message);
    } else {
      res.status(500).json({
        status: "fail",
        message: "Unknown error while trying to unsubscribe!",
      });
    }
  }
};

exports.sendToSingleAccount = async (req, res) => {
  const { email, title, body, source } = req.body;

  if (!title || !body || !email || !source) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body, email and source must be provided",
    });
  } else {
    const message = await messagesService.sendToSingleAccount(req.body);
    if (message.status == "success") {
      res.status(200).json(message);
    } else if (message.status == "fail") {
      res.status(400).json(message);
    } else {
      res.status(500).json({
        status: "fail",
        message: "Unknown error while trying to unsubscribe!",
      });
    }
  }
};

exports.sendToTopic = async (req, res) => {
  const { title, body, topic } = req.body;

  if (!title || !body || !topic) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body, email and source must be provided",
    });
  } else {
    const message = await messagesService.sendToToken(req.body);
    if (message.status == "success") {
      res.status(200).json(message);
    } else if (message.status == "fail") {
      res.status(400).json(message);
    } else {
      res.status(500).json({
        status: "fail",
        message: "Unknown error while trying to unsubscribe!",
      });
    }
  }
};

// exports.sendToSingleAccount = async (req, res) => {
//   const { email, title, body, source } = req.body;
//   if (!email || !title || !body || !source) {
//     res.status(400).json({
//       status: "fail",
//       message: "Missing fields, title, body, email and source must be provided",
//     });
//   } else {
//     const deviceTokensRef = db.collection("deviceTokens").doc(email);
//     const docSnapshot = await deviceTokensRef.get();
//     if (!docSnapshot.exists) {
//       res.status(500).json({
//         status: "fail",
//         message: `Account ${email} not found!`,
//       });
//       return;
//     }
//     const tokens = await getAccountTokens(email, source);
//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       tokens: tokens,
//     };
//     const batchResponse = await getMessaging().sendEachForMulticast(message);
//     if (batchResponse.failureCount.successCount == 0) {
//       res.status(500).json({
//         status: "fail",
//         message: "Failed to send all messages",
//       });
//     } else if (batchResponse.failureCount > 0) {
//       const failedTokens = [];
//       batchResponse.responses.forEach((resp, idx) => {
//         if (!resp.success) {
//           failedTokens.push(tokens[idx]);
//         }
//       });
//       res.status(500).json({
//         status: "fail",
//         message: "Failed to send message to some tokens",
//         data: {
//           failedTokens,
//         },
//       });
//     } else {
//       res.status(200).json({
//         status: "success",
//         message: `Message sent to ${tokens.length} device(s).`,
//       });
//     }
//   }
// };
