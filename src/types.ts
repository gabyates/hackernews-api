/* Core */
import { GraphQLFieldResolver } from 'graphql';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export type Resolver<
    TArgs = { [argName: string]: any },
    TSource = unknown,
> = GraphQLFieldResolver<
    TSource,
    {
        req: Request;
        userId: string | null;
        prisma: PrismaClient;
    },
    TArgs
>;

export type ServerContext = {
    req: Request & {
        headers: {
            authorization: string;
        };
    };
    res: Response;
};
