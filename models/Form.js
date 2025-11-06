const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  nestedFields: [{ type: mongoose.Schema.Types.Mixed }]
}, { _id: false });

const FieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, required: true, enum: ['text','textarea','number','email','date','checkbox','radio','select','file'] },
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [OptionSchema],
  validation: { min: Number, max: Number, regex: String },
  order: { type: Number, default: 0 }
}, { _id: false });

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fields: [FieldSchema],
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

FormSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Form', FormSchema);
