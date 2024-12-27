import * as jwt from 'jsonwebtoken';
export const generateTokens = async (data: any) => {
    const accessToken = jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ data }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken }
}