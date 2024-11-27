import express from 'express';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
const db = client.db('SlayFootball');
const seatsCollection = db.collection('seats');

//fetch seat data from database
router.get('/seats', async (req, res) => {
  console.log('this fetch function is called');
  try {
    const seats = await seatsCollection.find().sort({ eventTime: 1 }).toArray();
    res.json(seats);
  } catch (error) {
    console.error('failed to fetch venue seats list:', error);
    res.status(500).json({ message: 'server side error' });
  }
});

//create vanue seats
router.post('/seats', async (req, res) => {
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
    const result = await seatsCollection.insertOne(filteredVenueSeatData);
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

//delete
router.delete('/seats/:id', async (req, res) => {
  try {
    const result = await seatsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'venue does not exist' });
    }
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error('Error when deleting venue:', error);
    res.status(500).json({ message: 'server error' });
  }
});

//update
router.put('/seats/:id', async (req, res) => {
  try {
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
    
    const result = await seatsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set:  filteredVenueSeatData  }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Venue does not exist' });
    }
    res.json({ message: 'Venue succefully update' });
  } catch (error) {
    console.error('Fail to update venue:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
