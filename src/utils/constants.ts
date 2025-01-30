export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
export const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/
export const BECRYPT_SALT_VALUE = 8

export const USER_PREVIEW_BODY = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  phoneNumber: true,
  isServiceProvider: true,
  token: true,
  refreshToken: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
}
