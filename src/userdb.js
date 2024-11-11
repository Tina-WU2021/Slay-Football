import fs from 'fs/promises';
import client from './dbclient.js';

async function init_db() {
  try {
    const users = client.db('SlayFootball').collection('users');
    const count = await users.countDocuments();
    if (count === 0) {
      const data = await fs.readFile('users.json', 'utf-8');
      const temp = JSON.parse(data);

      const result = await users.insertMany(temp);
      console.log('Added ' + result.insertedCount + ' users');
    }
  } catch (err) {
    console.error('Unable to initialize the database!');
  }
}

init_db().catch(console.dir);
console.log('Database initialized');

async function validate_user(username, password) {
  if (username === '' || password === '') {
    return false;
  }

  try {
    const usersCollection = client.db('SlayFootball').collection('users');

    const user = await usersCollection.findOne({ username: username });

    if (!user) {
      return false;
    }

    const storedPassword = user.password;

    if (storedPassword !== password) {
      return false;
    }

    return user;
  } catch (error) {
    console.error('Unable to fetch from database!', error);
    return false;
  }
}

async function update_user(username, password, role) {
  const users = client.db('SlayFootball').collection('users');

  try {
    const result = await users.updateOne(
      { username: username },
      { $set: { username: username, password: password, role: role, enabled: enabled } },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log('Added 1 user');
    } else {
      console.log('Added 0 user');
    }

    return true;
  } catch (err) {
    console.error('Unable to update the database!', err);
    return false;
  }
}
async function fetch_user(username) {
  const users = client.db('SlayFootball').collection('users');
  try {
    const data = await users.findOne({ username: username });
    // console.log('data', data);
    return data;
  } catch (error) {
    console.error('Unable to fetch from database!', error);
    throw error;
  }
}

async function username_exist(username) {
  try {
    //   console.log('username',username)
    const user = await fetch_user(username);
    //   console.log('user',user)
    return user !== null && user !== undefined;
  } catch (error) {
    console.error('Unable to fetch from database!', error);
    return false;
  }
}
export { fetch_user, username_exist, update_user, validate_user };
