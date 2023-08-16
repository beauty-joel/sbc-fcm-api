const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const tokenServices = require("../services/tokens");

const db = getFirestore();

exports.saveToken = async (req, res) => {
  const { email, token, deviceType, source } = req.body;

  if (!email || !token || !deviceType || !source) {
    res.status(400).json({
      status: "fail",
      message: "Missing fields",
    });
  } else {
    const tokenResponse = await tokenServices.saveToken(req.body);
    if (tokenResponse.status == "fail") {
      res.status(500).json({
        status: "fail",
        message: `Error: ${tokenResponse.message}`,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: `Token saved!`,
      });
    }
  }
};

exports.deleteToken = async (req, res) => {
  const { token, source } = req.body;

  if (!token || !source) {
    // Check if token exists

    res.status(400).json({
      status: "fail",
      message: "A token and source must be provided",
    });
  } else {
    const tokenResponse = await tokenServices.deleteToken(req.body);
    if (tokenResponse.status == "fail") {
      res.status(400).json({
        status: "fail",
        message: `Error: ${tokenResponse.message}`,
      });
    } else if (tokenResponse.status == "success") {
      res.status(204).json();
    } else {
      res.status(500).json({
        status: "fail",
        message: "Error unknown when deleting a token",
      });
    }
  }
};
