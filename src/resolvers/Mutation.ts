/* Core */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/* Instruments */
import { Resolver } from '../types';
import { APP_SECRET, getUserId } from '../utils';

const signup: Resolver<{
    email: string;
    password: string;
    name: string;
}> = async (_, args, ctx) => {
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

const login: Resolver<{ email: string; password: string }> = async (
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
        throw new Error('No such user found');
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

const createLink: Resolver<{ url: string; description: string }> = async (
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

    return newLink;
};

const updateLink: Resolver<{ id: string; url: string; description: string }> =
    async (_, args, ctx) => {
        const updatedLink = await ctx.prisma.link.update({
            where: {
                id: args.id,
            },
            data: {
                url: args.url,
                description: args.description,
            },
        });

        return updatedLink;
    };

const deleteLink: Resolver<{ id: string }> = async (_, args, ctx) => {
    try {
        await ctx.prisma.link.delete({
            where: {
                id: args.id,
            },
        });
    } catch (error) {
        console.log(error);

        return false;
    }

    return true;
};

export const Mutation = {
    signup,
    login,
    createLink,
    updateLink,
    deleteLink,
};
