"use strict";
/*
Cron job list
1. Clear unused OTP
2. Clear schedules that are been hold
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOldSchedules = exports.releaseExpiredOTP = exports.releaseExpiredHoldSlots = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const node_cron_1 = __importDefault(require("node-cron"));
// Clear expired holds
const releaseExpiredHoldSlots = async () => {
    const now = new Date();
    await client_1.default.schedule.updateMany({
        where: {
            holdExpiresAt: {
                lt: now, // holdUntil < now
            },
        },
        data: {
            isAvailable: true,
            holdExpiresAt: null,
        },
    });
    console.log(`[CRON] Released expired holds at ${now.toISOString()}`);
};
exports.releaseExpiredHoldSlots = releaseExpiredHoldSlots;
const releaseExpiredOTP = async () => {
    const now = new Date();
    await client_1.default.otp.deleteMany({
        where: {
            expireAfter: {
                lt: now, // holdUntil < now
            },
        },
    });
    console.log(`[CRON] Released expired OTPs at ${now.toISOString()}`);
};
exports.releaseExpiredOTP = releaseExpiredOTP;
const deleteOldSchedules = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    console.log(today, formattedToday);
    await client_1.default.schedule.deleteMany({
        where: {
            date: {
                lt: formattedToday,
            },
        },
    });
    console.log(`[CRON] Deleted schedules older than ${formattedToday}`);
};
exports.deleteOldSchedules = deleteOldSchedules;
// Run every 5 minutes
node_cron_1.default.schedule('*/5 * * * *', () => {
    (0, exports.releaseExpiredHoldSlots)();
    (0, exports.releaseExpiredOTP)();
    // deleteOldSchedules()
});
// Once a day at 12:00 AM
node_cron_1.default.schedule('0 0 * * *', () => {
    (0, exports.deleteOldSchedules)();
});
