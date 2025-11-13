const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("expenseDB");
    const usersCollection = database.collection("data");

   app.get('/', (req, res) => {
      res.send('Server is running...');
    });

    app.post('/data', async (req, res) => {
      try {
        const transaction = { ...req.body, createdAt: new Date() };
        const result = await usersCollection.insertOne(transaction);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Failed to add transaction", error: err });
      }
    });

    app.get('/data', async (req, res) => {
      try {
        const email = req.query.email;
        const query = email ? { userEmail: email } : {};
        const transactions = await usersCollection.find(query).sort({ createdAt: -1 }).toArray();
        res.send(transactions);
      } catch (err) {
        res.status(500).send({ message: "Failed to fetch transactions", error: err });
      }
    });

    app.get('/transaction/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const transaction = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!transaction) return res.status(404).send({ message: "Transaction not found" });
        res.send(transaction);
      } catch (err) {
        res.status(500).send({ message: "Error fetching transaction", error: err });
      }
    });

    app.put('/transaction/update/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updated = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            type: updated.type,
            description: updated.description,
            category: updated.category,
            amount: updated.amount,
            date: updated.date,
          },
        };
        await usersCollection.updateOne(filter, updateDoc);
        const updatedDoc = await usersCollection.findOne(filter);
        res.send({ message: "Updated successfully", data: updatedDoc });
      } catch (err) {
        res.status(500).send({ message: "Update failed", error: err });
      }
    });

    app.delete("/data/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
        result.deletedCount === 1
          ? res.send({ message: "Deleted successfully" })
          : res.status(404).send({ message: "Transaction not found" });
      } catch (err) {
        res.status(500).send({ message: "Delete failed", error: err });
      }
    });

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
