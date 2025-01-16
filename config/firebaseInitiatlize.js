var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

if (!admin.apps.length) {
  admin.initializeApp({
      credential: admin.credential.applicationDefault(), // Ensure this is set up with appropriate credentials
  });
}

