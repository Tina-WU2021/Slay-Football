import express from 'express';
import { ObjectId } from 'mongodb';
import client from './dbclient.js';

const router = express.Router();
const db = client.db('SlayFootball');
const ticketRecordCollection = db.collection('ticketRecord');

router.post('/ticketRecord', async (req, res) => {
  try {
    const { username, eventID, paidAmount, paidTime, venueName, TicketNO, seatArea, seatPurchased } = req.body;

    if (!username || !eventID || !paidAmount || !paidTime || !venueName || !TicketNO || !seatArea || !seatPurchased) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ticket = {
      username,
      eventID,
      paidAmount,
      paidTime,
      venueName,
      TicketNO,
      seatPurchased,
    };

    const result = await ticketRecordCollection.insertOne(ticket);
    res.status(201).json({
      message: 'Ticket booked successfully',
      ticketId: result.insertedId,
    });
  } catch (error) {
    console.error('Error booking ticket:', error);
    res.status(500).json({ message: 'Failed to book ticket' });
  }
});

//get tickets data
router.get('/ticketRecord', async (req, res) => {
  console.log('this fetch function is called');
  try {
    const ticket = await ticketRecordCollection.find().sort({ eventTime: 1 }).toArray();
    res.json(ticket);
  } catch (error) {
    console.error('failed to fetch ticketRecordCollection:', error);
    res.status(500).json({ message: 'server side error' });
  }
});

//get ticket data by username
router.get('/ticketRecord/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const tickets = await ticketRecordCollection.find({ username }).sort({ purchaseDate: -1 }).toArray();

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});


export default router;
