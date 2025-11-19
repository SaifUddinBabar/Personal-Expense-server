// index.js
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();

// CORS
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB setup
const client = new MongoClient(process.env.MONGO_URI);

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    // Root route
    app.get("/", (req, res) => {
      res.send("🚀 Expense Tracker Server is Running...");
    });

    // Get all transactions (optionally filter by email)
    app.get("/data", async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { userEmail: email } : {};
        const transactions = await collection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(transactions);
      } catch (err) {
        res.status(500).send({ message: "Fetch failed", error: err.message });
      }
    });

    // Add transaction
    app.post("/data", async (req, res) => {
      try {
        const transaction = { ...req.body, createdAt: new Date() };
        const result = await collection.insertOne(transaction);
        res.status(201).send({ message: "Transaction added", data: result });
      } catch (err) {
        res.status(500).send({ message: "Add failed", error: err.message });
      }
    });

    // Get single transaction
    app.get("/data/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const transaction = await collection.findOne({ _id: new ObjectId(id) });
        if (!transaction) return res.status(404).send({ message: "Not Found" });
        res.send(transaction);
      } catch (err) {
        res.status(500).send({ message: "Fetch failed", error: err.message });
      }
    });

    // Update transaction
    app.put("/data/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updated }
        );
        const updatedDoc = await collection.findOne({ _id: new ObjectId(id) });
        res.send({ message: "Updated", data: updatedDoc });
      } catch (err) {
        res.status(500).send({ message: "Update failed", error: err.message });
      }
    });

    // Delete transaction
    app.delete("/data/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) return res.send({ message: "Deleted" });
        res.status(404).send({ message: "Not found" });
      } catch (err) {
        res.status(500).send({ message: "Delete failed", error: err.message });
      }
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

run();

// // Local server (optional, only for local dev)
// if (process.env.VERCEL !== "1") {
//   const port = process.env.PORT || 4000;
//   app.listen(port, () =>
//     console.log(`🚀 Local server running at http://localhost:${port}`)
//   );
// }

// Vercel serverless compatible
export default app;
