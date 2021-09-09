/* Instruments */
import { Resolver } from '../types';

const link: Resolver<{ id: number }> = (parent, _, ctx) => {
    return ctx.prisma.vote.findUnique({ where: { id: parent.id } }).link();
};

const user: Resolver<{ id: number }> = (parent, _, ctx) => {
    return ctx.prisma.vote.findUnique({ where: { id: parent.id } }).user();
};

export const Vote = { link, user };
