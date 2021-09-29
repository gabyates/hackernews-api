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

    async createPost(_, args, ctx) {
        if (!ctx.userId) {
            throw new Error('User is not authenticated.');
        }

        const newPost = await ctx.prisma.post.create({
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

        ctx.pubsub.publish(EVENT.POST_CREATED, newPost);

        return newPost;
    },

    async updatePost(_, args, ctx) {
        const updatedPost = await ctx.prisma.post.update({
            where: { id: args.id },
            data:  {
                url:         args.url,
                description: args.description,
            },
        });

        return updatedPost;
    },

    async deletePost(_, args, ctx) {
        await ctx.prisma.post.delete({
            where: { id: args.id },
        });

        return true;
    },

    async vote(_, args, ctx) {
        const { userId } = ctx;
        const { postId } = args;

        if (!userId) {
            throw new Error('User not found');
        }

        const isAlreadyVoted = await ctx.prisma.vote.findUnique({
            where: {
                postVotedBy: {
                    postId,
                    userId,
                },
            },
        });

        if (isAlreadyVoted) {
            throw new Error(`Already voted for link: ${args.postId}`);
        }

        const newVote = ctx.prisma.vote.create({
            data: {
                user: { connect: { id: userId } },
                post: { connect: { id: args.postId } },
            },
        });

        ctx.pubsub.publish(EVENT.POST_VOTED, newVote);

        return newVote;
    },
};

/* Types */
interface MutationResolvers {
    signup: Resolver<undefined, gql.MutationSignupArgs>;
    login: Resolver<undefined, gql.MutationLoginArgs>;
    createPost: Resolver<undefined, gql.MutationCreatePostArgs>;
    updatePost: Resolver<undefined, gql.MutationUpdatePostArgs>;
    deletePost: Resolver<undefined, gql.MutationDeletePostArgs>;
    vote: Resolver<undefined, gql.MutationVoteArgs>;
}
