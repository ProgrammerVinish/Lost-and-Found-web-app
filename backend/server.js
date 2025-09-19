const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Storage for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// JSON “database”
const DB_FILE = path.join(__dirname, "items.json");
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}
let items = JSON.parse(fs.readFileSync(DB_FILE));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.get("/items", (req, res) => {
  res.json(items);
});

app.post("/items", upload.single("image"), (req, res) => {
  const { title, description, contact, location } = req.body;
  if (!title || !description || !contact) {
    return res.status(400).json({ error: "Missing required fields: title, description, contact." });
  }
  const imageUrl = req.file ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}` : "";
  const newItem = {
    id: String(Date.now()),
    title: String(title),
    description: String(description),
    contact: String(contact),
    location: String(location || ""),
    status: "active",
    imageUrl,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2));
  res.json(newItem);
});

// Update item status
app.patch("/items/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !["active", "resolved"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'active' or 'resolved'" });
  }
  
  const itemIndex = items.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found" });
  }
  
  items[itemIndex].status = status;
  items[itemIndex].updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2));
  res.json(items[itemIndex]);
});

// Error handler (for multer and others)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes("image files")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
