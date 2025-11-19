// index.js
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const app = express();

// Middleware
app.use(cors());
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

    // 🌟 ফিক্সড: কেস-সেনসিটিভিটি সমস্যার সমাধান
    app.get("/data", async (req, res) => {
      try {
        const email = req.query.email;
        
        // 🚨 ফিক্স: ইনকামিং ইমেলটিকে ছোট হাতের অক্ষরে পরিবর্তন করা হলো
        const lowercaseEmail = email ? email.toLowerCase() : null; 
        
        // query অবজেক্টে lowercaseEmail ব্যবহার করা হচ্ছে
        const query = lowercaseEmail ? { userEmail: lowercaseEmail } : {};
        
        // console.log("Searching with query:", query); // ডিবাগিং এর জন্য রাখতে পারেন
        
        const transactions = await collection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(transactions);
      } catch (err) {
        console.error("Fetch failed:", err);
        res.status(500).send({ message: "Fetch failed", error: err.message });
      }
    });

    // Add transaction
    app.post("/data", async (req, res) => {
      try {
        // 💡 পরামর্শ: এখানেও userEmail কে lowercase করে সেভ করা উচিত
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

// Railway auto assigns PORT
const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);