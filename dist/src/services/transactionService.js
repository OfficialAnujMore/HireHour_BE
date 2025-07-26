"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../prisma/client"));
const getMyTransactions = async (userId) => {
    return await client_1.default.transaction.findMany({
        where: {
            userId: userId,
        },
        include: {
            transactionItems: true, // Assuming you have a service relation
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
const storeTransaction = async (userId, cartItems, paymentDetails) => {
    const { tax, totalAmount, transactionType, paymentId, paymentStatus } = paymentDetails;
    const transaction = await client_1.default.transaction.create({
        data: {
            userId,
            paymentId,
            transactionType,
            paymentStatus,
            totalAmount: parseFloat(totalAmount),
            tax: parseFloat(tax),
            transactionItems: {
                create: cartItems.map((item) => ({
                    serviceId: item.serviceId,
                    serviceTitle: item.title,
                    servicePrice: item.pricing,
                    serviceProviderId: item.userId,
                    venue: item.venue,
                    meetingUrl: item.meetingUrl,
                    address: item.addressInfo.address,
                    city: item.addressInfo.city,
                    postalCode: item.addressInfo.postalCode,
                    state: item.addressInfo.state,
                    country: item.addressInfo.country,
                    schedules: {
                        create: item.schedule.map((s) => ({
                            scheduleId: s.id,
                            date: new Date(s.date),
                        })),
                    },
                })),
            },
        },
        include: {
            transactionItems: {
                include: {
                    schedules: true,
                },
            },
        },
    });
    console.log('Transaction created:', transaction);
    return transaction;
};
exports.default = {
    storeTransaction,
    getMyTransactions,
};
