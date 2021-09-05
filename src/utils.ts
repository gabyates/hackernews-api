/* Core */
import jwt from 'jsonwebtoken';

export const { APP_SECRET } = process.env;

const getTokenPayload = (token: string) => {
    if (!APP_SECRET) {
        throw new Error('APP_SECRET variable not found!');
    }

    const tokenPayload = jwt.verify(token, APP_SECRET);

    console.log('tokenPayload', tokenPayload);

    return tokenPayload;
};

// @ts-ignore
export const getUserId = (authHeader: ?string, authToken?: string) => {
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            throw new Error('No token found');
        }

        // @ts-ignore
        const { userId } = getTokenPayload(token);

        return userId;
    } else if (authToken) {
        // @ts-ignore
        const { userId } = getTokenPayload(authToken);

        return userId;
    }

    // throw new Error('Not authenticated');
};
