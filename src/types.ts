/* Core */
import type { GraphQLFieldResolver } from 'graphql';
import type { PubSub } from 'graphql-subscriptions';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';

export type Resolver<
    TArgs = { [argName: string]: any },
    TSource = undefined,
> = GraphQLFieldResolver<TSource, ResolverCtx, TArgs>;

export interface ResolverCtx {
    req: Request;
    currentUser: JWTPayload | null;
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

export interface JWTPayload {
    userId: string;
    email: string;
    password: string;
}
