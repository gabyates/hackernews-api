/* Core */
import type { User as PrismaUser } from '@prisma/client';

/* Instruments */
import type { Resolver } from '../types';

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
    posts: Resolver<unknown, PrismaUser>;
    votes: Resolver<unknown, PrismaUser>;
}
