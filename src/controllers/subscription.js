const subscriptionsService = require("../services/subscriptions");

exports.subscribeToTopic = async (req, res) => {
  const { email, topic, source } = req.body;

  if (!email || !topic || !source) {
    res.status(400).json({
      status: "fail",
      message: "Email, topic and source are required!",
    });
  } else {
    const subscription = await subscriptionsService.subscribeToTopic(req.body);
    if (subscription.status == "success") {
      res.status(200).json(subscription);
    } else if (subscription.status == "fail") {
      res.status(400).json(subscription);
    } else {
      res.status(500).json({
        status: "fail",
        message: "Unknown error while trying to subscribe!",
      });
    }
  }
};
