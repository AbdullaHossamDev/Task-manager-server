const express = require('express');
const router = express.Router();

const Task = require('../model/task');
const Workflow = require('../model/workflow')

router.post('/save', (req, res) => {
  let { name, description, stage, startDate, workflowId, done, endDate } = req.body;
  if (!name || !description ) {
    res.status(400).send('Bad request');
  } else {
    createdAt = new Date();
    startDate = startDate ? startDate : createdAt;
    let task = new Task({ name, description, stage, startDate, createdAt, workflowId, createdBy: req.user._id, done, endDate });
    task.save((err, savedTask) => {
      if (err) {
        res.status(500).send('Internal server error');
      } else {
        res.status(200).json(savedTask);
      }
    })
  }
})

router.get('/get/:id', (req, res) => {
  let { id } = req.params;

  Task.findById(id, (err, task) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
      if (task) {
        task.creator = task.createdBy == req.user._id ? true : false;
      }
      res.status(200).json(task);
    }
  })
});

router.get('/get', (req, res) => {
  let createdBy = req.user._id;

  Task.aggregate(
    [
      {
        $lookup: {
          from: 'workflow',
          localField: 'workflowId',
          foreignField: '_id',
          as: 'workflowData',
        },
      },
      { $match: { createdBy: createdBy } }
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
    }
  )
});



router.put('/update', (req, res) => {
  let { _id: id, name, description, stage, startDate, endDate, done, workflowId} = req.body;
  if (!id || !name || !description) {
    res.status(400).send('Bad request');
  } else {
    Task.updateOne(
      { _id: id },
      { $set: {name, description, stage, startDate, endDate, done, workflowId} }, (err, updatedTask) => {
        if (err) {
          res.status(500).send('Internal server error');
        } else {
          res.status(200).json({msg:'Task updated successfully'})
        }
      }
    )
  }
})


router.delete('/delete/:id', (req, res) => {
  let { id: taskId } = req.params;
  Task.deleteOne({ _id: taskId }, (err, data) => {
    if (err) {
      res.status(500).send('Internal server error');
    } else {
      res.status(200).json({msg:'Task deleted successfully'})
    }
  })
})

module.exports = router;