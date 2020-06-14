const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workflowSchema = new Schema({
  name: { type: Schema.Types.String, required: true },
  stages: [{ type: Schema.Types.String, required: true }],
  status: { type: Schema.Types.String, required: true },
  createdBy: { type: Schema.Types.ObjectId, required: true },
  users: [{ type: Schema.Types.ObjectId }]

})

module.exports = mongoose.model('workflow', workflowSchema, 'workflow');
