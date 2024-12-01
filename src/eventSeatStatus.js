import express from 'express';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
const db = client.db('SlayFootball');
const eventSeatStatusCollection = db.collection('eventSeatStatus');

//fetch seat data from database
router.get('/eventSeatStatus', async (req, res) => {
  console.log('this fetch function is called');
  try {
    const eventSeats = await eventSeatStatusCollection.find().sort({ eventTime: 1 }).toArray();
    res.json(eventSeats);
  } catch (error) {
    console.error('failed to fetch eventSeatStatus:', error);
    res.status(500).json({ message: 'server side error' });
  }
});

//create vanue seats
router.post('/eventSeatStatus', async (req, res) => {
  console.log('entered api create vanue');
  try {
    console.log('req.body:', req.body);
    const { venueName, venuePic, areaList, areaA = null, areaB = null, areaC = null, areaD = null } = req.body;

    const seat = {
      venueName,
      venuePic,
      areaList,
      areaA,
      areaB,
      areaC,
      areaD,
    };
    const filteredVenueSeatData = Object.fromEntries(Object.entries(seat).filter(([_, value]) => value != null));
    console.log('filteredVenueSeatData', filteredVenueSeatData);
    const result = await eventSeatStatusCollection.insertOne(filteredVenueSeatData);
    console.log('Insert Result:', result);
    res.status(201).json({
      message: 'create venue success',
      result: result,
    });
  } catch (error) {
    console.error('cannot create venue:', error);
    res.status(500).json({ message: 'server error' });
  }
});

//update
router.put('/eventSeatStatus/:id', async (req, res) => {
  try {
    const {
      eventID,
      eventName,
      eventTime,
      venueName,
      areaList,
      areaA = null,
      areaB = null,
      areaC = null,
      areaD = null,
    } = req.body;
    const updatData = {
      eventID,
      eventName,
      eventTime,
      venueName,
      areaList,
      areaA,
      areaB,
      areaC,
      areaD,
    };
    const filteredUpdatData = Object.fromEntries(Object.entries(updatData).filter(([_, value]) => value != null));
    console.log('filteredVenueSeatData', filteredUpdatData);

    const result = await eventSeatStatusCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: filteredUpdatData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'eventSeatStatus does not exist' });
    }
    res.json({ message: 'eventSeatStatus successfully updated', id: req.params.id });
  } catch (error) {
    console.error('Fail to update venue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
