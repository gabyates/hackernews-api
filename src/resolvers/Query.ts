/* Instruments */
import { Resolver } from '../types';

const feed: Resolver = (_, __, ctx) => {
    if (!ctx.userId) {
        throw new Error('Not authenticated.');
    }

    return ctx.prisma.link.findMany();
};

const link: Resolver<{ id: number }> = (_, args, ctx) => {
    if (!ctx.userId) {
        throw new Error('Not authenticated.');
    }

    return ctx.prisma.link.findUnique({
        where: {
            id: args.id,
        },
    });
};

export const Query = {
    feed,
    link,
};
