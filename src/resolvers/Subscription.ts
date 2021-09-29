/* Core */
import { Post, Vote } from '@prisma/client';

/* Instruments */
import { Resolver, EVENT } from '../types';

export const Subscription: SubscriptionResolvers = {
    postCreated: {
        subscribe(_, __, ctx) {
            return ctx.pubsub.asyncIterator([ EVENT.POST_CREATED ]);
        },
        async resolve(post, _, ctx) {
            const postedBy = await ctx.prisma.post
                .findUnique({ where: { id: post.id } })
                .postedBy();

            return {
                ...post,
                postedBy,
            };
        },
    },
    postVoted: {
        subscribe(_, __, ctx) {
            return ctx.pubsub.asyncIterator([ EVENT.POST_VOTED ]);
        },
        async resolve(parent, __, ctx) {
            const [ post, user ] = await Promise.all([
                ctx.prisma.post.findUnique({
                    where: { id: parent.postId },
                }),
                ctx.prisma.user.findUnique({
                    where: { id: parent.userId },
                }),
            ]);

            return {
                id: parent.id,
                post,
                user,
            };
        },
    },
};

/* Types */
type Subscriber<TParent = Record<string, any>> = {
    subscribe: Resolver;
    resolve: Resolver<TParent>;
};

interface SubscriptionResolvers {
    postCreated: Subscriber<Post>;
    postVoted: Subscriber<Vote>;
}
