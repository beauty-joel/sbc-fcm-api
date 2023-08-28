const messagesService = require("../services/messages");

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

exports.sentToSingleDevice = async (req, res) => {
  const { title, body, token } = req.body;
  if (!token || !title || !body) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body, email and source must be provided",
    });
  } else {
    const message = await messagesService.sentToSingleDevice(req.body);
    if (message.status == "success") {
      res.status(200).json(message);
    } else if (message.status == "fail") {
      res.status(400).json(message);
    } else {
      res.status(500).json({
        status: "fail",
        message: "Unknown error while trying to send message to single device!",
      });
    }
  }
};
