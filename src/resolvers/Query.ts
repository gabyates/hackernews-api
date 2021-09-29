/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

export const Query: QueryResolvers = {
    async feed(_, args, ctx) {
        const { filter: contains, skip, take } = args;

        const where = contains
            ? { OR: [{ url: { contains } }, { description: { contains } }] }
            : {};

        const posts = await ctx.prisma.post.findMany({
            where,
            skip: skip ?? 0,
            take: take ?? 20,
        });

        const count = await ctx.prisma.post.count({ where });

        return { posts, count };
    },

    async post(_, args, ctx) {
        if (!ctx.userId) {
            throw new Error('Not authenticated.');
        }

        const post = await ctx.prisma.post.findUnique({
            where: { id: args.id },
        });

        return post;
    },

    async user(_, args, ctx) {
        const user = await ctx.prisma.user.findUnique({
            where: { id: args.id },
        });

        return user;
    },
};

/* Types */
interface QueryResolvers {
    feed: Resolver<undefined, gql.QueryFeedArgs>;
    post: Resolver<undefined, gql.QueryPostArgs>;
    user: Resolver<undefined, gql.QueryUserArgs>;
}
