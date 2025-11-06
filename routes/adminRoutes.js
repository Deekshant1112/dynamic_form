const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const Submission = require("../models/Submission");
const adminAuth = require("../middleware/adminAuth");

router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});
router.post("/login", (req, res) => {
  const token = req.body.token;
  if (!token || token !== process.env.ADMIN_TOKEN)
    return res.render("admin/login", { error: "Invalid token" });
  res.cookie("admin_token", token, { httpOnly: true });
  res.redirect("/admin");
});

router.get("/", adminAuth, async (req, res, next) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    const totalForms = forms.length;
    const submissionsCount = await Submission.countDocuments();
    res.render("admin/dashboard", { forms, totalForms, submissionsCount });
  } catch (err) {
    next(err);
  }
});

router.get("/forms/create", adminAuth, (req, res) => {
  res.render("admin/create", { form: null, error: null });
});
router.post("/forms/create", adminAuth, async (req, res, next) => {
  try {
    const { title, description, fieldsJson } = req.body;
    const fields =
      fieldsJson && fieldsJson.trim() ? JSON.parse(fieldsJson) : [];
    const names = fields.map((f) => f.name);
    if (new Set(names).size !== names.length)
      return res.render("admin/create", {
        form: null,
        error: "Field names must be unique",
      });
    const form = new Form({ title, description, fields });
    await form.save();
    res.redirect("/admin");
  } catch (err) {
    next(err);
  }
});

router.get("/forms/:id/edit", adminAuth, async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.redirect("/admin");
    res.render("admin/edit", { form, error: null });
  } catch (err) {
    next(err);
  }
});
router.post("/forms/:id/edit", adminAuth, async (req, res, next) => {
  try {
    const { title, description, fieldsJson } = req.body;
    const fields =
      fieldsJson && fieldsJson.trim() ? JSON.parse(fieldsJson) : [];
    const names = fields.map((f) => f.name);
    if (new Set(names).size !== names.length)
      return res.render("admin/edit", {
        form: { _id: req.params.id, title, description, fields },
        error: "Field names must be unique",
      });
    const form = await Form.findById(req.params.id);
    if (!form) return res.redirect("/admin");
    form.title = title;
    form.description = description;
    form.fields = fields;
    form.version = (form.version || 1) + 1;
    await form.save();
    res.redirect("/admin");
  } catch (err) {
    next(err);
  }
});

router.post("/forms/:id/delete", adminAuth, async (req, res, next) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  } catch (err) {
    next(err);
  }
});

router.get("/forms/:id/fields", adminAuth, async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.redirect("/admin");
    res.render("admin/fields", { form });
  } catch (err) {
    next(err);
  }
});

router.post("/forms/:id/fields/add", adminAuth, async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.redirect("/admin");
    const { label, type, name, required, order } = req.body;
    const field = {
      label,
      type,
      name,
      required: required === "on",
      order: Number(order || 0),
    };
    if (req.body.optionsJson && req.body.optionsJson.trim())
      field.options = JSON.parse(req.body.optionsJson);
    form.fields.push(field);
    await form.save();
    res.redirect(`/admin/forms/${form._id}/fields`);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/forms/:id/fields/:index/delete",
  adminAuth,
  async (req, res, next) => {
    try {
      const idx = Number(req.params.index);
      const form = await Form.findById(req.params.id);
      if (!form) return res.redirect("/admin");
      form.fields.splice(idx, 1);
      await form.save();
      res.redirect(`/admin/forms/${form._id}/fields`);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/forms/:id/fields/:index/move",
  adminAuth,
  async (req, res, next) => {
    try {
      const dir = req.body.direction;
      const idx = Number(req.params.index);
      const form = await Form.findById(req.params.id);
      if (!form) return res.redirect("/admin");
      const fields = form.fields || [];
      if (dir === "up" && idx > 0) {
        const tmp = fields[idx - 1];
        fields[idx - 1] = fields[idx];
        fields[idx] = tmp;
      }
      if (dir === "down" && idx < fields.length - 1) {
        const tmp = fields[idx + 1];
        fields[idx + 1] = fields[idx];
        fields[idx] = tmp;
      }
      fields.forEach((f, i) => (f.order = i + 1));
      form.fields = fields;
      await form.save();
      res.redirect(`/admin/forms/${form._id}/fields`);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/forms/:id/submissions", adminAuth, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ formId: req.params.id }).sort({
      submittedAt: -1,
    });
    res.render("admin/submissions", { submissions });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/forms/:id/submissions/:sid/delete",
  adminAuth,
  async (req, res, next) => {
    try {
      await Submission.findByIdAndDelete(req.params.sid);
      res.redirect(`/admin/forms/${req.params.id}/submissions`);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
