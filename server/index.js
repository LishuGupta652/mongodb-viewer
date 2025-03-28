import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let client = null;

app.get("/", (req, res) => {
  res.json({
    message: "server up"
  }).status(200);
})

app.post('/api/connect', async (req, res) => {
  try {
    const { mongoUrl } = req.body;
    
    // Close existing connection if any
    if (client) {
      await client.close();
    }

    client = new MongoClient(mongoUrl || process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    res.json({ collections: collections.map(col => col.name) });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Failed to connect to MongoDB' });
  }
});

app.get('/api/collections/:name', async (req, res) => {
  try {
    if (!client) {
      return res.status(400).json({ error: 'Not connected to MongoDB' });
    }

    const db = client.db();
    const collection = db.collection(req.params.name);
    const data = await collection.find({}).toArray();
    
    res.json({ data });
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch collection data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});