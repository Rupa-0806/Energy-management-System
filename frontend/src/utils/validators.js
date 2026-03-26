// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
export const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Check if field is empty
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
};

// Validate form field
export const validateField = (name, value, rules = {}) => {
  const errors = [];

  if (rules.required && isEmpty(value)) {
    errors.push(`${name} is required`);
  }

  if (rules.minLength && value && value.length < rules.minLength) {
    errors.push(`${name} must be at least ${rules.minLength} characters`);
  }

  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors.push(`${name} must not exceed ${rules.maxLength} characters`);
  }

  if (rules.email && !isEmpty(value) && !isValidEmail(value)) {
    errors.push(`${name} must be a valid email`);
  }

  if (rules.password && !isEmpty(value) && !isValidPassword(value)) {
    errors.push(`${name} must contain at least 8 characters, 1 uppercase, 1 number, and 1 special character`);
  }

  if (rules.min && value < rules.min) {
    errors.push(`${name} must be at least ${rules.min}`);
  }

  if (rules.max && value > rules.max) {
    errors.push(`${name} must not exceed ${rules.max}`);
  }

  if (rules.pattern && !isEmpty(value) && !rules.pattern.test(value)) {
    errors.push(`${name} format is invalid`);
  }

  return errors;
};

// Validate entire form
export const validateForm = (data, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const fieldErrors = validateField(field, data[field], schema[field]);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0]; // Store first error
    }
  });

  return errors;
};

// Check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).some(key => errors[key]);
};
