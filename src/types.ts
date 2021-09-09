/* Core */
import { GraphQLFieldResolver } from 'graphql';
import type { PubSub } from 'graphql-subscriptions';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export type Resolver<
    TSource = unknown,
    TArgs = { [argName: string]: any },
> = GraphQLFieldResolver<
    TSource,
    {
        req: Request;
        userId: number | null;
        prisma: PrismaClient;
        pubsub: PubSub;
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

// export type EV = 'LINK_CREATED' | 'POST_VOTED';
export enum EV {
    LINK_CREATED = 'LINK_CREATED',
    POST_VOTED = 'POST_VOTED',
}
