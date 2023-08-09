const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const {
  checkIfDocumentExists,
  getDocumentData,
  getAccountTopics,
} = require("./utils");

const db = getFirestore();

const saveDeviceTokens = async (email, token, source) => {
  try {
    const deviceTokensRef = db.collection("deviceTokens").doc(email);
    const deviceTokensDoc = await deviceTokensRef.get();
    const fieldName = `${source}Tokens`;
    if (deviceTokensDoc.exists) {
      await deviceTokensRef.update({
        [fieldName]: FieldValue.arrayUnion(token),
      });
    } else {
      await deviceTokensRef.set({ [fieldName]: [token] });
    }
    return "Device token saved!";
  } catch (error) {
    console.log(error);
  }
};

const saveTokenDetails = async (
  email,
  token,
  deviceType,
  source,
  topics = []
) => {
  try {
    const data = {
      createdAt: Timestamp.now(),
      deviceType,
      email,
      topics,
      source,
    };

    await db.collection("tokenDetails").doc(token).set(data);
  } catch (error) {
    throw new Error(error.details);
  }
};

exports.saveToken = async (req, res) => {
  const { email, token, deviceType, source } = req.body;

  if (!email || !token || !deviceType || !source) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields",
    });
  } else {
    // Test if token already exists
    const tokenExists = await checkIfDocumentExists("tokenDetails", token);
    const accountExists = await checkIfDocumentExists("deviceTokens", email);
    if (tokenExists) {
      res.status(400).json({
        status: "fail",
        message: "Token already exists",
      });
    } else {
      //
      let topics = [];

      if (accountExists) {
        topics = await getAccountTopics(email, source);
        if (topics.length > 0) {
          topics.forEach(async (topic) => {
            await getMessaging().subscribeToTopic(token, topic);
          });
        }
      }

      // Save
      await saveDeviceTokens(email, token, source);
      await saveTokenDetails(email, token, deviceType, source, topics);
      res.status(200).json({
        status: "success",
        message: "Token successfully saved",
      });
    }
  }
};

exports.deleteToken = async (req, res) => {
  const { token, source } = req.body;

  if (token && source) {
    // Check if token exists
    const tokenExists = await checkIfDocumentExists("tokenDetails", token);
    if (!tokenExists) {
      res.status(404).json({
        status: "fail",
        message: `Token '${token}' not found!`,
      });
    } else {
      const sourceField = `${source}Tokens`;

      // Get the email associated with the token
      const tokenDetails = await getDocumentData("tokenDetails", token);
      const { email } = tokenDetails;

      // Get all the tokens assciated with the email
      const deviceTokensRef = db.collection("deviceTokens").doc(email);
      const deviceTokensDoc = await deviceTokensRef.get();
      const { [sourceField]: tokens, ...theRest } = deviceTokensDoc.data();

      // If there is only one token...
      if (tokens.length == 1) {
        // Get token subscriptions
        const ref = db.collection("tokenDetails").doc(token);
        const doc = await ref.get();
        const { topics } = (await doc).data();
        // If tokens subscriptions...
        if (topics.length > 0) {
          topics.forEach(async (topic) => {
            // Unsubscribe from Firebase Cloud Messaging Topic
            await getMessaging().unsubscribeFromTopic(token, topic);

            // Update topic subscribers count
            const topicReference = db.collection("topics").doc(topic);
            const topicDocument = await topicReference.get();
            const topicData = topicDocument.data();
            await topicReference.update({
              noSubscriptors: topicData.noSubscriptors - 1,
            });
          });
        }

        // Delete associated "deviceTokens" dcoument.
        await db.collection("deviceTokens").doc(email).delete();
      } else {
        // Update account's token list to remove token
        await deviceTokensRef.update({
          [sourceField]: FieldValue.arrayRemove(token),
        });
      }

      // Delete "tokenDetails" document
      await db.collection("tokenDetails").doc(token).delete();
      res.status(204).json();
    }
  } else {
    res.status(400).json({
      status: "fail",
      message: "A token and source must be provided",
    });
  }
};
