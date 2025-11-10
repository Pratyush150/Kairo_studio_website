/**
 * Form Validation Utilities
 * RFC5322-compliant email validation and form field validators
 */

// RFC5322 Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

// E.164 Phone validation (optional formatting)
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
};

// File validation
export const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  const maxSize = maxSizeMB * 1024 * 1024;
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF, PNG, and JPG files are allowed' };
  }

  return { valid: true };
};

// Validate total files size
export const validateTotalFilesSize = (files: File[], maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const maxSize = maxSizeMB * 1024 * 1024;

  if (totalSize > maxSize) {
    return { valid: false, error: `Total file size must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

// Form field validators
export const validators = {
  required: (value: string, fieldName: string = 'Field'): string | null => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string = 'Field'): string | null => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string = 'Field'): string | null => {
    if (value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!validateEmail(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (value && !validatePhone(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },
};

// Compose multiple validators
export const composeValidators = (...validatorFns: Array<(value: string) => string | null>) => {
  return (value: string): string | null => {
    for (const validator of validatorFns) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};
