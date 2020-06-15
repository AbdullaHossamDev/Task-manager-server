const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = 3000;

const User = require('./model/user');

const userRoutes = require('./routes/user');
const workflowRoutes = require('./routes/workflow');
const TaskRoutes = require('./routes/task');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/workflow', verifyToken, workflowRoutes);
app.use('/task', verifyToken, TaskRoutes);


app.listen(port, () => console.log(`Server running on port ${port}`));


const mongoose = require('mongoose');
// const db = "mongodb+srv://admin:admin@cluster-ziv9l.mongodb.net/TasksManagerDB?retryWrites=true&w=majority"
var db = ''
// process.env.ENV = 'Test';
if (process.env.ENV == 'Test') {
  db = "mongodb+srv://admin:admin@cluster-ziv9l.mongodb.net/TasksManagerDB_test?retryWrites=true&w=majority"
}
else {
  db = "mongodb+srv://admin:admin@cluster-ziv9l.mongodb.net/TasksManagerDB?retryWrites=true&w=majority"
}
mongoose.connect(db, err => {
  if (err) {
    console.error('Error! ', err);
  } else {
    console.log('connected to mongodb');
  }
});


function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1];
  if (token === 'null') {
    return res.status(401).send('Unauthorized request')
  }
  let payload = jwt.verify(token, 'secretKey');
  if (!payload) {
    return res.status(401).send('Unauthorized request')
  }
  let userId = payload.subject;
  User.findOne({ _id: userId }, (err, user) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).send('Destroyed token');
      }
    }
  });
}

module.exports = app;
