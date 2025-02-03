-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expireAfter" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);
