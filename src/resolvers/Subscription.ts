/* Instruments */
import { Resolver, EV } from '../types';

const linkCreatedSubscribe: Resolver = (_, __, ctx) => {
    console.log('link created subscribe');
    return ctx.pubsub.asyncIterator([EV.LINK_CREATED]);
};

const linkCreated: Subscriber<Record<any, any>> = {
    subscribe: linkCreatedSubscribe,
    resolve: (parent, _, ctx) => {
        console.log('link created resolve');
        return {
            ...parent,
            postedBy: ctx.prisma.link
                .findUnique({ where: { id: parent.id } })
                .postedBy(),
        };
    },
};

const linkVotedSubscribe: Resolver = (_, __, ctx) => {
    console.log('link voted subscribe');

    return ctx.pubsub.asyncIterator([EV.LINK_VOTED]);
};

const linkVoted: Subscriber = {
    subscribe: linkVotedSubscribe,
    resolve: parent => {
        console.log('link voted resolve');
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
