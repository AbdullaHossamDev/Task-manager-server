const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  name: { type: Schema.Types.String, required: true },
  description: { type: Schema.Types.String, required: true },
  createdAt: { type: Schema.Types.Date, required: true },
  startDate: { type: Schema.Types.Date, required: true },
  endDate: { type: Schema.Types.String },
  stage: { type: Schema.Types.String },
  workflowId: { type: Schema.Types.ObjectId},
  createdBy: { type: Schema.Types.ObjectId, required: true },
  done: {type: Schema.Types.Boolean, default: false, }
})

module.exports = mongoose.model('task', taskSchema, 'task');
