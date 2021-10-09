/* Instruments */
import type { Resolver } from '../types';
import * as gql from '../graphql';
import { decodeJWTPayload } from '../utils';

export const Query: QueryResolvers = {
    async feed(_, args, ctx) {
        const { filter: contains, skip, take } = args;

        const where = contains
            ? { OR: [{ url: { contains } }, { description: { contains } }] }
            : {};

        const orderBy: unknown[] = [
            {
                createdAt:
                    args.orderBy?.createdAt === gql.Order_By_Enum.Asc
                        ? 'asc'
                        : 'desc',
            },
        ];

        if (args.orderBy?.voteCount) {
            orderBy.unshift({
                votes: {
                    _count:
                        args.orderBy?.voteCount === gql.Order_By_Enum.Asc
                            ? 'asc'
                            : 'desc',
                },
            });
        }

        const posts = await ctx.prisma.post.findMany({
            where,
            skip: skip ?? 0,
            take: take ?? 5,
            // @ts-ignore
            orderBy,
        });

        const count = await ctx.prisma.post.count({ where });

        return { posts, count };
    },

    async post(_, args, ctx) {
        const post = await ctx.prisma.post.findUnique({
            where: { id: args.id },
        });

        if (post === null) {
            throw new Error('Post was not found.');
        }

        return post;
    },

    async users(_, __, ctx) {
        const users = await ctx.prisma.user.findMany();

        if (users === null) {
            throw new Error('User was not found.');
        }

        return users;
    },

    async user(_, args, ctx) {
        const user = await ctx.prisma.user.findUnique({
            where: { id: args.id },
        });

        if (user === null) {
            throw new Error('User was not found.');
        }

        return user;
    },

    async authenticate(_, args, ctx) {
        const jwtPayload = decodeJWTPayload(args.token);

        if (jwtPayload) {
            const user = await ctx.prisma.user.findUnique({
                where: { id: jwtPayload.userId },
            });

            if (user) {
                return user;
            }
        }

        return null;
    },
};

/* Types */
interface QueryResolvers {
    feed: Resolver<gql.QueryFeedArgs>;
    post: Resolver<gql.QueryPostArgs>;
    users: Resolver;
    user: Resolver<gql.QueryUserArgs>;
    authenticate: Resolver<gql.QueryAuthenticateArgs>;
}
