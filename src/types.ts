/* Core */
import type { GraphQLFieldResolver } from 'graphql';
import type { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import type { Session as ExpressSession } from 'express-session';

export type Resolver<
    TArgs = { [argName: string]: any },
    TSource = undefined,
> = GraphQLFieldResolver<TSource, ResolverCtx, TArgs>;

export interface ResolverCtx {
    req: Request;
    currentUser: JWTPayload | null;
    prisma: PrismaClient;
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

export interface Session extends ExpressSession {
    views: number;
    userId: string | null;
}
