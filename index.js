const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://expenseDB:aUtKioGKKgc5oqA9@cluster0.ifyaigl.mongodb.net/?appName=Cluster0";
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

    // ✅ Add
    app.post('/data', async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });

    // ✅ Get All
    app.get('/data', async (req, res) => {
      const transactions = await usersCollection.find().toArray();
      res.send(transactions);
    });

    // ✅ Delete
    app.delete("/data/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      result.deletedCount === 1
        ? res.send({ message: "Deleted successfully" })
        : res.status(404).send({ message: "Not found" });
    });

    // ✅ Update
    app.put("/data/:id", async (req, res) => {
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

        const result = await usersCollection.updateOne(filter, updateDoc);
        const updatedDoc = await usersCollection.findOne(filter);

        res.send({ message: "Updated successfully", data: updatedDoc });
      } catch (err) {
        res.status(500).send({ message: "Update failed", error: err });
      }
    });

    console.log("✅ MongoDB Connected");
  } finally {}
}

run().catch(console.dir);

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
