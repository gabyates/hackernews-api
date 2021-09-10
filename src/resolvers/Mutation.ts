/* Core */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* Instruments */
import { Resolver, EV } from '../types';
import * as gql from '../graphql/index';
import { APP_SECRET } from '../utils';

const signup: Resolver<unknown, gql.MutationSignupArgs> = async (
    _,
    args,
    ctx,
) => {
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
};

const login: Resolver<unknown, gql.MutationLoginArgs> = async (
    _,
    args,
    ctx,
) => {
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
};

const createLink: Resolver<unknown, gql.MutationCreateLinkArgs> = async (
    _,
    args,
    ctx,
) => {
    if (!ctx.userId) {
        throw new Error('User is not authenticated.');
    }

    const newLink = await ctx.prisma.link.create({
        data: {
            url: args.url,
            description: args.description,
            postedBy: {
                connect: {
                    id: ctx.userId,
                },
            },
        },
    });

    ctx.pubsub.publish(EV.LINK_CREATED, newLink);

    return newLink;
};

const updateLink: Resolver<unknown, gql.MutationUpdateLinkArgs> = async (
    _,
    args,
    ctx,
) => {
    const updatedLink = await ctx.prisma.link.update({
        where: { id: args.id as unknown as number },
        data: {
            url: args.url,
            description: args.description,
        },
    });

    return updatedLink;
};

const deleteLink: Resolver<unknown, gql.MutationDeleteLinkArgs> = async (
    _,
    args,
    ctx,
) => {
    try {
        await ctx.prisma.link.delete({
            where: { id: args.id as unknown as number },
        });
    } catch (error) {
        console.log(error);

        return false;
    }

    return true;
};

const vote: Resolver = async (_, args, ctx) => {
    const userId = ctx.userId;

    if (!userId) {
        return null;
    }

    const isAlreadyVoted = await ctx.prisma.vote.findUnique({
        where: {
            linkId_userId: {
                linkId: Number(args.linkId),
                userId: userId,
            },
        },
    });

    if (Boolean(isAlreadyVoted)) {
        throw new Error(`Already voted for link: ${args.linkId}`);
    }

    const newVote = ctx.prisma.vote.create({
        data: {
            user: { connect: { id: userId } },
            link: { connect: { id: Number(args.linkId) } },
        },
    });

    ctx.pubsub.publish(EV.POST_VOTED, newVote);

    return newVote;
};

export const Mutation = {
    signup,
    login,
    createLink,
    updateLink,
    deleteLink,
    vote,
};
