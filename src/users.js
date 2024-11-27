import express from 'express';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
const db = client.db('SlayFootball');
const userCollection = db.collection('users');

//fetch user data from database
router.get('/users', async (req, res) => {
  try {
    const user = await userCollection.find().sort({ eventTime: 1 }).toArray();
    res.json(user);
  } catch (error) {
    console.error('failed to fetch users:', error);
    res.status(500).json({ message: 'server side error' });
  }
});

export default router;