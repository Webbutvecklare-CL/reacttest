import admin from "../firebase/firebaseAdmin";

/**
 * Verifiera att användaren som gjorde requesten är inloggad och har rättigheter.
 * @param req Request object from Express
 * @param res Response object from Express
 * @returns Promise som resolvar med uid och permission om användaren finns i databasen, annars rejectar den med error
 */
export async function verifyUser(req, res) {
  return new Promise(async (resolve, reject) => {
    try {
      const { authorization } = req.headers;
      if (!authorization) {
        reject({ error: "Missing authorization header" });
      }

      const idToken = authorization.split("Bearer ")[1];
      if (!idToken) {
        reject({ error: "Invalid authorization header" });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid } = decodedToken;

      // Kolla vilka rättigheter användaren har
      const userDoc = await admin.firestore().collection("users").doc(uid).get();
      const user = userDoc.data();

      resolve({ uid, permission: user.permission });
    } catch (error) {
      reject({ error });
    }
  });
}
