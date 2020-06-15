const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/user');

router.post('/register', (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).send('Bad request');
  }
  else {
    password = bcrypt.hashSync(password, 10);
    let user = new User({ name, email, password });
    user.save((err, registerUser) => {
      if (err) {
        if (err.code == 11000) {
          res.status(409).send('The email is already exsit');
        } else {
          res.status(500).send('Internal server error');
        }
      } else {
        let payload = { subject: registerUser._id }
        let token = jwt.sign(payload, 'secretKey')
        res.status(200).send({ token, id: registerUser._id, name: registerUser.name });
      }
    });
  }
});

router.post('/login', (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send('Bad request');
  }
  else {
    User.findOne({ email }, (err, user) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        if (user) {
          if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Invalid password');
          }
          let payload = { subject: user._id }
          let token = jwt.sign(payload, 'secretKey')
          res.status(200).send({ token, id: user._id, name: user.name });
        } else {
          res.status(401).send('Invalid email');
        }
      }
    });
  }
});

router.put('/update', verifyToken, (req, res) => {
  let { name, email, password } = req.body;

  name = name ? name : req.user.name;
  email = email ? email : req.user.email;
  password = password ? bcrypt.hashSync(password, 10): undefined;

  let user = req.user;

  User.update(
    { _id: user._id },
    { $set: { name, email, password } }, (err, updatedUser) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(200).json({msg: 'User updated successfully'});
      }
    }
  )

})

router.get('/getAll',verifyToken, (req, res) => {
  User.aggregate(
    [
      { $project: { password: 0 } },
      { $match: {$expr: { $ne: ["$_id", req.user._id]}}}
    ], (err, data) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        if (data) {
          res.status(200).send(data);
        } else {
          res.status(200).send([]);
        }
      }
    }
  )
})

router.get('/user', verifyToken, (req, res) => {
  res.status(200).json(req.user);
})

router.delete('/delete', verifyToken, (req, res) => {
  const userId = req.user._id;

  User.deleteOne({_id: userId},(err, data)=> {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
        // res.status(200).send('Deleted successfully');
        res.status(200).json({msg:'User deleted successfully'})
    }   
  })
})

module.exports = router;

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