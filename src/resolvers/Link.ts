/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

const postedBy: Resolver<gql.Link> = (parent, _, ctx) => {
    return ctx.prisma.link
        .findUnique({ where: { id: parent.id as unknown as number } })
        .postedBy();
};

const votes: Resolver<gql.Link> = (parent, _, ctx) => {
    return ctx.prisma.link
        .findUnique({ where: { id: parent.id as unknown as number } })
        .votes();
};

export const Link = {
    postedBy,
    votes,
};
