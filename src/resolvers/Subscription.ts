/* Instruments */
import { Resolver, EVENT } from '../types';

const linkCreatedSubscribe: Resolver = (_, __, ctx) => {
    return ctx.pubsub.asyncIterator([ EVENT.LINK_CREATED ]);
};

const linkCreated: Subscriber<Record<any, any>> = {
    subscribe: linkCreatedSubscribe,
    resolve:   (parent, _, ctx) => {
        return {
            ...parent,
            postedBy: ctx.prisma.link
                .findUnique({ where: { id: parent.id } })
                .postedBy(),
        };
    },
};

const linkVotedSubscribe: Resolver = (_, __, ctx) => {
    return ctx.pubsub.asyncIterator([ EVENT.LINK_VOTED ]);
};

const linkVoted: Subscriber = {
    subscribe: linkVotedSubscribe,
    resolve:   parent => {
        return parent;
    },
};

/* Types */
type Subscriber<TParent = unknown> = {
    subscribe: Resolver<TParent>;
    resolve: Resolver<TParent>;
};

export const Subscription = {
    linkCreated,
    linkVoted,
};
