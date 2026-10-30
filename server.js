require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Configure MySQL using environment variables
const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "default_user",
  password: process.env.MYSQL_PASSWORD || "default_password",
  database: process.env.MYSQL_DB || "default_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize the database table

async function initDB() {
  // Verify MySQL connection
  await db.query("SELECT 1");

  console.log("MySQL database connected successfully");

  // Create the messages table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message TEXT
    )
  `);

  console.log("Messages table is ready");
}





// Health check route for Jenkins deployment verification
app.get("/api/health", async (req, res) => {
  try {
    // Verify that the application can connect to MySQL
    await db.query("SELECT 1");

    res.status(200).json({
      status: "healthy",
      message: "Backend and database are working",
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      status: "unhealthy",
      message: "Database connection failed",
    });
  }
});


// Home route: fetch and display messages
app.get("/", async (req, res) => {
  try {
    const [messages] = await db.execute(
      "SELECT message FROM messages"
    );

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Message Application</title>
      </head>
      <body>
        <h1>Messages-v3</h1>

        <form action="/submit" method="POST">
          <input
            type="text"
            name="new_message"
            placeholder="Enter a message"
            required
          />
          <button type="submit">Submit</button>
        </form>

        <ul>
          ${messages.map(({ message }) =>
            `<li>${escapeHTML(message || "")}</li>`
          ).join("")}
        </ul>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);

    res.status(500).send("Failed to load messages to screen");
  }
});

// Submit route: insert a new message
app.post("/submit", async (req, res) => {
  const newMessage = req.body.new_message;

  if (typeof newMessage !== "string" || !newMessage.trim()) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  try {
    await db.execute(
      "INSERT INTO messages (message) VALUES (?)",
      [newMessage.trim()]
    );

    res.json({ message: newMessage.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to save message",
    });
  }
});

// Escape user-provided text before displaying it as HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

// Start the server after database initialization
initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
