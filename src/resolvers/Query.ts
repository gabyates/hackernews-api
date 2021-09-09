/* Instruments */
import { Resolver } from '../types';

const feed: Resolver<unknown, { filter: string; skip: number; take: number }> =
    async (_, args, ctx) => {
        if (!ctx.userId) {
            throw new Error('Not authenticated.');
        }

        const { filter: contains, skip, take } = args;

        const where = args.filter
            ? { OR: [{ url: { contains } }, { description: { contains } }] }
            : {};

        const links = await ctx.prisma.link.findMany({ where, skip, take });

        return links;
    };

const link: Resolver<{ id: number }> = (_, args, ctx) => {
    if (!ctx.userId) {
        throw new Error('Not authenticated.');
    }

    return ctx.prisma.link.findUnique({ where: { id: args.id } });
};

export const Query = {
    feed,
    link,
};
