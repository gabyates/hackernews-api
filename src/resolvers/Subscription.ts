/* Instruments */
import { Resolver } from '../types';

const linkCreatedSubscribe: Resolver = (_, __, ctx) => {
    return ctx.pubsub.asyncIterator(['LINK_CREATED']);
};

const linkCreated = {
    subscribe: linkCreatedSubscribe,
    resolve: (payload: any) => {
        return payload;
    },
};

const postVotedSubscribe: Resolver = (_, __, ctx) => {
    return ctx.pubsub.asyncIterator(['NEW_VOTE']);
};

const postVoted = {
    subscribe: postVotedSubscribe,
    resolve: (payload: any) => {
        return payload;
    },
};

export const Subscription = {
    linkCreated,
    postVoted,
};
