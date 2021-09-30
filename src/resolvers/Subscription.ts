/* Core */
import type { Post as PrismaPost, Vote as PrismaVote } from '@prisma/client';
import chalk from 'chalk';

/* Instruments */
import { Resolver, EVENT } from '../types';

export const Subscription: SubscriptionResolvers = {
    postCreated: {
        subscribe(_, __, ctx, info) {
            logOperation(info.fieldName, 'subscribe');

            return ctx.pubsub.asyncIterator([ EVENT.POST_CREATED ]);
        },
        async resolve(post, _, ctx, info) {
            logOperation(info.fieldName, 'resolve');

            const postedBy = await ctx.prisma.post
                .findUnique({ where: { id: post.id } })
                .postedBy();

            if (postedBy === null) {
                throw new Error('User for a created post was not found.');
            }

            return {
                ...post,
                postedBy,
            };
        },
    },
    postVoted: {
        subscribe(_, __, ctx, info) {
            logOperation(info.fieldName, 'subscribe');

            return ctx.pubsub.asyncIterator([ EVENT.POST_VOTED ]);
        },
        async resolve(vote, __, ctx, info) {
            logOperation(info.fieldName, 'resolve');

            const [ post, user ] = await Promise.all([
                ctx.prisma.post.findUnique({
                    where: { id: vote.postId },
                }),
                ctx.prisma.user.findUnique({
                    where: { id: vote.userId },
                }),
            ]);

            if (post === null || user === null) {
                throw new Error('Post or User for Vote was not found.');
            }

            return {
                id: vote.id,
                post,
                user,
            };
        },
    },
};

/* Helpers */
function logOperation(
    fieldName: string,
    operationType: 'subscribe' | 'resolve',
) {
    const message = operationType === 'subscribe'
        ? 'subscriber is ready to resolve'
        : 'resolver triggered';

    console.log(
        chalk.yellow('∞'),
        chalk.redBright(fieldName),
        chalk.white(message),
    );
}

/* Types */
type Subscriber<TArgs, TParent = Record<string, any>> = {
    subscribe: Resolver;
    resolve: Resolver<TArgs, TParent>;
};

interface SubscriptionResolvers {
    postCreated: Subscriber<unknown, PrismaPost>;
    postVoted: Subscriber<unknown, PrismaVote>;
}
