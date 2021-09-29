/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

export const Post: PostResolvers = {
    postedBy(parent, _, ctx) {
        const postedBy = ctx.prisma.post
            .findUnique({ where: { id: parent.id } })
            .postedBy();

        return postedBy;
    },

    votes(parent, _, ctx) {
        const votes = ctx.prisma.post
            .findUnique({ where: { id: parent.id } })
            .votes();

        return votes;
    },
};

/* Types */
interface PostResolvers {
    postedBy: Resolver<gql.Post>;
    votes: Resolver<gql.Post>;
}
