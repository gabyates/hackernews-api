/* Instruments */
import * as gql from '../graphql';
import { Resolver } from '../types';

export const User: UserResolvers = {
    links(parent, _, ctx) {
        const user = ctx.prisma.user
            .findUnique({ where: { id: parent.id } })
            .links();

        return user;
    },
};

interface UserResolvers {
    links: Resolver<gql.User>;
}
