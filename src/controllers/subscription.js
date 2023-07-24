const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

exports.subscribeToTopic = async (req, res) => {
  const { email, topic } = req.body;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const docSnapshot = await deviceTokensRef.get();

  if (docSnapshot.exists) {
    const { deviceTokens } = docSnapshot.data();
    try {
      const response = await getMessaging().subscribeToTopic(
        deviceTokens,
        topic
      );
      res.status(200).json({
        status: "success",
        message: `Successfully subscribed to topic:', ${response}`,
      });
    } catch (error) {
      res.status(501).json({
        status: "fail",
        message: `Error subscribing to topic:', ${error}`,
      });
    }
  } else {
    res.status(404).json({
      status: "fail",
      message: `Account ${email} not found.`,
    });
  }
};

exports.unsubscribeFromTopic = async (req, res) => {
  const { email, topic } = req.body;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const docSnapshot = await deviceTokensRef.get();

  if (docSnapshot.exists) {
    const { deviceTokens } = docSnapshot.data();
    try {
      const response = await getMessaging().unsubscribeFromTopic(
        deviceTokens,
        topic
      );
      res.status(200).json({
        status: "success",
        message: `Successfully unsubscribed from topic:', ${response}`,
      });
    } catch (error) {
      res.status(501).json({
        status: "fail",
        message: `Error unsubscribing from topic:', ${error}`,
      });
    }
  } else {
    res.status(404).json({
      status: "fail",
      message: `Account not found:', ${email}`,
    });
  }
};
