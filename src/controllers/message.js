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

exports.sendToGroup = async (req, res) => {
  const { title, body, tokens } = req.body;

  if (!title || !body || !tokens) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields, title, body and tokens must be provided",
    });
  } else {
    const message = await messagesService.sendToGroup(req.body);
    if (message.status == "success") {
      res.status(200).json(message);
    } else if (message.status == "fail") {
      res.status(400).json(message);
    } else {
      res.status(500).json({
        status: "fail",
        message:
          "Unknown error while trying to send message to a group of tokens!",
      });
    }
  }
};

exports.sendBatch = async (req, res) => {
  const { messages } = req.body;

  if (messages && Array.isArray(messages)) {
    const message = await messagesService.sendBatch(req.body);
    if (message.status == "success") {
      res.status(200).json(message);
    } else if (message.status == "fail") {
      res.status(400).json(message);
    } else {
      res.status(500).json({
        status: "fail",
        message: "Unknown error while trying to send message batch!",
      });
    }
  } else {
    res.status(400).json({
      status: "fail",
      message: "You should provide an array containing valid FCM Messages",
    });
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
