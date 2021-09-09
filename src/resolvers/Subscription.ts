/* Instruments */
import { Resolver, EV } from '../types';

const linkCreatedSubscribe: Resolver = (_, __, ctx) => {
    return ctx.pubsub.asyncIterator([EV.LINK_CREATED]);
};

type Subscriber = {
    subscribe: Resolver;
    resolve: Resolver;
};

const linkCreated: Subscriber = {
    subscribe: linkCreatedSubscribe,
    resolve: parent => {
        return parent;
    },
};

const postVotedSubscribe: Resolver = (_, __, ctx) => {
    return ctx.pubsub.asyncIterator([EV.POST_VOTED]);
};

const postVoted: Subscriber = {
    subscribe: postVotedSubscribe,
    resolve: parent => {
        return parent;
    },
};

export const Subscription = {
    linkCreated,
    postVoted,
};
