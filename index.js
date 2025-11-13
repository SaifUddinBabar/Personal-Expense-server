const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://expenseDB:aUtKioGKKgc5oqA9@cluster0.ifyaigl.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function connectDB() {
  try {
    await client.connect();
    const database = client.db("expenseDB");
const transactions = database.collection("data");

app.post('/data', async (req, res) => {
  try {
    const database = client.db("expenseDB");
    const transactions = database.collection("data");
    const result = await transactions.insertOne(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: 'Failed to insert data' });
  }
});

app.get('/data', async (req, res) => {
  try {
    const database = client.db("expenseDB");
    const transactions = database.collection("data");
    const data = await transactions.find().toArray();
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: 'Failed to fetch data' });
  }
});




    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

connectDB();

app.get('/', (req, res) => res.send('MongoDB connection active'));
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
