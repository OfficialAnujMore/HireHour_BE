"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BECRYPT_SALT_VALUE = exports.USERNAME_REGEX = exports.PASSWORD_REGEX = exports.EMAIL_REGEX = void 0;
exports.EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
exports.PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
exports.USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
exports.BECRYPT_SALT_VALUE = 8;
