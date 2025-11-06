require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(xss());
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(rateLimit({ windowMs: 60*1000, max: 200 }));

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic_forms_final';
mongoose.set('strictQuery', true);
mongoose.connect(MONGO).then(()=>console.log('MongoDB connected')).catch(err=>{ console.error(err); process.exit(1); });

app.use('/admin', adminRoutes);
app.use('/', userRoutes);

// error pages
app.use((req,res)=>{ res.status(404).render('errors/404'); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
