function validateAgainstField(field, value) {
  const errors = [];
  if ((value === undefined || value === null || value === '') && field.required) {
    errors.push('Field is required');
    return errors;
  }
  if (value === undefined || value === null || value === '') return errors;

  switch (field.type) {
    case 'number': {
      const n = Number(value);
      if (Number.isNaN(n)) errors.push('Must be a number');
      else {
        if (field.validation?.min !== undefined && n < field.validation.min) errors.push(`Must be >= ${field.validation.min}`);
        if (field.validation?.max !== undefined && n > field.validation.max) errors.push(`Must be <= ${field.validation.max}`);
      }
      break;
    }
    case 'email':
      if (!/^\S+@\S+\.\S+$/.test(String(value))) errors.push('Must be a valid email');
      break;
    case 'text':
    case 'textarea':
      if (field.validation?.regex) {
        const re = new RegExp(field.validation.regex);
        if (!re.test(String(value))) errors.push('Invalid format');
      }
      if (field.validation?.min !== undefined && String(value).length < field.validation.min) errors.push(`Must be at least ${field.validation.min} chars`);
      if (field.validation?.max !== undefined && String(value).length > field.validation.max) errors.push(`Must be at most ${field.validation.max} chars`);
      break;
    case 'date':
      if (isNaN(Date.parse(String(value)))) errors.push('Invalid date');
      break;
    case 'radio':
    case 'select':
      if (field.options && field.options.length) {
        const allowed = field.options.map(o => String(o.value));
        if (!allowed.includes(String(value))) errors.push('Invalid option selected');
      }
      break;
  }
  return errors;
}

function validateForm(form, answers) {
  const errors = {};
  for (const field of form.fields || []) {
    const val = answers[field.name];
    const fErr = validateAgainstField(field, val);
    if (fErr.length) errors[field.name] = fErr.join('; ');
    if ((field.type === 'radio' || field.type === 'select') && field.options) {
      const chosen = field.options.find(o => String(o.value) === String(val));
      if (chosen && chosen.nestedFields) {
        for (const nf of chosen.nestedFields) {
          const nv = answers[nf.name];
          const ne = validateAgainstField(nf, nv);
          if (ne.length) errors[nf.name] = ne.join('; ');
        }
      }
    }
  }
  return { valid: Object.keys(errors).length===0, errors };
}

module.exports = { validateForm };
