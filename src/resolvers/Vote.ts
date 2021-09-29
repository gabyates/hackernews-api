/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

export const Vote: VoteProps = {
    async post(vote, _, ctx) {
        const post = await ctx.prisma.vote
            .findUnique({ where: { id: vote.id } })
            .post();

        return post;
    },

    async user(vote, _, ctx) {
        const user = await ctx.prisma.vote
            .findUnique({ where: { id: vote.id } })
            .user();
        return user;
    },
};

/* Types */
interface VoteProps {
    post: Resolver<gql.Vote>;
    user: Resolver<gql.Vote>;
}
