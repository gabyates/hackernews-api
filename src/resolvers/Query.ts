/* Instruments */
import { Resolver } from '../types';

const feed: Resolver<
    unknown,
    { filter: string; skip: number; take: number; orderBy: any }
> = async (_, args, ctx) => {
    if (!ctx.userId) {
        throw new Error('Not authenticated.');
    }

    const { filter: contains, skip, take, orderBy } = args;

    const where = args.filter
        ? { OR: [{ url: { contains } }, { description: { contains } }] }
        : {};

    const links = await ctx.prisma.link.findMany({
        where,
        skip,
        take,
        orderBy,
    });

    const count = await ctx.prisma.link.count({ where });

    return { links, count };
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
