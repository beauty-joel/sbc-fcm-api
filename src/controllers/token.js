const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const db = getFirestore();

const saveDeviceTokens = async (email, token) => {
  try {
    const deviceTokensRef = db.collection("deviceTokens").doc(email);
    const deviceTokensDoc = await deviceTokensRef.get();

    if (deviceTokensDoc.exists) {
      await deviceTokensRef.update({
        deviceTokens: FieldValue.arrayUnion(token),
      });
    } else {
      await deviceTokensRef.set({ deviceTokens: [token] });
    }
    return "Device token saved!";
  } catch (error) {
    console.log(error);
  }
};

const saveTokenDetails = async (email, token, deviceType) => {
  try {
    const data = {
      createdAt: Timestamp.now(),
      deviceType,
      email,
    };
    await db.collection("tokenDetails").doc(token).set(data);
  } catch (error) {
    throw new Error(error.details);
  }
};

exports.saveToken = async (req, res) => {
  try {
    const { email, token, deviceType } = req.body;

    if (email || token || deviceType) {
      await saveDeviceTokens(email, token);
      await saveTokenDetails(email, token, deviceType);
      res.status(200).json({
        status: "success",
        message: "Token successfully saved",
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "Missing fields",
      });
    }
  } catch (error) {
    res.status(501).json({
      status: "fail",
      message: Error.details,
    });
  }
};

exports.deleteToken = async (req, res) => {
  const { token } = req.body;
  const tokenDetailsRef = db.collection("tokenDetails").doc(token);
  const doc = await tokenDetailsRef.get();
  if (!doc.exists) {
    res.status(404).json({
      status: "fail",
      message: `Token '${token}' not found!`,
    });
  } else {
    const { email } = doc.data();
    const deviceTokensRef = db.collection("deviceTokens").doc(email);
    const deviceTokensDoc = await deviceTokensRef.get();
    const { deviceTokens } = deviceTokensDoc.data();
    // If the account has only one token remove the account,
    // otherwise just update the token list and keep the account.
    if (deviceTokens.length === 1) {
      await db.collection("deviceTokens").doc(email).delete();
    } else {
      await deviceTokensRef.update({
        deviceTokens: FieldValue.arrayRemove(token),
      });
    }
    await db.collection("tokenDetails").doc(token).delete();
    res.status(204).json();
  }
};

// TODO Test invalid token
// TODO Test partial input
//
