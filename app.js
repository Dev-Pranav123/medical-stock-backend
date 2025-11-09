const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const { admin } = require("./firebase/firebaseConfig"); // <- Import Admin SDK

const authRoutes = require("./routes/auth");
const medicineRoutes = require("./routes/medicines");  // <-- Import medicine routes here
const cors = require("cors");

app.use(bodyParser.json());

// Debug middleware - place BEFORE routes
app.use((req, res, next) => {
  console.log("Admin SDK Project:", admin.app().options.credential.projectId);
  console.log("Incoming Auth Header:", req.headers.authorization);
  next();
});

// Allow requests from your frontend
app.use(cors({
  origin: "http://localhost:5173", // <-- your Vite frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true // if you need cookies/auth headers
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicine", medicineRoutes); 

// Root
app.get("/", (req, res) => {
  res.send("Medical Stock API is running.");
});

// Start Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

