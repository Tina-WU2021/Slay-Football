import { MongoClient, ServerApiVersion } from 'mongodb';
import config from '../src/config.js';

const connect_uri = config.CONNECTION_STR;
const client = new MongoClient(connect_uri, {
    connectTimeoutMS: 2000,
    serverSelectionTimeoutMS: 2000,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function createAdminUser() {
    try {
        // 连接数据库
        await client.connect();
        await client.db('SlayFootball').command({ ping: 1 });
        console.log('Successfully connected to the database!');

        const db = client.db('SlayFootball');
        const users = db.collection('users');

        // 检查是否已存在管理员账户
        const existingAdmin = await users.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // 创建管理员账户
        const adminUser = {
            username: 'admin',
            password: 'admin',
            role: 'admin',
            createdAt: new Date()
        };

        const result = await users.insertOne(adminUser);
        console.log('Admin user created successfully:', result.insertedId);

    } catch (error) {
        console.error('Unable to establish connection to the database!', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

createAdminUser().catch(console.dir); 