const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");

app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Medical Stock API is running.");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
