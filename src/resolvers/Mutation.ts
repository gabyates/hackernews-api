/* Core */
import bcrypt from 'bcryptjs';

/* Instruments */
import * as utils from '../utils';
import type { Resolver, Session } from '../types';
import type * as gql from '../graphql';

export const Mutation: MutationResolvers = {
    async signup(_, args, ctx) {
        await utils.validateAuth('signup', args);

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

        // const jwtPayload = {
        //     userId:   user.id,
        //     email:    args.email,
        //     password: args.password,
        // };

        // const token = utils.encodeJWTPayload(jwtPayload);

        (ctx.req.session as Session).userId = user.id;

        return user;
    },

    async login(_, args, ctx) {
        await utils.validateAuth('login', args);

        const user = await ctx.prisma.user.findUnique({
            where: { email: args.email },
        });

        if (!user) {
            throw new Error('Wrong email or password.');
        }

        const isPasswordValid = await bcrypt.compare(args.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Wrong email or password.');
        }

        // const jwtPayload = {
        //     userId:   user.id,
        //     email:    args.email,
        //     password: args.password,
        // };

        // const token = utils.encodeJWTPayload(jwtPayload);

        (ctx.req.session as Session).userId = user.id;

        return user;
    },

    logout(_, __, ctx) {
        (ctx.req.session as Session).userId = null;

        return true;
    },

    async updateUser(_, args, ctx) {
        await utils.validateUpdateUser(args);

        const userToUpdate = await ctx.prisma.user.findFirst({
            where: { id: args.id },
        });
        const name = args.name ?? userToUpdate?.name;
        const email = args.email ?? userToUpdate?.email;

        const user = await ctx.prisma.user.update({
            where: { id: args.id },
            data:  { name, email, bio: args.bio },
        });

        return user;
    },

    async createPost(_, args, ctx) {
        await utils.validateCreatePost(args);

        if (!ctx.currentUser) {
            throw new Error('Not authenticated.');
        }

        const newPost = await ctx.prisma.post.create({
            data: {
                url:         args.url,
                description: args.description,
                postedBy:    {
                    connect: {
                        id: ctx.currentUser.userId,
                    },
                },
            },
        });

        return newPost;
    },

    async updatePost(_, args, ctx) {
        if (!ctx.currentUser) {
            throw new Error('Not authenticated.');
        }

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
        if (!ctx.currentUser) {
            throw new Error('Not authenticated.');
        }

        await ctx.prisma.post.delete({
            where: { id: args.id },
        });

        return true;
    },

    async vote(_, args, ctx) {
        if (!ctx.currentUser) {
            throw new Error('Not authenticated.');
        }

        const { postId } = args;
        const { userId } = ctx.currentUser;

        const isAlreadyVoted = await ctx.prisma.vote.findUnique({
            where: { postVotedBy: { postId, userId } },
        });

        if (isAlreadyVoted) {
            throw new Error(`Already voted for post: ${args.postId}`);
        }

        const newVote = await ctx.prisma.vote.create({
            data: {
                user: { connect: { id: userId } },
                post: { connect: { id: args.postId } },
            },
        });

        return newVote;
    },

    async unVote(_, args, ctx) {
        if (!ctx.currentUser) {
            throw new Error('Not authenticated.');
        }

        const { postId } = args;
        const { userId } = ctx.currentUser;

        const isAlreadyVoted = await ctx.prisma.vote.findUnique({
            where: { postVotedBy: { postId, userId } },
        });

        if (!isAlreadyVoted) {
            throw new Error(`Not voted for post: ${args.postId}`);
        }

        const deletedVote = await ctx.prisma.vote.delete({
            where: { id: isAlreadyVoted.id },
        });

        return deletedVote;
    },
};

/* Types */
interface MutationResolvers {
    signup: Resolver<gql.MutationSignupArgs>;
    login: Resolver<gql.MutationLoginArgs>;
    logout: Resolver;

    updateUser: Resolver<gql.MutationUpdateUserArgs>;
    createPost: Resolver<gql.MutationCreatePostArgs>;
    updatePost: Resolver<gql.MutationUpdatePostArgs>;
    deletePost: Resolver<gql.MutationDeletePostArgs>;

    vote: Resolver<gql.MutationVoteArgs>;
    unVote: Resolver<gql.MutationVoteArgs>;
}
