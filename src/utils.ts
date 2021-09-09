/* Core */
import jwt from 'jsonwebtoken';

export const { APP_SECRET } = process.env;

const getTokenPayload = (token: string) => {
    if (!APP_SECRET) {
        throw new Error('APP_SECRET variable not found!');
    }

    const jwtPayload = jwt.verify(token, APP_SECRET) as { userId: string };

    return jwtPayload.userId;
};

export const getUserId = (authHeader: string, authToken?: string) => {
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            throw new Error('No token found');
        }

        const userId = getTokenPayload(token);

        return userId;
    } else if (authToken) {
        const userId = getTokenPayload(authToken);

        return userId;
    }
};
