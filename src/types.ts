/* Core */
import type { GraphQLFieldResolver } from 'graphql';
import type { PubSub } from 'graphql-subscriptions';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export type Resolver<
    TSource = unknown,
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
    LINK_CREATED = 'LINK_CREATED',
    LINK_VOTED = 'LINK_VOTED',
}
