import * as jwt from 'jsonwebtoken';
export const generateTokens = async (data: any) => {
    const accessToken = jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ data }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken }
}

export const generateOTP = async (): Promise<number> => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

export const otpExpireAfter = () => {
    const currentDate = new Date(); // Get current date and time
    currentDate.setMinutes(currentDate.getMinutes() + 10); // Add 10 minutes to current date
    return currentDate; // Return the updated date
};