/* Instruments */
import { Resolver } from '../types';

const postedBy: Resolver<unknown, { id: string }> = (parent, _, ctx) => {
    return ctx.prisma.link.findUnique({ where: { id: parent.id } }).postedBy();
};

export const Link = {
    postedBy,
};
