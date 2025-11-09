const { admin } = require("../firebase/firebaseConfig"); // <-- destructure admin

const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ error: "Token missing" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ error: "Invalid token", message: err.message });
  }
};

module.exports = verifyFirebaseToken;
