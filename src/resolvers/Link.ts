/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

export const Link: LinkResolvers = {
    postedBy(parent, _, ctx) {
        const postedBy = ctx.prisma.link
            .findUnique({ where: { id: parent.id } })
            .postedBy();

        return postedBy;
    },

    votes(parent, _, ctx) {
        const votes = ctx.prisma.link
            .findUnique({ where: { id: parent.id } })
            .votes();

        return votes;
    },
};

/* Types */
interface LinkResolvers {
    postedBy: Resolver<gql.Link>;
    votes: Resolver<gql.Link>;
}
