"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constants_1 = require("./constants");
const authentication_1 = require("../middlewares/authentication");
const transactionController_1 = require("../controllers/transactionController");
const transactionRouter = (0, express_1.Router)();
transactionRouter.post(constants_1.GET_USER_TRANSACTION, authentication_1.authentication, transactionController_1.getMyTransactions);
exports.default = { transactionRouter };
