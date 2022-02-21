const monggose = require('mongoose');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./user');

const app = express();

monggose.connect(
  'mongodb+srv://root:root@cluster0.6ozxa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => console.log('connect to DataBASE')
);
//Start middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'code',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser('code'));
app.use(passport.initialize());
app.use(passport.session());
require('./passportUser')(passport);
//End middleware

//Start routing
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) throw err;
    if (!user) res.send('Username doest exist');
    else {
      req.login(user, (err) => {
        if (err) throw err;
        res.send('Successfully Login');
        console.log(req.user);
      });
    }
  })(req, res, next);
});
app.post('/register', (req, res) => {
  User.findOne({ username: req.body.username }, async (error, works) => {
    if (error) throw error;
    if (works) res.send('Username Already Exist');
    if (!works) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        password: hashPassword,
      });
      await newUser.save();
      res.send('User Created');
    }
  });
});
app.get('/user', (req, res) => {
  res.send(req.user);
});

//End routing
app.listen(4000, () => {
  console.log('Server Running on Port 4000');
});
