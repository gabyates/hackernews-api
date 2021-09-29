/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

export const Query: QueryResolvers = {
    feed: async (_, args, ctx) => {
        const { filter: contains, skip, take } = args;

        const where = contains
            ? { OR: [{ url: { contains } }, { description: { contains } }] }
            : {};

        const links = await ctx.prisma.link.findMany({
            where,
            skip,
            take,
        });

        const count = await ctx.prisma.link.count({ where });

        return { links, count };
    },

    link: (_, args, ctx) => {
        if (!ctx.userId) {
            throw new Error('Not authenticated.');
        }

        return ctx.prisma.link.findUnique({ where: { id: args.id } });
    },
};

interface QueryResolvers {
    feed: Resolver<unknown, gql.QueryFeedArgs>;
    link: Resolver<unknown, gql.QueryLinkArgs>;
}
