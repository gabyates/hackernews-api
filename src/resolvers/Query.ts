/* Instruments */
import { Resolver } from '../types';

const feed: Resolver = (_, __, ctx) => {
    return ctx.prisma.link.findMany();
};

const link: Resolver<{ id: string }> = async (_, args, ctx) => {
    await ctx.prisma.link.findUnique({
        where: {
            id: args.id,
        },
    });
};

export const Query = {
    feed,
    link,
};
