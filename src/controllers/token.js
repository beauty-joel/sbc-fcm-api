const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

const { checkIfDocumentExists, getDocumentData } = require("./utils");

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

const saveTokenDetails = async (email, token, deviceType, source) => {
  try {
    const data = {
      createdAt: Timestamp.now(),
      deviceType,
      email,
      topics: [],
      source,
    };

    await db.collection("tokenDetails").doc(token).set(data);
  } catch (error) {
    throw new Error(error.details);
  }
};

exports.saveToken = async (req, res) => {
  const { email, token, deviceType, source } = req.body;

  if (!email && !token && !deviceType && !source) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields",
    });
  } else {
    // Test if token already exists
    const tokenExists = await checkIfDocumentExists("tokenDetails", token);
    console.log(tokenExists);
    if (tokenExists) {
      res.status(400).json({
        status: "fail",
        message: "Token already exists",
      });
    } else {
      // Save
      await saveDeviceTokens(email, token, source);
      await saveTokenDetails(email, token, deviceType, source);
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
    const tokenExists = await checkIfDocumentExists("tokenDetails", token);
    if (!tokenExists) {
      res.status(404).json({
        status: "fail",
        message: `Token '${token}' not found!`,
      });
    } else {
      const sourceField = `${source}Tokens`;
      const tokenDetails = await getDocumentData("tokenDetails", token);
      const { email } = tokenDetails;
      // Check if the token is unique for the account
      tokenReference = db.collection("deviceTokens");
      query = tokenReference.where("appTokens", "array-contains", token);
      snapshot = await query.count().get();

      console.log(snapshot.data().count);

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
  } else {
    res.status(400).json({
      status: "fail",
      message: "A token and source must be provided",
    });
  }
};
