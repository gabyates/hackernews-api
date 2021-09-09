/* Instruments */
import { Resolver } from '../types';

const postedBy: Resolver<{ id: number }> = (parent, _, ctx) => {
    return ctx.prisma.link.findUnique({ where: { id: parent.id } }).postedBy();
};

const votes: Resolver<{ id: number }> = (parent, _, ctx) => {
    return ctx.prisma.link.findUnique({ where: { id: parent.id } }).votes();
};

export const Link = {
    postedBy,
    votes,
};
