// Regex patterns for validation
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
export const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const URL_REGEX = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.+)*\/?$/;

// Password requirements description
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  description: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
}; 