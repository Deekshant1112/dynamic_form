const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formVersion: { type: Number, required: true },
  answers: { type: mongoose.Schema.Types.Mixed, required: true },
  metadata: {
    ip: String,
    userAgent: String
  },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
