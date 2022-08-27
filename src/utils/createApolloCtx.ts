/* Core */
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';

/* Instruments */
import { decodeJWTPayload } from './jwt';
import type { ExpressCtx } from '../types';

const prisma = new PrismaClient();

export const createApolloCtx = (ctx: ExpressCtx) => {
    const { req } = ctx;

    let operationName = req.body?.operationName;

    if (typeof operationName === 'undefined') {
        if (req.body?.query.includes('IntrospectionQuery')) {
            operationName = 'IntrospectionQuery';
        }
    }

    console.log(chalk.blueBright('Root CTX, operation name:', chalk.redBright(operationName)));

    const currentUser = decodeJWTPayload(req.headers.authorization, ctx.req.body?.operationName);

    // req.session;

    return { req, prisma, currentUser };
};
