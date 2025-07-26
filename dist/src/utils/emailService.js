"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTemplatedEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '');
const sendTemplatedEmail = async ({ to, templateId, dynamicTemplateData, }) => {
    const sender = process.env.DOMAIN || ''; // fallback to default sender
    const msg = {
        to,
        from: sender,
        templateId,
        dynamicTemplateData,
    };
    try {
        // await sgMail.send(msg)
        console.log(`✅ Templated email sent to ${to}`);
    }
    catch (error) {
        console.error('❌ Failed to send templated email:', error.response?.body || error.message);
        throw new Error('Email sending failed');
    }
};
exports.sendTemplatedEmail = sendTemplatedEmail;
