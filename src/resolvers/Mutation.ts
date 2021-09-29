/* Core */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* Instruments */
import { Resolver, EVENT } from '../types';
import * as gql from '../graphql';
import { APP_SECRET } from '../utils';

export const Mutation: MutationResolvers = {
    async signup(_, args, ctx) {
        if (!APP_SECRET) {
            throw new Error('APP_SECRET variable not found!');
        }

        const password = await bcrypt.hash(args.password, 10);

        const isEmailInUse = await ctx.prisma.user.findUnique({
            where: { email: args.email },
        });

        if (isEmailInUse) {
            throw new Error('Email is already in use.');
        }

        const user = await ctx.prisma.user.create({
            data: { ...args, password },
        });

        const token = jwt.sign({ userId: user.id }, APP_SECRET);

        return {
            token,
            user,
        };
    },

    async login(_, args, ctx) {
        if (!APP_SECRET) {
            throw new Error('APP_SECRET variable not found!');
        }

        const user = await ctx.prisma.user.findUnique({
            where: { email: args.email },
        });

        if (!user) {
            throw new Error('No such user found.');
        }

        const isValid = await bcrypt.compare(args.password, user.password);

        if (!isValid) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign({ userId: user.id }, APP_SECRET);

        return {
            token,
            user,
        };
    },

    async createLink(_, args, ctx) {
        if (!ctx.userId) {
            throw new Error('User is not authenticated.');
        }

        const newLink = await ctx.prisma.link.create({
            data: {
                url:         args.url,
                description: args.description,
                postedBy:    {
                    connect: {
                        id: ctx.userId,
                    },
                },
            },
        });

        ctx.pubsub.publish(EVENT.LINK_CREATED, newLink);

        return newLink;
    },

    async updateLink(_, args, ctx) {
        const updatedLink = await ctx.prisma.link.update({
            where: { id: args.id },
            data:  {
                url:         args.url,
                description: args.description,
            },
        });

        return updatedLink;
    },

    async deleteLink(_, args, ctx) {
        try {
            await ctx.prisma.link.delete({
                where: { id: args.id },
            });
        } catch (error) {
            console.log(error);

            return false;
        }

        return true;
    },

    async vote(_, args, ctx) {
        const { userId } = ctx;
        const { linkId } = args;

        if (!userId) {
            throw new Error('User not found');
        }

        const isAlreadyVoted = await ctx.prisma.vote.findUnique({
            where: {
                linkVotedBy: {
                    linkId,
                    userId,
                },
            },
        });

        if (isAlreadyVoted) {
            throw new Error(`Already voted for link: ${args.linkId}`);
        }

        const newVote = ctx.prisma.vote.create({
            data: {
                user: { connect: { id: userId } },
                link: { connect: { id: args.linkId } },
            },
        });

        ctx.pubsub.publish(EVENT.LINK_VOTED, newVote);

        return newVote;
    },
};

/* Types */
interface MutationResolvers {
    signup: Resolver<unknown, gql.MutationSignupArgs>;
    login: Resolver<unknown, gql.MutationLoginArgs>;
    createLink: Resolver<unknown, gql.MutationCreateLinkArgs>;
    updateLink: Resolver<unknown, gql.MutationUpdateLinkArgs>;
    deleteLink: Resolver<unknown, gql.MutationDeleteLinkArgs>;
    vote: Resolver<unknown, gql.MutationVoteArgs>;
}
