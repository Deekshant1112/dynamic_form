require('dotenv').config();
const mongoose = require('mongoose');
const Form = require('../models/Form');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic_forms_complete';
mongoose.set('strictQuery', true);

async function seed(){
  await mongoose.connect(MONGO);
  await Form.deleteMany({});
  const sample = new Form({
    title: 'Contact Us (Seed)',
    description: 'Sample contact form',
    fields: [
      { label: 'Full name', type: 'text', name: 'fullName', required: true, order: 1 },
      { label: 'Email', type: 'email', name: 'email', required: true, order: 2 },
      { label: 'Phone', type: 'text', name: 'phone', required: false, order: 3 },
      { label: 'How did you hear?', type: 'select', name: 'refSource', required: false, options:[
        { value: 'web', label: 'Web' },
        { value: 'friend', label: 'Friend', nestedFields: [{ label: 'Friend name', type: 'text', name:'friendName', required:false }] }
      ], order: 4 }
    ]
  });
  await sample.save();
  console.log('Seeded form id=', sample._id.toString());
  process.exit(0);
}

seed().catch(err=>{ console.error(err); process.exit(1); });
