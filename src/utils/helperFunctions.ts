import { Response } from 'express'
import * as jwt from 'jsonwebtoken'
import { ApiError } from './ApiError'
import admin from '../../firebase'
import { FCMSendMessageParams } from '../interfaces/userInterface'
import { Message } from 'firebase-admin/messaging';
export const generateTokens = async (data: any) => {
  const accessToken = jwt.sign(
    { data },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  )
  const refreshToken = jwt.sign(
    { data },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  )
  return { accessToken, refreshToken }
}

export const generateOTP = async (): Promise<String> => {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
}

export const otpExpireAfter = () => {
  const currentDate = new Date() // Get current date and time
  currentDate.setMinutes(currentDate.getMinutes() + 10) // Add 10 minutes to current date
  return currentDate // Return the updated date
}

export const initializePushNotification = async (
  { token, title, body }: FCMSendMessageParams
): Promise<string | Error> => {
  const message: Message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    return error as Error; // Typecast error to `Error`
  }
};

export const formatDateUS = (date: Date): string => {
  date = new Date(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()+1).padStart(2, '0');

  return `${month}/${day}/${year}`;
};
