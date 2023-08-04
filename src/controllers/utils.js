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
