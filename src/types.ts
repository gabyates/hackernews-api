/* Core */
import type { GraphQLFieldResolver } from 'graphql';
import type { PubSub } from 'graphql-subscriptions';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export type Resolver<
    TSource = undefined,
    TArgs = { [argName: string]: any },
> = GraphQLFieldResolver<TSource, ResolverCtx, TArgs>;

export interface ResolverCtx {
    req: Request;
    userId: string | null;
    prisma: PrismaClient;
    pubsub: PubSub;
}

export interface ExpressCtx {
    req: Request & {
        headers: { authorization: string };
    };
    res: Response;
}

export enum EVENT {
    POST_CREATED = 'POST_CREATED',
    POST_VOTED = 'POST_VOTED',
}
