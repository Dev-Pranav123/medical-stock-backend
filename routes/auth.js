const express = require("express");
const router = express.Router();
const admin = require("../firebase/firebaseConfig");

// Signup - You will create user on Firebase Auth
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: "User created successfully",
      uid: userRecord.uid,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login - Client should send Firebase ID token, we verify it here
router.post("/login", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    res.status(200).json({
      message: "User authenticated",
      uid,
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;
