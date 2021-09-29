/* Core */
import { join } from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: join(__dirname, '../.env.development.local') });

/* eslint-disable-next-line prefer-destructuring */
export const APP_SECRET = process.env.APP_SECRET;

const getTokenPayload = (token: string) => {
    if (!APP_SECRET) {
        throw new Error('APP_SECRET variable not found!');
    }

    let userId = null;

    try {
        const jwtPayload = jwt.verify(token, APP_SECRET) as { userId: string };

        userId = jwtPayload.userId;
    } catch (error) {
        console.log(error);
    }

    return userId;
};

export const getUserId = (authHeader: string | null, authToken?: string) => {
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            throw new Error('No token found');
        }

        const userId = getTokenPayload(token);

        return userId;
    }
    if (authToken) {
        const token = authToken.replace('Bearer ', '');

        const userId = getTokenPayload(token);

        return userId;
    }

    return null;
};
