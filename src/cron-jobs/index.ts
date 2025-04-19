/*
Cron job list
1. Clear unused OTP
2. Clear schedules that are been hold
*/

import prisma from '../prisma/client'
import cron from 'node-cron'

// Clear expired holds
export const releaseExpiredHoldSlots = async () => {
  const now = new Date()

  await prisma.schedule.updateMany({
    where: {
      holdExpiresAt: {
        lt: now, // holdUntil < now
      },
      isAvailable: false,
    },
    data: {
      isAvailable: true,
      holdExpiresAt: null,
    },
  })
  console.log(`[CRON] Released expired holds at ${now.toISOString()}`)
}

export const releaseExpiredOTP = async () => {
  const now = new Date()
  await prisma.otp.deleteMany({
    where: {
      expireAfter: {
        lt: now, // holdUntil < now
      },
    },
  })
  console.log(`[CRON] Released expired OTPs at ${now.toISOString()}`) }

// Run every 5 minutes
cron.schedule('*/1 * * * *', () => {
  releaseExpiredHoldSlots()
  releaseExpiredOTP()
})
