import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { fetch_user, username_exist, update_user, validate_user } from './userdb.js';

const users = new Map();

// async function init_userdb() {
//   if (users.size !== 0) {
//     return;
//   }

//   try {
//     const data = await fs.readFile('users.json', 'utf-8');
//     const userData = JSON.parse(data);

//     console.log('userData', userData);
//     userData.forEach((user) => {
//       users.set(user.username, user);
//     });
//   } catch (error) {
//     console.error('Error reading user database:', error);
//   }
// }

// async function validate_user(username, password) {
//   const user = users.get(username);
//   console.log('users', users, 'username', username, 'user', user);
//   if (!user || user.password !== password) {
//     return false;
//   }

//   return {
//     username: user.username,
//     role: user.role,
//     enabled: user.enabled,
//   };
// }

// async function update_user(username, password, role) {
//   var userjson = new Array();
//   fs.readFile('users.json', 'utf-8')
//     .then((data) => {
//       if (users.size == 0) {
//         var usersData = JSON.parse(data);
//         for (const i in usersData) {
//           users.set(usersData[i].username, usersData[i]);
//         }
//       } else {
//         users.set(username, {
//           username: username,
//           password: password,
//           role: role,
//           enabled: true,
//         });
//         users.forEach((value, key) => {
//           userjson.push(value);
//         });
//         fs.writeFile('users.json', JSON.stringify(userjson), (err) => {
//           if (err) {
//             return false;
//           } else return true;
//         });
//       }
//     })
//     .catch((err) => {
//       console.error('error', err);
//     });
// }

const route = express.Router();
const form = multer();

route.post('/login', form.none(), async (req, res) => {
  // await init_userdb();

  if (req.session.logged) {
    req.session.logged = false;
  }
  console.log('req.body', req.body);
  const { username, password } = req.body;
  const user = await validate_user(username, password);
  console.log('user', user);

  if (user) {
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.logged = true;
    // req.session.timestamp = Date.now();
    return res.json({
      status: 'success',
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Incorrect username and password',
    });
  }
});

route.post('/logout', (req, res) => {
  if (req.session.logged) {
    req.session.destroy(() => {
      return res.end();
    });
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
});

route.post('/register', form.none(), async (req, res) => {
  if (users.size == 0) {
    // init_userdb();
  }
  console.log(req.body);
  if (req.body.password && req.body.username) {
    if (req.body.username.length < 3) {
      const data = {
        status: 'failed',
        message: 'Username must be at least 3 characters',
      };
      return res.status(400).json(data);
    }
    if (username_exist(req.body.username)) {
      const data = {
        status: 'failed',
        message: 'Username ' + req.body.username + ' already exsits',
      };
      return res.status(400).json(data);
    }
    if (req.body.password.length < 8) {
      const data = {
        status: 'failed',
        message: 'Password must be at least 8 characters',
      };
      return res.status(400).json(data);
    }
    if (req.body.roleOption === 'student' || req.body.roleOption === 'user') {
      update_user(req.body.username, req.body.password, req.body.roleOption);
      const data = {
        status: 'success',
        user: { username: req.body.username, role: req.body.roleOption },
      };
      return res.status(200).json(data);
    } else {
      const data = {
        status: 'failed',
        message: 'Role can only be either `student` or `user`',
      };
      return res.status(400).json(data);
    }
  } else {
    const data = {
      status: 'failed',
      message: 'Missing fields',
    };
    return res.status(400).json(data);
  }
});

route.get('/me', (req, res) => {
  if (req.session.logged) {
    // var user = fetch_user(req.body.username);

    return res.json({
      status: 'success',
      user: {
        username: req.session.username,
        role: req.session.role,
      },
    });
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized',
    });
  }
});

export default route;
