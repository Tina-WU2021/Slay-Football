import express from 'express';
import client from './dbclient.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
const db = client.db('SlayFootball');
const eventsCollection = db.collection('events');

// 创建新活动
router.post('/events', async (req, res) => {
    try {
        const { title, description, eventTime, venue } = req.body;
        
        // 生成区域信息
        const areas = [
            { id: 'A', name: 'Area A', price: 50, capacity: 100, available: 100 },
            { id: 'B', name: 'Area B', price: 75, capacity: 80, available: 80 },
            { id: 'C', name: 'Area C', price: 100, capacity: 60, available: 60 },
            { id: 'D', name: 'Area D', price: 150, capacity: 20, available: 20 }
        ];

        const event = {
            title,
            description,
            eventTime: new Date(eventTime),
            venue,
            areas,
            createdAt: new Date(),
            status: 'active'
        };

        const result = await eventsCollection.insertOne(event);
        res.status(201).json({ 
            message: '活动创建成功', 
            eventId: result.insertedId 
        });
    } catch (error) {
        console.error('创建活动错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取所有活动
router.get('/events', async (req, res) => {
    try {
        const events = await eventsCollection
            .find()
            .sort({ eventTime: 1 })
            .toArray();
        res.json(events);
    } catch (error) {
        console.error('获取活动列表错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取单个活动
router.get('/events/:id', async (req, res) => {
    try {
        const event = await eventsCollection.findOne({
            _id: new ObjectId(req.params.id)
        });
        
        if (!event) {
            return res.status(404).json({ message: '活动不存在' });
        }
        res.json(event);
    } catch (error) {
        console.error('获取活动详情错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新活动
router.put('/events/:id', async (req, res) => {
    try {
        const { title, description, eventTime, venue, areas } = req.body;
        
        const result = await eventsCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { 
                $set: {
                    title,
                    description,
                    eventTime: new Date(eventTime),
                    venue,
                    areas,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: '活动不存在' });
        }
        res.json({ message: '活动更新成功' });
    } catch (error) {
        console.error('更新活动错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 更新区域可用座位数
router.put('/events/:id/areas/:areaId', async (req, res) => {
    try {
        const { available } = req.body;
        
        const result = await eventsCollection.updateOne(
            { 
                _id: new ObjectId(req.params.id),
                'areas.id': req.params.areaId
            },
            { 
                $set: {
                    'areas.$.available': available
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: '活动或区域不存在' });
        }
        res.json({ message: '区域更新成功' });
    } catch (error) {
        console.error('更新区域错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除活动
router.delete('/events/:id', async (req, res) => {
    try {
        const result = await eventsCollection.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: '活动不存在' });
        }
        res.json({ message: '活动删除成功' });
    } catch (error) {
        console.error('删除活动错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

export default router; 