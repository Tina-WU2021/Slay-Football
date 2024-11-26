import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import login from './login.js';
import mongoStore from 'connect-mongo';
import client from './dbclient.js'; 
import eventRoutes from './events.js';
import ticketRoutes from './tickets.js';

const app = express();

app.use(
  session({
  secret: '21097724D_eie4432_lab5',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true },
  store: mongoStore.create({
  client,
  dbName: 'SlayFootball',
  collectionName: 'users',
  }),
  })
 );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/auth', login);
app.use('/api', eventRoutes);
app.use('/api', ticketRoutes);
app.use('/', express.static('static'));

app.get('/', (req, res) => {
  if (req.session.logged) {
    res.redirect('/index.html');
  } else {
    res.redirect('/index.html');
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
  console.log(now);
  console.log('Server started at http://127.0.0.1:8080');
});
