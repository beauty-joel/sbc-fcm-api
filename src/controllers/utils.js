const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

exports.checkIfDocumentExists = async (collection, document) => {
  try {
    const doc = await db.collection(collection).doc(document).get();
    return doc.exists;
  } catch (error) {
    console.log(error);
  }
};

exports.getDocumentData = async (collection, document) => {
  const documentReference = db.collection(collection).doc(document);
  const documentSnapshot = await documentReference.get();
  return documentSnapshot.data();
};

exports.getAccountTokens = async (email, source) => {
  const sourceField = `${source}Tokens`;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const deviceTokensDoc = await deviceTokensRef.get();
  const { [sourceField]: tokens, ...theRest } = deviceTokensDoc.data();

  return tokens;
};

exports.getAccountTopics = async (email, source) => {
  const sourceField = `${source}Tokens`;
  const deviceTokensRef = db.collection("deviceTokens").doc(email);
  const deviceTokensDoc = await deviceTokensRef.get();
  const { [sourceField]: tokens, ...theRest } = deviceTokensDoc.data();

  const ref = db.collection("tokenDetails").doc(tokens[0]);
  const doc = await ref.get();
  const { topics } = doc.data();

  return topics;
};
