/* Instruments */
import { Resolver } from '../types';

const links: Resolver<unknown, { id: string }> = (parent, _, ctx) => {
    return ctx.prisma.user.findUnique({ where: { id: parent.id } }).links();
};

export const User = {
    links,
};
