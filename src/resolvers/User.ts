/* Core */
import { User as TUser } from '@prisma/client';

/* Instruments */
import { Resolver } from '../types';

export const User: UserResolvers = {
    async posts(parent, _, ctx) {
        const posts = await ctx.prisma.user
            .findUnique({ where: { id: parent.id } })
            .posts();

        return posts;
    },
    async votes(parent, _, ctx) {
        const votes = await ctx.prisma.user
            .findUnique({ where: { id: parent.id } })
            .votes();

        return votes;
    },
};

interface UserResolvers {
    posts: Resolver<TUser>;
    votes: Resolver<TUser>;
}
