const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Submission = require('../models/Submission');
const { validateForm } = require('../utils/validate');

router.get('/', async (req,res,next)=>{ try{ const forms = await Form.find({}, { title:1, description:1 }).sort({ createdAt:-1 }); res.render('public/index', { forms }); } catch(err){ next(err); } });

router.get('/about', (req,res)=>{ res.render('public/about'); });
router.get('/contact', (req,res)=>{ res.render('public/contact'); });

router.get('/forms/:id', async (req,res,next)=>{ try{ const form = await Form.findById(req.params.id); if(!form) return res.status(404).render('errors/404'); res.render('public/form', { form, errors:null, values:{}, success:false }); } catch(err){ next(err); } });

router.post('/forms/:id/submit', async (req,res,next)=>{ try{ const form = await Form.findById(req.params.id); if(!form) return res.status(404).render('errors/404'); const answers = req.body || {}; const { valid, errors } = validateForm(form, answers); if (!valid) return res.render('public/form', { form, errors, values: answers, success:false }); const submission = new Submission({ formId: form._id, formVersion: form.version||1, answers, metadata:{ ip:req.ip, userAgent:req.get('User-Agent')||'' } }); await submission.save(); res.render('public/form', { form, errors:null, values:{}, success:true }); } catch(err){ next(err); } });

module.exports = router;
