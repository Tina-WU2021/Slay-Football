import express from 'express';
import { ObjectId } from 'mongodb';
import client from './dbclient.js';

const router = express.Router();
const db = client.db('SlayFootball');
const ticketsCollection = db.collection('tickets');

// 创建新票务记录
// router.post('/tickets', async (req, res) => {
//     try {
//         const {
//             eventId,
//             username,
//             userRole,
//             quantity,
//             seatNumbers,
//             ticketType,
//             totalPrice
//         } = req.body;

//         // 验证必要的字段
//         if (!eventId || !username || !userRole || !quantity || !ticketType || !totalPrice) {
//             return res.status(400).json({ message: 'Missing required fields' });
//         }

//         const ticket = {
//             username,
//             userRole,
//             eventId: new ObjectId(eventId),
//             quantity,
//             seatNumbers: seatNumbers || [],
//             ticketType,
//             totalPrice,
//             purchaseDate: new Date(),
//             status: 'active'
//         };

//         const result = await ticketsCollection.insertOne(ticket);
//         res.status(201).json({
//             message: 'Ticket booked successfully',
//             ticketId: result.insertedId
//         });
//     } catch (error) {
//         console.error('Error booking ticket:', error);
//         res.status(500).json({ message: 'Failed to book ticket' });
//     }
// });

router.post('/tickets', async (req, res) => {
  try {
    const { username, eventID, paidAmount, paidTime, venueName, TicketNO, seatPurchased } = req.body;

    // 验证必要的字段
    if (!username || !eventID || !paidAmount || !paidTime || !venueName || !TicketNO|| !seatPurchased) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ticket = {
        username, eventID, paidAmount, paidTime, venueName, TicketNO, seatPurchased
    };

    const result = await ticketsCollection.insertOne(ticket);
    res.status(201).json({
      message: 'Ticket booked successfully',
      ticketId: result.insertedId,
    });
  } catch (error) {
    console.error('Error booking ticket:', error);
    res.status(500).json({ message: 'Failed to book ticket' });
  }
});

// 获取用户的票务记录
router.get('/tickets/user/:username', async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const tickets = await ticketsCollection.find({ username }).sort({ purchaseDate: -1 }).toArray();

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

export default router;
