const admin = require("firebase-admin");

// Note: Ensure GOOGLE_APPLICATION_CREDENTIALS environment variable is set
// or initialize with a service account object if available in env.
try {
  admin.initializeApp();
} catch (error) {
  console.warn("Firebase Admin failed to initialize. Make sure GOOGLE_APPLICATION_CREDENTIALS is set.");
}

function signToken(user) {
  throw new Error("signToken is deprecated. Tokens are issued by Firebase on the client.");
}

async function verifyToken(token) {
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw new Error("Invalid Firebase ID token");
  }
}

module.exports = { signToken, verifyToken };
