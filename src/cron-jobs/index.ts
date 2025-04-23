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
  console.log(`[CRON] Released expired OTPs at ${now.toISOString()}`)
}

export const deleteOldSchedules = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const formattedToday = `${yyyy}-${mm}-${dd}`
  console.log(today, formattedToday)

  await prisma.schedule.deleteMany({
    where: {
      date: {
        lt: formattedToday,
      },
    },
  })

  console.log(`[CRON] Deleted schedules older than ${formattedToday}`)
}

// Run every 5 minutes
cron.schedule('*/1 * * * *', () => {
  releaseExpiredHoldSlots()
  releaseExpiredOTP()
  // deleteOldSchedules()
})

// Once a day at 12:00 AM
cron.schedule('0 0 * * *', () => {
  deleteOldSchedules()
})
