const express = require("express");
const router = express.Router();
const { admin } = require("../firebase/firebaseConfig");

const db = admin.firestore();

/**
 * Middleware to verify Firebase ID token
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * POST /api/medicine/addMedicine
 * Add a new medicine
 */
router.post("/addMedicine", verifyToken, async (req, res) => {
  try {
    const { name, mrp, createdAt, userEmail } = req.body;

    if (!name || !mrp || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const medicineRef = db.collection("medicines").doc();
    await medicineRef.set({
      name,
      mrp: Number(mrp),
      createdAt: createdAt || new Date().toISOString(),
      userEmail,
      stock: 0, // default stock
    });

    res.status(201).json({ id: medicineRef.id, message: "Medicine added successfully" });
  } catch (error) {
    console.error("Error adding medicine:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/medicine/all?userEmail=email
 * Fetch all medicines for a user
 */
router.get("/all", verifyToken, async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) return res.status(400).json({ error: "Missing userEmail" });

    const snapshot = await db
      .collection("medicines")
      .where("userEmail", "==", userEmail)
      .get();

    const medicines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(medicines);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/medicine/addstock
 * Increment existing medicine stock
 */
router.put("/addstock", verifyToken, async (req, res) => {
  try {
    const { name, addedStock, userEmail } = req.body;

    if (!name || !addedStock || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const medQuery = await db
      .collection("medicines")
      .where("name", "==", name)
      .where("userEmail", "==", userEmail)
      .limit(1)
      .get();

    if (medQuery.empty) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const medDoc = medQuery.docs[0];
    await medDoc.ref.update({
      stock: admin.firestore.FieldValue.increment(Number(addedStock)),
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: "Stock added successfully" });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/medicine/updatestock
 * Update stock manually by ID
 */
router.put("/updatestock", verifyToken, async (req, res) => {
  try {
    const { id, newStock, userEmail } = req.body;

    if (!id || newStock == null || !userEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const medRef = db.collection("medicines").doc(id);
    const docSnap = await medRef.get();

    if (!docSnap.exists || docSnap.data().userEmail !== userEmail) {
      return res.status(404).json({ error: "Medicine not found or unauthorized" });
    }

    await medRef.update({
      stock: Number(newStock),
      updatedAt: new Date().toISOString(),
    });

    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
