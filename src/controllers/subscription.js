const { getMessaging } = require("firebase-admin/messaging");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const db = getFirestore();

async function checkIfDocumentExists(collection, document) {
  const doc = await db.collection(collection).doc(document).get();
  return doc.exists;
}

async function getDocument(collection, document) {
  return await db.collection(collection).doc(document).get();
}

exports.subscribeToTopic = async (req, res) => {
  const { email, topic, source } = req.body;

  // 1) Check request body payload
  if (!email || !topic) {
    res.status(400).json({
      status: "fail",
      message: "Email and topic should be provided!",
    });
  }

  // 2) Check if account document exists
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const docSnapshot = await deviceTokensRef.get();

  if (!docSnapshot.exists) {
    res.status(404).json({
      status: "fail",
      message: `Account ${email} not found.`,
    });
  }

  // 3) Check if account is already subscribed to the topic
  const tokensRef = db.collection("tokenDetails");
  const query = tokensRef
    .where("email", "==", email)
    .where("topics", "array-contains", topic);

  const snapshot = await query.count().get();
  console.log(snapshot.data());
  if (snapshot.data().count > 0) {
    res.status(404).json({
      status: "fail",
      message: `Account ${email} is already subscribre to the topic: ${topic}.`,
    });
  } else {
    const { deviceTokens } = docSnapshot.data();
    try {
      await getMessaging().subscribeToTopic(deviceTokens, topic);

      // Register/Create Topic into Topics Colllection
      const topicExists = await checkIfDocumentExists("topics", topic);
      console.log(topicExists);

      if (topicExists) {
        const topicRef = db.collection("topics").doc(topic);
        const snapshot = await topicRef.get();
        console.log(snapshot.data());
        const topicData = snapshot.data();

        // Update number of subscriptors
        await topicRef.update({
          noSubscriptors: topicData.noSubscriptors + 1,
        });
      } else {
        const data = {
          createdAt: Timestamp.now(),
          lastUsedAt: Timestamp.now(),
          timesCalled: 0,
          noSubscriptors: 1,
          active: true,
          source: source,
        };

        // Add a new document in collection "topics" with ID 'topicName'
        await db.collection("topics").doc(topic).set(data);
      }
    } catch (error) {
      res.status(501).json({
        status: "fail",
        message: `Error subscribing to topic:', ${error}`,
      });
    }
    // Update tokens topic list
    deviceTokens.forEach(async (token) => {
      const tokenRef = db.collection("tokenDetails").doc(token);
      await tokenRef.update({
        topics: FieldValue.arrayUnion(topic),
      });
    });

    res.status(200).json({
      status: "success",
      message: `Successfully subscribed to topic:', ${topic}`,
    });
  }
};
exports.unsubscribeFromTopic = async (req, res) => {
  const { email, topic } = req.body;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const docSnapshot = await deviceTokensRef.get();

  if (docSnapshot.exists) {
    const { deviceTokens } = docSnapshot.data();
    console.log(deviceTokens);
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
