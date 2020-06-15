const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Workflow = require('../model/workflow');

router.post('/save', (req, res) => {
  let { name, stages, status, users } = req.body;

  if (!name || !stages || !status) {
    res.status(400).send('Bad request');
  } else {
    if (users) {
      users.push(req.user._id)
    } else {
      users = [req.user._id]
    }
    let workflow = new Workflow({ name, stages, status, createdBy: req.user._id, users });
    workflow.save((err, savedWorkflow) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(200).json({savedWorkflow, msg: 'Workflow added successfully'});
      }
    })
  }
});

router.get('/getAll', (req, res) => {
  let userId = req.user._id;
  Workflow.aggregate(
    [{
      $lookup: {
        from: 'user',
        let: { workflowUsers: '$users' },
        as: 'usersData',
        pipeline: [
          { $match: { $expr: { $in: ["$_id", "$$workflowUsers"] } } },
          { $project: { password: 0 } }
        ]
      },
    },
    { $match: { $or: [{ users: userId }, { status: 'public' }] } },
    ],
    (err, data) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        if (data) {
          res.status(200).send(data);
        } else {
          res.status(200).send([]);
        }
      }
    })
})

router.get('/get/:id', (req, res) => {
  let { id } = req.params;
  Workflow.aggregate(
    [
      {
        $lookup: {
          from: 'user',
          let: { workflowUsers: '$users' },
          as: 'usersData',
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$workflowUsers"] } } },
            { $project: { password: 0 } }
          ]
        },
      },
      {
        $lookup: {
          from: 'task',
          let: { workflowId: '$_id' },
          as: 'taskData',
          pipeline:[
            { $match: { $expr: { $eq: ["$workflowId", "$$workflowId"] } } },
            {
              $lookup:{
                from: 'user',
                let: {createdBy: '$createdBy'},
                as: 'creator',
                pipeline:[
                  { $match: { $expr: { $eq: ["$_id", "$$createdBy"] } } },
                  { $project: { password: 0}}
                ]
              }
            }
          ]

        },
      },
      { $match: { $and: [{_id: mongoose.Types.ObjectId(id.toString()) }, { $expr: { $in: [req.user._id, "$users"] } } ]   } },
    ],
    (err, data) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        if (data) {
          res.status(200).send(data);
        } else {
          res.status(200).send([]);
        }
      }
    })
})

router.put('/update', (req, res) => {
  let { _id, name, stages, status, createdBy, users } = req.body;
  if (createdBy != req.user._id) {
    return res.status(401).send('Unauthorized request');
  }
  if (!name || !stages || !status) {
    res.status(400).send('Bad request');
  } else {
    if (users) {
      users.push(req.user._id)
    } else {
      users = [req.user._id]
    }
    Workflow.update(
      { _id },
      { $set: { name, stages, status, users } }, (err, updatedWorkflow) => {
        if (err) {
          res.status(500).send('Internal server error');
        } else {
          res.status(200).json({msg:'Workflow updated successfully'})
        }
      }
    )
  }
})

router.delete('/delete/:id', (req, res) => {
  let { id: workflowId } = req.params;
  Workflow.deleteOne({ _id: workflowId }, (err) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
      res.status(200).json({msg:'Workflow deleted successfully'})
    }
  })
})



module.exports = router;